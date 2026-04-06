# 🔒 Security Documentation

> Security architecture and implementation details for Ayushmaan Residency.

---

## Authentication

This project uses **JWT-based authentication** with role-based access control.

| Role | Token Payload | Expiry | Middleware |
|---|---|---|---|
| Admin | `{ role: "admin" }` | 24 hours | `verifyAdmin` |
| Broker | `{ role: "broker", brokerId }` | 24 hours | `verifyBroker` |

- Passwords are hashed with **bcrypt** before storing in MongoDB.
- Tokens are sent via `Authorization: Bearer <token>` header.
- Frontend auto-logout on JWT expiry via `setupAutoLogout()` in `src/utils/auth.ts`.

---

## Portal Access Control

| Portal | Route | Auth Required | Description |
|---|---|---|---|
| Super Admin | `/admin/super` | JWT (role=admin) | Full system control |
| Broker Portal | `/admin/broker` | JWT (role=broker) | Broker's own leads & data |
| Client Hub | `/admin/client` | None (public) | Customer lookup by phone |
| PortalHub | `/admin` | — | Admin card hidden; access via `/admin?role=admin` |

---

## Protected Routes

### Admin-only (requires `verifyAdmin` middleware)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads` | List all leads |
| POST | `/api/leads/:id/assign` | Assign lead to broker |
| PATCH | `/api/leads/:id/visibility` | Toggle hide/delete flags |
| POST | `/api/leads/assign-bulk` | Bulk assignment |
| GET/POST/PATCH/DELETE | `/api/brokers` | Broker CRUD |
| POST | `/api/settings` | Update site settings |
| POST | `/api/cms` | Update CMS content |
| GET | `/api/stats/global` | Dashboard statistics |

### Broker-only (requires `verifyBroker` + ID isolation)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/leads/broker/:brokerId` | Own assigned leads |
| GET | `/api/site-visits/:brokerId` | Own site visits |
| POST | `/api/site-visits` | Schedule a visit |
| GET | `/api/client-documents/:brokerId` | Own uploaded documents |
| POST | `/api/client-documents` | Upload document |
| GET | `/api/stats/broker/:brokerId` | Own dashboard stats |

### Public (intentionally open)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/leads` | Lead form submission (rate-limited) |
| GET | `/api/settings`, `/api/cms` | Public site content |
| GET | `/api/leads/phone/:phone` | Client phone lookup |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | OTP request |
| POST | `/api/auth/reset-password` | Password reset |
| POST | `/api/brokers/apply` | Broker self-registration |

---

## Broker ID Isolation

Every broker-scoped route validates that the `brokerId` in the JWT matches the URL parameter:

```ts
const tokenBrokerId = req.user?.brokerId;
if (parseInt(req.params.brokerId) !== tokenBrokerId) {
  return res.status(403).json({ error: 'Access denied' });
}
```

This prevents any broker from accessing another broker's data.

---

## Rate Limiting

| Endpoint | Limit | Window |
|---|---|---|
| `POST /api/leads` | 5 requests | 15 min / IP |
| `POST /api/auth/login` | 10 attempts | 15 min / IP |
| `POST /api/auth/forgot-password` | 3 requests | 60 min / IP |

---

## Input Validation

All `POST` and `PATCH` request bodies are validated with **Zod** schemas. Invalid requests return `400` with a descriptive error message.

Validated endpoints include:
- Login (`username`, `password`, `role`)
- Lead submission (`name`, `phone`, `property_type`, `email`, `budget`, `message`)
- Broker creation (`name`, `phone`, `email`, `area`)

---

## Security Headers

```ts
app.use(helmet());   // X-Content-Type-Options, X-Frame-Options, HSTS, CSP, etc.
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

## File Upload Security

- **Allowed MIME types:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`
- **Max file size:** 10 MB
- All uploads are stored on **Cloudinary** (no local disk storage)

---

## OTP (One-Time Password)

- Stored in an **in-memory Map** with a 10-minute TTL
- Delivered via **Brevo** transactional email (`sendOTPEmail()`)
- Used for broker password reset flow

---

## Security Packages

| Package | Purpose |
|---|---|
| `jsonwebtoken` | JWT token creation & verification |
| `bcryptjs` | Password hashing |
| `helmet` | HTTP security headers |
| `cors` | CORS origin restriction |
| `express-rate-limit` | Endpoint rate limiting |
| `zod` | Request body validation |
| `sib-api-v3-sdk` | Transactional email (Brevo) |
