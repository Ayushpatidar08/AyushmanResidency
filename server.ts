import express, { Request, Response, NextFunction } from "express";
import crypto from 'crypto';
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import multer from "multer";
import * as sib from 'sib-api-v3-sdk';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import compression from 'compression';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

dotenv.config({ override: true });
console.log(`[SERVER] Environment: ${process.env.NODE_ENV}`);

// CRITICAL: Refuse to start without a proper JWT secret
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('CRITICAL: JWT_SECRET must be set in .env and be at least 32 characters.');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// HTML sanitizer — strips all tags to prevent injection in emails
function sanitizeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

//  Brevo Email Setup 
const SibApi = (sib.default || sib) as any;
const defaultClient = SibApi.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY || '';
const apiInstance = new SibApi.TransactionalEmailsApi();

async function sendLeadEmail(lead: any) {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_ADMIN_EMAIL || !process.env.BREVO_SENDER_EMAIL) {
    console.warn("[BREVO] Missing configuration. Lead not emailed.");
    return;
  }
  const sendSmtpEmail = new SibApi.SendSmtpEmail();
  sendSmtpEmail.subject = "New High-Value Lead: " + sanitizeHtml(lead.name);
  sendSmtpEmail.sender = { name: "Ayushmaan Residency", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: process.env.BREVO_ADMIN_EMAIL, name: "Admin" }];
  const sName = sanitizeHtml(lead.name);
  const sPhone = sanitizeHtml(lead.phone);
  const sPropType = sanitizeHtml(lead.property_type);
  const sLocPref = sanitizeHtml(lead.location_pref || 'Not specified');
  const sBudget = sanitizeHtml(lead.budget || 'N/A');
  const sOffers = Array.isArray(lead.claimed_offers) ? lead.claimed_offers.map(sanitizeHtml).join(', ') : sanitizeHtml(lead.claimed_offers || 'None');
  const sBroker = sanitizeHtml(lead.broker || 'Pending Assignment');
  const sMessage = sanitizeHtml(lead.message || 'No additional details');
  const sReferral = sanitizeHtml(lead.referral || 'Direct Entry');
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #c9a050; border-bottom: 2px solid #c9a050; padding-bottom: 10px;">New Property Inquiry</h2>
      <p style="font-size: 16px; color: #333;">A new lead has been captured from the Ayushmaan Residency website.</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr style="background-color: #f9f9f9;"><th style="text-align: left; padding: 12px; border: 1px solid #ddd; width: 35%;">Name</th><td style="padding: 12px; border: 1px solid #ddd;">${sName}</td></tr>
        <tr><th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Phone</th><td style="padding: 12px; border: 1px solid #ddd;"><a href="tel:${sPhone}" style="color: #c9a050; font-weight: bold;">${sPhone}</a></td></tr>
        <tr style="background-color: #f9f9f9;"><th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Property Type</th><td style="padding: 12px; border: 1px solid #ddd;">${sPropType}</td></tr>
        <tr><th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Location Pref.</th><td style="padding: 12px; border: 1px solid #ddd;">${sLocPref}</td></tr>
        <tr style="background-color: #f9f9f9;"><th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Budget</th><td style="padding: 12px; border: 1px solid #ddd;">${sBudget}</td></tr>
        <tr><th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Claimed Offers</th><td style="padding: 12px; border: 1px solid #ddd; color: #c9a050; font-weight: bold;">${sOffers}</td></tr>
        <tr style="background-color: #f9f9f9;"><th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Assigned Broker</th><td style="padding: 12px; border: 1px solid #ddd;">${sBroker}</td></tr>
        <tr><th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Message</th><td style="padding: 12px; border: 1px solid #ddd;">${sMessage}</td></tr>
        <tr style="background-color: #f9f9f9;"><th style="text-align: left; padding: 12px; border: 1px solid #ddd;">Referral</th><td style="padding: 12px; border: 1px solid #ddd;">${sReferral}</td></tr>
      </table>
    </div>
  `;
  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[BREVO] Lead notification sent for ${lead.name}`);
  } catch (error: any) {
    console.error("[BREVO] Failed to send lead notification:", error?.response?.body || error);
  }
}

async function sendOTPEmail(toEmail: string, toName: string, otp: string) {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_SENDER_EMAIL) {
    console.warn("[BREVO] Missing config for OTP email. Code not sent.");
    return;
  }
  const sendSmtpEmail = new SibApi.SendSmtpEmail();
  sendSmtpEmail.subject = "Password Reset Verification Code";
  sendSmtpEmail.sender = { name: "Ayushmaan Residency", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: toEmail, name: toName }];
  sendSmtpEmail.htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #c9a050; border-radius: 8px;">
      <h2 style="color: #c9a050;">Reset Your Password</h2>
      <p>Hello ${sanitizeHtml(toName)},</p>
      <p>Your verification code is: <strong style="font-size: 24px; letter-spacing: 5px; color: #111; display: block; margin: 20px 0; background: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #eee;">${otp}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;
  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`[AUTH] OTP verification code sent via email to ${toEmail}`);
  } catch (err: any) {
    console.error("[AUTH] Failed to send OTP email:", err?.response?.body || err);
  }
}

async function sendDeveloperEmail(contact: { name: string, email: string, details: string }) {
  if (!process.env.BREVO_API_KEY || !process.env.DEVELOPER_EMAIL || !process.env.BREVO_SENDER_EMAIL) return;
  const sendSmtpEmail = new SibApi.SendSmtpEmail();
  sendSmtpEmail.subject = "New Developer Project Inquiry: " + sanitizeHtml(contact.name);
  sendSmtpEmail.sender = { name: "Ayushmaan Dev Portal", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: process.env.DEVELOPER_EMAIL, name: "Developer" }];
  sendSmtpEmail.htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #333;">
      <h2 style="color: #000; border-bottom: 2px solid #D4AF37;">New Inquiry</h2>
      <p><strong>Name:</strong> ${sanitizeHtml(contact.name)}</p>
      <p><strong>Email:</strong> ${sanitizeHtml(contact.email)}</p>
      <p><strong>Details:</strong></p>
      <div style="background: #f9f9f9; padding: 10px; border-radius: 4px;">${sanitizeHtml(contact.details)}</div>
    </div>
  `;
  try { await apiInstance.sendTransacEmail(sendSmtpEmail); } catch {}
}

async function sendBrokerCredentialsEmail(brokerName: string, password: string) {
  if (!process.env.BREVO_API_KEY || !process.env.BREVO_ADMIN_EMAIL || !process.env.BREVO_SENDER_EMAIL) return;
  const sendSmtpEmail = new SibApi.SendSmtpEmail();
  sendSmtpEmail.subject = "New Broker Account Created: " + brokerName;
  sendSmtpEmail.sender = { name: "Ayushmaan Residency", email: process.env.BREVO_SENDER_EMAIL };
  sendSmtpEmail.to = [{ email: process.env.BREVO_ADMIN_EMAIL, name: "Admin" }];
  sendSmtpEmail.htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #c9a050; border-radius: 8px;">
      <h2 style="color: #c9a050;">Broker Credentials</h2>
      <p>A new broker account has been created successfully.</p>
      <p><strong>Username:</strong> ${sanitizeHtml(brokerName)}</p>
      <p><strong>Initial Password:</strong> <code style="background: #f4f4f4; padding: 4px 8px; border-radius: 4px;">${sanitizeHtml(password)}</code></p>
      <p>Please share these credentials with the broker.</p>
    </div>
  `;
  try { await apiInstance.sendTransacEmail(sendSmtpEmail); } catch {}
}

//  Database Setup (MongoDB) 

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("CRITICAL: MONGODB_URI is not set in .env.");
  process.exit(1);
}

// Auto Increment Helper
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema) as any;

async function getNextSeq(name: string): Promise<number> {
  const counter = await Counter.findByIdAndUpdate(name, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return counter.seq;
}

// Mongoose Schemas (Mapped perfectly to SQLite structure)
mongoose.set('toJSON', {
  virtuals: true,
  transform: (doc: any, converted: any) => {
    converted.id = converted._id;
    delete converted._id;
    delete converted.__v;
  }
});

const userSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  role: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  broker_id: { type: Number, default: null }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });
const User = mongoose.model('User', userSchema) as any;

const brokerSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, required: true },
  area: { type: String, default: '' },
  is_active: { type: Number, default: 1 }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });
const Broker = mongoose.model('Broker', brokerSchema) as any;

const leadSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  phone: { type: String, required: true },
  property_type: { type: String, required: true },
  location_pref: { type: String, default: '' },
  budget: { type: String, default: '' },
  message: { type: String, default: '' },
  claimed_offers: { type: String, default: "[]" },
  referral: { type: String, default: '' },
  status: { type: String, default: 'pending' },
  assigned_broker_id: { type: Number, default: null },
  last_connect_date: { type: String, default: null },
  is_deleted_for_brokers: { type: Boolean, default: false },
  is_hidden_for_admin: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });
const Lead = mongoose.model('Lead', leadSchema) as any;

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});
const Setting = mongoose.model('Setting', settingSchema) as any;

const cmsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, default: '' }
});
const CMS = mongoose.model('CMS', cmsSchema) as any;

const clientDocumentSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  broker_id: { type: Number, required: true },
  lead_id: { type: Number, required: true },
  file_name: { type: String, required: true },
  file_url: { type: String, required: true }
}, { timestamps: { createdAt: 'uploaded_at', updatedAt: false } });
const ClientDocument = mongoose.model('ClientDocument', clientDocumentSchema) as any;

const siteVisitSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  broker_id: { type: Number, required: true },
  lead_id: { type: Number, required: true },
  visit_date: { type: String, required: true },
  notes: { type: String, default: '' },
  status: { type: String, default: 'scheduled' }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });
const SiteVisit = mongoose.model('SiteVisit', siteVisitSchema) as any;

// Connection logic setup with increased resilience for Atlas
mongoose.connect(MONGODB_URI, { 
  serverSelectionTimeoutMS: 10000,
  family: 4 
})
  .then(() => console.log('✅ MongoDB connected securely via Mongoose'))
  .catch(err => { 
    console.error('❌ MongoDB Connection Error:', err); 
    process.exit(1); 
  });

// DB Cleanup
const cleanup = () => {
  console.log("Closing database connection...");
  mongoose.connection.close();
  process.exit(0);
};
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (err) => { console.error("Uncaught Exception:", err); });
process.on('unhandledRejection', (reason, promise) => { console.error("Unhandled Rejection at:", promise, "reason:", reason); });

//  Cloudinary & File Upload Setup 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ayushmaan_assets',
    resource_type: 'auto',
    allowed_formats: ['jpg', 'png', 'webp', 'pdf', 'gif', 'mp4', 'mov'],
  } as any,
});

// File upload security: MIME whitelist + size limit
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf', 'video/mp4', 'video/quicktime'];
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Allowed: JPG, PNG, WebP, GIF, PDF, MP4, MOV'));
  }
});
const uploadDir = path.join(__dirname, 'public', 'uploads');

// Seed Initial Data wrapper
async function seedDefaultData() {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const adminInitialPassword = process.env.ADMIN_INITIAL_PASSWORD;
    if (adminInitialPassword) {
      console.log("[AUTH] Seeding default admin user...");
      const adminHash = bcrypt.hashSync(adminInitialPassword, 10);
      const _id = await getNextSeq('user_id');
      await User.create({ _id, role: 'admin', username: 'admin', password_hash: adminHash });
      console.log("[AUTH] Default admin created.");
    }
  }

  // Sync brokers to users
  function generateDefaultBrokerPassword(fullName: string) {
    const firstName = fullName.trim().split(/\s+/)[0];
    return `${firstName}${process.env.BROKER_DEFAULT_PASSWORD_SUFFIX || '1234'}`;
  }

  const brokers = await Broker.find();
  for (const broker of brokers) {
    const user = await User.findOne({ $or: [{ broker_id: broker._id }, { role: 'broker', username: broker.name }] });
    if (!user) {
      const password = generateDefaultBrokerPassword(broker.name);
      const hash = bcrypt.hashSync(password, 12);
      const _id = await getNextSeq('user_id');
      await User.create({ _id, role: 'broker', username: broker.name, password_hash: hash, broker_id: broker._id });
      console.log(`[AUTH] Created user for broker: ${broker.name}`);
      await sendBrokerCredentialsEmail(broker.name, password);
    } else if (user.broker_id !== broker._id) {
      await User.updateOne({ _id: user._id }, { broker_id: broker._id });
    }
  }

  // Seed settings and CMS
  const defaultSettings = [
    { key: 'insta_link', value: 'https://instagram.com/apexheights' },
    { key: 'video_url', value: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { key: 'gallery_images', value: JSON.stringify(['https://picsum.photos/seed/int1/800/800']) }
  ];
  for (const set of defaultSettings) {
    await Setting.updateOne({ key: set.key }, { $setOnInsert: set }, { upsert: true });
  }

  const defaultCms = [
    { key: 'main_photo_2bhk', value: '' }, { key: 'main_photo_3bhk', value: '' },
    { key: 'offer_text', value: '' }, { key: 'gallery_photos', value: '[]' },
    { key: 'social_insta', value: '' }, { key: 'social_facebook', value: '' },
    { key: 'social_whatsapp', value: '' }, { key: 'social_youtube', value: '' }
  ];
  for (const cms of defaultCms) {
    await CMS.updateOne({ key: cms.key }, { $setOnInsert: cms }, { upsert: true });
  }
}
mongoose.connection.once('connected', () => seedDefaultData());

//  Zod Validation Schemas 
const LeadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).max(20),
  property_type: z.enum(['2BHK', '3BHK']),
  location_pref: z.string().max(200).optional().or(z.literal('')),
  budget: z.string().max(50).optional().or(z.literal('')),
  message: z.string().max(500).optional().or(z.literal('')),
  claimed_offers: z.array(z.string().max(100)).max(10).optional(),
  referral: z.string().max(100).optional().or(z.literal('')),
  assigned_broker_id: z.number().optional()
});
const LoginSchema = z.object({
  role: z.enum(['admin', 'broker']),
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(100),
});
const BrokerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(10).max(20),
  area: z.string().max(200).optional().or(z.literal('')),
});
const SiteVisitSchema = z.object({
  lead_id: z.number(),
  visit_date: z.string().min(1).max(30),
  notes: z.string().max(500).optional().or(z.literal('')),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});
const StatusUpdateSchema = z.object({
  status: z.enum(['pending', 'contacted', 'connected', 'closed']),
});
const ResetPasswordSchema = z.object({
  identifier: z.string().min(1).max(100),
  code: z.string().length(6),
  newPassword: z.string().min(6).max(100),
});

// OTP store with attempt tracking to prevent brute-force
const otpStore = new Map<string, { code: string; expires: number; username: string; attempts: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of otpStore) { if (now > entry.expires) otpStore.delete(key); }
}, 5 * 60 * 1000);

//  JWT Auth Middleware 
interface AuthRequest extends Request { user?: { role: string; username: string; brokerId?: number }; }

function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Access denied.' });
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as any;
    next();
  } catch { return res.status(401).json({ error: 'Invalid token.' }); }
}
function verifyAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  verifyToken(req, res, () => { if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin req.' }); next(); });
}
function verifyBroker(req: AuthRequest, res: Response, next: NextFunction) {
  verifyToken(req, res, () => { if (req.user?.role !== 'broker') return res.status(403).json({ error: 'Broker req.' }); next(); });
}
function verifyAdminOrBroker(req: AuthRequest, res: Response, next: NextFunction) {
  verifyToken(req, res, () => { if (!['admin', 'broker'].includes(req.user?.role as string)) return res.status(403).json({ error: 'Denied.' }); next(); });
}

// Rate limiters
const leadLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many submissions. Try later.' } });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Too many login attempts.' } });
const otpLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3, message: { error: 'Too many OTP requests.' } });
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { error: 'Too many reset attempts.' } });
const clientLookupLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15, message: { error: 'Too many lookups. Try later.' } });
const developerContactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { error: 'Too many inquiries.' } });

async function startServer() {
  let cmsCache: Record<string, string> | null = null;
  let lastCacheUpdate = 0;
  const CACHE_TTL = 300000;
  
  async function getCMSData() {
    const now = Date.now();
    if (cmsCache && (now - lastCacheUpdate < CACHE_TTL)) return cmsCache;
    const rows = await CMS.find();
    cmsCache = rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
    lastCacheUpdate = now;
    return cmsCache;
  }
  function clearCMSCache() { cmsCache = null; }

  const app = express();
  app.set("trust proxy", 1);
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  
  app.use(express.json({ limit: '1mb' }));
  app.use(compression());
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com", "https://*.tile.openstreetmap.org", "https://mt1.google.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://res.cloudinary.com", "ws:", "wss:"],
        mediaSrc: ["'self'", "https://res.cloudinary.com", "https://www.youtube.com"],
        frameSrc: ["'self'", "https://www.youtube.com"],
      },
    },
    crossOriginEmbedderPolicy: false
  }));
  // CORS: require APP_URL, never fall back to wildcard
  const allowedOrigin = process.env.APP_URL;
  app.use(cors({
    origin: allowedOrigin ? allowedOrigin.split(',').map(o => o.trim()) : false,
    credentials: true
  }));
  app.use('/uploads', express.static(uploadDir, { maxAge: '1y' }));

  // API  ROUTING logic
  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
    const { role, username, password } = parsed.data;
    
    const user = await User.findOne({ username, role });
    if (!user) return res.status(401).json({ error: 'Wrong User ID' });
    if (!bcrypt.compareSync(password, user.password_hash)) return res.status(401).json({ error: 'Wrong Password' });
    
    const token = jwt.sign({ role, username, brokerId: user.broker_id }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, role, token, brokerId: user.broker_id });
  });

  app.post("/api/auth/forgot-password", otpLimiter, async (req, res) => {
    try {
      const { role, email, mobile } = req.body;
      let targetEmail = '', targetName = '', targetUsername = '';

      if (role === 'broker') {
        let formattedMobile = mobile?.replace(/\D/g, '') || '';
        if (formattedMobile.length === 10) formattedMobile = '+91' + formattedMobile;
        else if (!formattedMobile.startsWith('+91')) formattedMobile = '+' + formattedMobile;

        const mobileTenDigit = formattedMobile.startsWith('+91') ? formattedMobile.substring(3) : formattedMobile;
        const broker = await Broker.findOne({ 
          email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }, 
          phone: { $in: [formattedMobile, mobileTenDigit] }, 
          is_active: 1 
        });
        
        if (!broker) return res.status(401).json({ error: 'No active broker found with this info.' });
        targetEmail = broker.email; targetName = broker.name; targetUsername = broker.name;
      } else {
        const adminEmail = process.env.ADMIN_RECOVERY_EMAIL;
        const adminMobile = process.env.ADMIN_RECOVERY_PHONE;
        if (!adminEmail || !adminMobile) return res.status(500).json({ error: 'Admin recovery not configured.' });
        const inputMobile = mobile?.replace(/\D/g, '') || '';
        if (email !== adminEmail || inputMobile !== adminMobile) return res.status(401).json({ error: 'Invalid admin credentials.' });
        targetEmail = adminEmail; targetName = 'Super Admin'; targetUsername = 'admin';
      }

      const otp = crypto.randomInt(100000, 999999).toString();
      otpStore.set(email + ":" + mobile, { code: otp, expires: Date.now() + 10 * 60 * 1000, username: targetUsername, attempts: 0 });
      await sendOTPEmail(targetEmail, targetName, otp);
      res.json({ success: true, message: 'Verification code sent.' });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/api/auth/reset-password", resetLimiter, async (req, res) => {
    const parsed = ResetPasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
    const { identifier, code, newPassword } = parsed.data;
    const stored = otpStore.get(identifier);
    if (!stored || Date.now() > stored.expires) return res.status(400).json({ error: 'Code expired.' });
    
    // Brute-force protection: max 5 attempts per OTP
    if (stored.attempts >= 5) {
      otpStore.delete(identifier);
      return res.status(429).json({ error: 'Too many attempts. Request a new code.' });
    }
    stored.attempts++;
    
    // Timing-safe comparison to prevent timing attacks
    const codeBuffer = Buffer.from(stored.code);
    const inputBuffer = Buffer.from(code);
    if (codeBuffer.length !== inputBuffer.length || !crypto.timingSafeEqual(codeBuffer, inputBuffer)) {
      return res.status(400).json({ error: 'Invalid code.' });
    }
    
    const hash = bcrypt.hashSync(newPassword, 12);
    await User.updateOne({ username: stored.username }, { password_hash: hash });
    otpStore.delete(identifier);
    res.json({ success: true, message: 'Password reset successful.' });
  });

  app.get("/api/cms", async (req, res) => { try { res.json(await getCMSData()); } catch { res.status(500).json({ error: "Failed" }); } });

  app.post("/api/cms", verifyAdmin, async (req, res) => {
    const { key, value } = req.body;
    await CMS.updateOne({ key }, { value: value || '' }, { upsert: true });
    clearCMSCache();
    res.json({ success: true });
  });

  app.get("/api/settings", async (req, res) => {
    const rows = await Setting.find();
    res.json(rows.reduce((acc: any, row) => { acc[row.key] = row.value; return acc; }, {}));
  });
  
  app.post("/api/settings", verifyAdmin, async (req, res) => {
    await Setting.updateOne({ key: req.body.key }, { value: req.body.value }, { upsert: true });
    res.json({ success: true });
  });

  // Developer Contact API
  app.post("/api/developer/contact", developerContactLimiter, async (req, res) => {
    const { name, email, details } = req.body;
    if (!name || !email || !details) return res.status(400).json({ error: "All fields are required." });
    if (typeof name !== 'string' || name.length > 100 || typeof email !== 'string' || email.length > 100 || typeof details !== 'string' || details.length > 2000) return res.status(400).json({ error: 'Invalid input.' });
    await sendDeveloperEmail({ name, email, details });
    res.json({ success: true, message: "Thank you for reaching out! I'll get back to you soon." });
  });

  app.post("/api/leads", leadLimiter, async (req, res) => {
    const parsed = LeadSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid lead data' });
    try {
      console.log("[SERVER] Received lead submission:", parsed.data);
      let targetBrokerId = parsed.data.assigned_broker_id;
      if (!targetBrokerId && process.env.DEFAULT_BROKER_NAME) {
        const defaultBroker = await Broker.findOne({ name: process.env.DEFAULT_BROKER_NAME });
        if (defaultBroker) {
          targetBrokerId = defaultBroker._id;
          console.log("[SERVER] Auto-assigning lead to broker:", defaultBroker.name);
        }
      }
      
      const lastConnectDate = targetBrokerId ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null;
      const _id = await getNextSeq('lead_id');
      
      await Lead.create({
        _id, ...parsed.data, 
        claimed_offers: JSON.stringify(parsed.data.claimed_offers || []),
        status: 'pending', assigned_broker_id: targetBrokerId, last_connect_date: lastConnectDate
      });
      
      console.log("[SERVER] Lead saved successfully with ID:", _id);
      sendLeadEmail(parsed.data);
      res.status(201).json({ success: true, message: "Lead captured successfully" });
    } catch (err: any) { 
      console.error("[SERVER] Lead Save Error:", err);
      res.status(500).json({ error: "Internal Server Error" }); 
    }
  });

  app.get("/api/leads", verifyAdmin, async (req, res) => {
    const leads = await Lead.find().sort({ created_at: -1 });
    const brokers = await Broker.find();
    const joined = leads.map(l => {
        const obj = l.toJSON();
        const b = brokers.find(broker => broker._id === obj.assigned_broker_id);
        obj.assigned_broker_name = b ? b.name : null;
        try { obj.claimed_offers = obj.claimed_offers ? JSON.parse(obj.claimed_offers) : []; } catch { obj.claimed_offers = []; }
        return obj;
    });
    res.json(joined);
  });

  app.post("/api/leads/:id/assign", verifyAdmin, async (req, res) => {
    const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    await Lead.updateOne({ _id: Number(req.params.id) }, { assigned_broker_id: req.body.broker_id, last_connect_date: date });
    res.json({ success: true });
  });

  app.post("/api/leads/assign-bulk", verifyAdmin, async (req, res) => {
    const { broker_id } = req.body;
    const date = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    await Lead.updateMany({}, { assigned_broker_id: broker_id, last_connect_date: date });
    await SiteVisit.updateMany({}, { broker_id });
    res.json({ success: true });
  });

  app.patch("/api/leads/:id/status", verifyAdminOrBroker, async (req: AuthRequest, res) => {
    const parsed = StatusUpdateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid status. Allowed: pending, contacted, connected, closed' });
    
    // Broker can only update their own assigned leads
    if (req.user?.role === 'broker') {
      const lead = await Lead.findById(Number(req.params.id));
      if (!lead || lead.assigned_broker_id !== req.user.brokerId) return res.status(403).json({ error: 'Access denied.' });
    }
    await Lead.updateOne({ _id: Number(req.params.id) }, { status: parsed.data.status });
    res.json({ success: true });
  });

  app.patch("/api/leads/:id/visibility", verifyAdmin, async (req, res) => {
    const update: any = {};
    if (req.body.is_deleted_for_brokers !== undefined) update.is_deleted_for_brokers = req.body.is_deleted_for_brokers;
    if (req.body.is_hidden_for_admin !== undefined) update.is_hidden_for_admin = req.body.is_hidden_for_admin;
    await Lead.updateOne({ _id: Number(req.params.id) }, update);
    res.json({ success: true });
  });

  app.get("/api/leads/broker/:brokerId", verifyBroker, async (req: AuthRequest, res) => {
    if (req.user?.role === 'broker' && Number(req.params.brokerId) !== req.user.brokerId) return res.status(403).json({ error: 'Access Denied: Broker ID mismatch.' });
    const leads = await Lead.find({ 
      assigned_broker_id: Number(req.params.brokerId),
      is_deleted_for_brokers: { $ne: true },
      is_hidden_for_admin: { $ne: true }
    }).sort({ created_at: -1 });
    res.json(leads.map(l => { const obj = l.toJSON(); try { obj.claimed_offers = obj.claimed_offers ? JSON.parse(obj.claimed_offers) : []; } catch { obj.claimed_offers = []; } return obj; }));
  });

  // Client Portal — public phone lookup (rate-limited to prevent enumeration)
  app.get("/api/leads/phone/:phone", clientLookupLimiter, async (req, res) => {
    const phone = req.params.phone?.replace(/[^\d+\s-]/g, ''); // sanitize
    if (!phone || phone.length < 10) return res.status(400).json({ error: 'Invalid phone number.' });
    const leads = await Lead.find({ phone: { $regex: phone.replace(/[-\s]/g, ''), $options: 'i' } })
      .select('name phone property_type status created_at assigned_broker_id')
      .sort({ created_at: -1 });
    // Attach broker name for display
    const brokers = await Broker.find();
    const result = leads.map(l => {
      const obj = l.toJSON();
      const b = brokers.find(br => br._id === obj.assigned_broker_id);
      obj.assigned_broker_name = b ? b.name : null;
      delete obj.assigned_broker_id;
      return obj;
    });
    res.json(result);
  });

  app.get("/api/site-visits/client/:phone", clientLookupLimiter, async (req, res) => {
    const phone = req.params.phone?.replace(/[^\d+\s-]/g, '');
    if (!phone || phone.length < 10) return res.status(400).json({ error: 'Invalid phone number.' });
    // Find leads by phone, then get their visits
    const leads = await Lead.find({ phone: { $regex: phone.replace(/[-\s]/g, ''), $options: 'i' } }).select('_id name phone property_type');
    const leadIds = leads.map(l => l._id);
    const visits = await SiteVisit.find({ lead_id: { $in: leadIds } }).sort({ visit_date: 1 });
    res.json(visits.map(v => {
      const obj = v.toJSON();
      const l = leads.find(lead => lead._id === v.lead_id);
      obj.lead_name = l?.name; obj.lead_phone = l?.phone; obj.property_type = l?.property_type;
      delete obj.broker_id; // Don't expose broker IDs to public
      return obj;
    }));
  });

  app.get("/api/brokers", verifyAdminOrBroker, async (req, res) => {
    res.json(await Broker.find().sort({ created_at: -1 }));
  });

  app.post("/api/brokers", verifyAdmin, async (req, res) => {
    const parsed = BrokerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
    const _id = await getNextSeq('broker_id');
    await Broker.create({ _id, name: parsed.data.name, email: parsed.data.email || '', phone: parsed.data.phone, area: parsed.data.area || '', is_active: 0 });
    seedDefaultData();
    res.status(201).json({ success: true, id: _id });
  });

  app.patch("/api/brokers/:id", verifyAdmin, async (req, res) => {
    // Only allow whitelisted fields to be updated
    const allowed: Record<string, any> = {};
    if (req.body.name !== undefined) allowed.name = String(req.body.name).slice(0, 100);
    if (req.body.email !== undefined) allowed.email = String(req.body.email).slice(0, 100);
    if (req.body.phone !== undefined) allowed.phone = String(req.body.phone).slice(0, 20);
    if (req.body.area !== undefined) allowed.area = String(req.body.area).slice(0, 200);
    if (req.body.is_active !== undefined) allowed.is_active = req.body.is_active === 1 ? 1 : 0;
    await Broker.updateOne({ _id: Number(req.params.id) }, allowed);
    res.json({ success: true });
  });

  app.delete("/api/brokers/:id", verifyAdmin, async (req, res) => {
    await Lead.updateMany({ assigned_broker_id: Number(req.params.id) }, { assigned_broker_id: null });
    await SiteVisit.deleteMany({ broker_id: Number(req.params.id) });
    await Broker.deleteOne({ _id: Number(req.params.id) });
    res.json({ success: true });
  });

  app.get("/api/leaderboard", verifyBroker, async (req, res) => {
    const brokers = await Broker.find({ is_active: 1 });
    const leads = await Lead.find({ is_hidden_for_admin: { $ne: true }, is_deleted_for_brokers: { $ne: true } });
    let board = brokers.map(b => {
      const activeLeads = leads.filter(l => l.assigned_broker_id === b._id);
      const total = activeLeads.length;
      const conn = activeLeads.filter(l => l.status === 'connected' || l.status === 'closed').length;
      const closed = activeLeads.filter(l => l.status === 'closed').length;
      const cr = total > 0 ? (closed/total)*100 : 0;
      const act = activeLeads.filter(l => l.status !== 'pending').length;
      const ascore = total > 0 ? (act/total)*100 : 0;
      const score = (conn*40) + (cr*30) + (ascore*30);
      return { broker_id: b._id, name: b.name, total_leads: total, connected: conn, closed, conversion_rate: cr, activity_score: ascore, score };
    });
    board.sort((a,b) => b.score - a.score);
    res.json(board.map((x, i) => ({ ...x, rank: i+1 })));
  });

  app.post("/api/site-visits", verifyBroker, async (req: AuthRequest, res) => {
    const brokerId = req.user?.brokerId;
    if (!brokerId) return res.status(403).json({ error: 'Broker ID missing in token.' });
    const parsed = SiteVisitSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message });
    const _id = await getNextSeq('sitevisit_id');
    await SiteVisit.create({ _id, broker_id: brokerId, lead_id: parsed.data.lead_id, visit_date: parsed.data.visit_date, notes: parsed.data.notes || '', status: parsed.data.status || 'scheduled' });
    res.status(201).json({ success: true, id: _id });
  });

  app.get("/api/site-visits/:brokerId", verifyBroker, async (req: AuthRequest, res) => {
    if (req.user?.role === 'broker' && Number(req.params.brokerId) !== req.user.brokerId) return res.status(403).json({ error: 'Access Denied: Broker ID mismatch.' });
    const visits = await SiteVisit.find({ broker_id: Number(req.params.brokerId) }).sort({ visit_date: 1 });
    const leads = await Lead.find();
    res.json(visits.map(v => {
      const l = leads.find(lead => lead._id === v.lead_id);
      const obj = v.toJSON();
      obj.lead_name = l?.name; obj.lead_phone = l?.phone; obj.property_type = l?.property_type;
      return obj;
    }));
  });

  app.patch("/api/site-visits/:id", verifyAdminOrBroker, async (req: AuthRequest, res) => {
    // Broker can only update their own visits
    if (req.user?.role === 'broker') {
      const visit = await SiteVisit.findById(Number(req.params.id));
      if (!visit || visit.broker_id !== req.user.brokerId) return res.status(403).json({ error: 'Access denied.' });
    }
    // Whitelist updateable fields only
    const allowed: Record<string, any> = {};
    if (req.body.visit_date) allowed.visit_date = String(req.body.visit_date).slice(0, 30);
    if (req.body.notes !== undefined) allowed.notes = String(req.body.notes).slice(0, 500);
    if (req.body.status && ['scheduled', 'completed', 'cancelled'].includes(req.body.status)) allowed.status = req.body.status;
    await SiteVisit.updateOne({ _id: Number(req.params.id) }, allowed);
    res.json({ success: true });
  });

  app.post("/api/client-documents", verifyBroker, upload.single('file'), async (req: AuthRequest, res) => {
    if (!req.file) return res.status(400).json({ error: "Missing file" });
    const brokerId = req.user?.brokerId;
    if (!brokerId) return res.status(403).json({ error: 'Broker ID missing in token.' });
    const _id = await getNextSeq('doc_id');
    const url = (req.file as any).path; // Cloudinary secure URL
    await ClientDocument.create({ _id, broker_id: brokerId, lead_id: req.body.lead_id, file_name: req.file.originalname, file_url: url });
    res.status(201).json({ success: true, id: _id, url });
  });

  // Generic Cloudinary Upload Routes
  app.post("/api/upload", verifyAdminOrBroker, upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    res.json({ success: true, url: (req.file as any).path });
  });

  app.post("/api/upload-multiple", verifyAdminOrBroker, upload.array('files', 10), (req, res) => {
    if (!req.files || (req.files as any).length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }
    const urls = (req.files as any[]).map(file => file.path);
    res.json({ success: true, urls });
  });

  app.get("/api/client-documents/:brokerId", verifyBroker, async (req: AuthRequest, res) => {
    if (req.user?.role === 'broker' && Number(req.params.brokerId) !== req.user.brokerId) return res.status(403).json({ error: 'Access Denied: Broker ID mismatch.' });
    const docs = await ClientDocument.find({ broker_id: Number(req.params.brokerId) }).sort({ uploaded_at: -1 });
    const leads = await Lead.find();
    res.json(docs.map(d => {
       const obj = d.toJSON();
       const l = leads.find(lead => lead._id === d.lead_id);
       obj.lead_name = l?.name; obj.lead_phone = l?.phone;
       return obj;
    }));
  });

  app.delete("/api/client-documents/:id", verifyBroker, async (req: AuthRequest, res) => {
    // Ownership check: broker can only delete their own documents
    const doc = await ClientDocument.findById(Number(req.params.id));
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    if (req.user?.role === 'broker' && doc.broker_id !== req.user.brokerId) return res.status(403).json({ error: 'Access denied.' });
    await ClientDocument.deleteOne({ _id: Number(req.params.id) });
    res.json({ success: true });
  });

  app.get("/api/stats/global", verifyAdmin, async (req, res) => {
    const totalLeads = await Lead.countDocuments();
    const assignedLeads = await Lead.countDocuments({ assigned_broker_id: { $ne: null } });
    const pendingLeads = await Lead.countDocuments({ status: 'pending' });
    const contactedLeads = await Lead.countDocuments({ status: 'contacted' });
    const connectedLeads = await Lead.countDocuments({ status: 'connected' });
    const closedLeads = await Lead.countDocuments({ status: 'closed' });
    const totalBrokers = await Broker.countDocuments({ is_active: 1 });
    const conversionRate = totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;
    res.json({ totalLeads, assignedLeads, unassignedLeads: totalLeads - assignedLeads, pendingLeads, contactedLeads, connectedLeads, closedLeads, totalBrokers, conversionRate });
  });

  app.get("/api/stats/broker/:brokerId", verifyBroker, async (req: AuthRequest, res) => {
    if (req.user?.role === 'broker' && Number(req.params.brokerId) !== req.user.brokerId) return res.status(403).json({ error: 'Access Denied: Broker ID mismatch.' });
    const bId = Number(req.params.brokerId);
    const filter = { assigned_broker_id: bId, is_hidden_for_admin: { $ne: true }, is_deleted_for_brokers: { $ne: true } };
    const totalAssigned = await Lead.countDocuments(filter);
    const pending = await Lead.countDocuments({ ...filter, status: 'pending' });
    const contacted = await Lead.countDocuments({ ...filter, status: 'contacted' });
    const connected = await Lead.countDocuments({ ...filter, status: 'connected' });
    const closed = await Lead.countDocuments({ ...filter, status: 'closed' });
    res.json({ totalAssigned, pending, contacted, connected, closed, conversionRate: totalAssigned > 0 ? (closed/totalAssigned)*100 : 0, rank: 1, totalBrokers: await Broker.countDocuments() });
  });

  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ error: 'File too large' });
    if (err?.message?.includes('Invalid file type')) return res.status(400).json({ error: err.message });
    next(err);
  });

  if (process.env.NODE_ENV === "production" && fs.existsSync(path.join(process.cwd(), "dist"))) {
    const cacheStatic = (r: any, p: string) => { if (p.match(/\.(js|css|woff2|webp|jpg|png)$/)) r.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); };
    app.use(express.static(path.join(process.cwd(), 'dist'), { setHeaders: cacheStatic }));
    app.use('/vendor', express.static(path.join(process.cwd(), 'public/vendor'), { setHeaders: cacheStatic }));
    app.use(express.static(path.join(process.cwd(), 'public'), { setHeaders: cacheStatic }));
    app.get("*", (req, res) => { res.sendFile(path.join(process.cwd(), "dist", "index.html")); });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'custom' });
      app.use(vite.middlewares);
      app.use("*", async (req, res, next) => {
        // Skip API routes and static assets — only serve HTML for page navigations
        if (req.originalUrl.startsWith('/api/') || req.originalUrl.match(/\.\w+$/)) {
          return next();
        }
        try {
          let template = fs.readFileSync(path.resolve(process.cwd(), "index.html"), "utf-8");
          template = await vite.transformIndexHtml(req.originalUrl, template);
          res.status(200).set({ "Content-Type": "text/html" }).end(template);
        } catch (e: any) { vite.ssrFixStacktrace(e); next(e); }
      });
    } catch {}
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Security: helmet+CSP ✅ | cors(locked) ✅ | rate-limit ✅ | JWT auth ✅ | bcrypt(12) ✅ | zod ✅`);
  });
}

startServer();
