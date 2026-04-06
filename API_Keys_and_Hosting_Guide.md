# 📡 API Reference & Hosting Guide

> Full API endpoint reference, service configuration, and deployment instructions for Ayushmaan Residency.  
> **Budget: ₹0** — All services use free tiers.

---

## Services Overview

| Service | Purpose | Cost |
|---|---|---|
| [Render.com](https://render.com) | Node.js hosting (backend + frontend) | ₹0 |
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Cloud database | ₹0 |
| [Brevo](https://www.brevo.com/) | Transactional email (OTP + notifications) | ₹0 |
| [Cloudinary](https://cloudinary.com/) | Image/document CDN | ₹0 |
| [Leaflet + OpenStreetMap](https://leafletjs.com/) | Interactive map | ₹0 |

---

## API Endpoints

### Auth (Public)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Login → returns JWT token |
| POST | `/api/auth/forgot-password` | Sends OTP via Brevo email |
| POST | `/api/auth/reset-password` | Verifies OTP + resets password |

### Leads

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/leads` | Public (rate-limited) | Submit a lead |
| GET | `/api/leads` | Admin | List all leads |
| POST | `/api/leads/:id/assign` | Admin | Assign to broker |
| PATCH | `/api/leads/:id/status` | Admin / Broker | Update lead status |
| PATCH | `/api/leads/:id/visibility` | Admin | Toggle hide/delete flags |
| GET | `/api/leads/broker/:brokerId` | Broker (own ID) | Get assigned leads |
| GET | `/api/leads/phone/:phone` | Public | Client portal lookup |
| POST | `/api/leads/assign-bulk` | Admin | Bulk assign all leads |

### Brokers

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/brokers` | Admin / Broker | List all brokers |
| POST | `/api/brokers` | Admin | Create broker + user account |
| PATCH | `/api/brokers/:id` | Admin | Update details / toggle status |
| DELETE | `/api/brokers/:id` | Admin | Delete broker + unassign leads |
| POST | `/api/brokers/apply` | Public | Broker self-registration |

### Site Visits

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/site-visits/:brokerId` | Broker (own ID) | List broker's visits |
| GET | `/api/site-visits/client/:phone` | Public | Client's visits |
| POST | `/api/site-visits` | Broker | Create a visit |

### Client Documents

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/client-documents/:brokerId` | Broker (own ID) | List broker's documents |
| POST | `/api/client-documents` | Broker | Upload document |

### CMS & Settings

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/settings` | Public | Get site settings |
| POST | `/api/settings` | Admin | Update site settings |
| GET | `/api/cms` | Public | Get CMS content |
| POST | `/api/cms` | Admin | Update CMS content |

### File Uploads

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Admin / Broker | Single file → Cloudinary |
| POST | `/api/upload-multiple` | Admin / Broker | Up to 10 files → Cloudinary |

### Analytics

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/stats/global` | Admin | Global dashboard stats |
| GET | `/api/stats/broker/:brokerId` | Broker (own ID) | Broker dashboard stats |
| GET | `/api/leaderboard` | Broker | Broker rankings |

### Developer

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/developer/contact` | Public (rate-limited) | Developer inquiry email |

---

## Environment Variables

Create a `.env` file in the project root (see `.env.example` for reference):

```env
# Server
NODE_ENV=production
PORT=3000

# Database (required)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ayushmaan?retryWrites=true&w=majority

# Auth (required)
JWT_SECRET=<128-char hex — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">

# Brevo Email (required)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@yourdomain.com
BREVO_ADMIN_EMAIL=admin@ayushmaanresidency.com

# Cloudinary (required for uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# CORS (set after deploy)
APP_URL=https://your-app.onrender.com

# Admin
ADMIN_INITIAL_PASSWORD=your_admin_password
ADMIN_RECOVERY_EMAIL=admin@example.com
ADMIN_RECOVERY_PHONE=1234567890

# Broker
BROKER_DEFAULT_PASSWORD_SUFFIX=your_suffix
DEFAULT_BROKER_NAME=Vivek Singh

# Developer
DEVELOPER_EMAIL=developer@example.com
```

---

## Deployment (Render.com)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service → Connect repo
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `node dist/server.js`
5. **Plan:** Free | **Region:** Singapore
6. Add all env vars from above in the Render dashboard
7. Set up a 14-min cron ping at [cron-job.org](https://cron-job.org) to prevent cold starts

### Service Limits (Free Tier)

| Service | Key Limit |
|---|---|
| Render | 750 hrs/month, 512 MB RAM, ~30-60s cold start |
| MongoDB Atlas | 512 MB storage, 500 connections |
| Brevo | 300 emails/day |
| Cloudinary | ~25 GB storage, ~25 GB bandwidth/month |

---

## Related Docs

- [Backend Architecture](./Ayushmaan_Residency_Backend_Architecture_v2.md) — Tech stack, DB schema & system overview
- [Security Documentation](./Security_Audit_and_Hardening_Plan.md) — Auth, rate limiting & hardening details
