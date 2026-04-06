# 🏗️ Backend Architecture

> Complete backend architecture, database schema, and system overview for Ayushmaan Residency.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + TailwindCSS v4 |
| Build Tool | Vite 6 |
| Backend | Express.js (Node.js) + TSX |
| Database | MongoDB Atlas (Mongoose) |
| Email | Brevo (Sendinblue) via `sib-api-v3-sdk` |
| File Storage | Cloudinary via `multer-storage-cloudinary` |
| Auth | JWT + bcrypt |
| Security | helmet, cors, express-rate-limit, zod |
| 3D Viewer | Three.js + React Three Fiber |
| Map | Leaflet + react-leaflet (Google Hybrid tiles) |
| Animations | Motion (Framer Motion) |
| Routing | React Router DOM v7 |

---

## Portal Architecture

| Portal | Route | Auth | Description |
|---|---|---|---|
| Client Hub | `/admin/client` | None (public) | Customer lookup by phone |
| Broker Portal | `/admin/broker` | JWT (role=broker) | Broker sees own leads only |
| Super Admin | `/admin/super` | JWT (role=admin) | Full system control — hidden from PortalHub |

- Admin access: `/admin?role=admin` (card hidden from default PortalHub page)
- Broker ID isolation enforced server-side
- Auto-logout on 24h JWT expiry

---

## Database Schema (MongoDB)

### `users`
| Field | Type | Notes |
|---|---|---|
| _id | Number | Auto-increment |
| role | String | `admin` or `broker` |
| username | String (unique) | Broker name or admin email |
| password_hash | String | bcrypt hash |
| broker_id | Number | FK → brokers (null for admin) |
| created_at | Date | Auto |

### `brokers`
| Field | Type | Notes |
|---|---|---|
| _id | Number | Auto-increment |
| name | String | |
| email | String | Used for OTP delivery |
| phone | String | `+91XXXXXXXXXX` |
| area | String | Operating area |
| is_active | Number | 1=active, 0=blocked |
| created_at | Date | Auto |

### `leads`
| Field | Type | Notes |
|---|---|---|
| _id | Number | Auto-increment |
| name, email, phone | String | Contact info |
| property_type | String | `2BHK` or `3BHK` |
| location_pref, budget, message | String | Preferences |
| claimed_offers | String | JSON array |
| referral | String | Referring broker name |
| status | String | `pending` / `contacted` / `connected` / `closed` |
| assigned_broker_id | Number | FK → brokers |
| last_connect_date | String | Follow-up deadline |
| is_deleted_for_brokers | Boolean | Hidden from broker portals |
| is_hidden_for_admin | Boolean | Hidden from admin list |
| created_at | Date | Auto |

### `sitevisits`
| Field | Type | Notes |
|---|---|---|
| _id | Number | Auto-increment |
| broker_id | Number | FK → brokers |
| lead_id | Number | FK → leads |
| visit_date | String | |
| notes | String | |
| status | String | `scheduled` / `completed` / `cancelled` |
| created_at | Date | Auto |

### `clientdocuments`
| Field | Type | Notes |
|---|---|---|
| _id | Number | Auto-increment |
| broker_id | Number | FK → brokers |
| lead_id | Number | FK → leads |
| file_name | String | Original filename |
| file_url | String | Cloudinary URL |
| uploaded_at | Date | Auto |

### `settings`
Key-value store for site configuration.

### `cms`
Key-value store for CMS content: `main_photo_2bhk`, `main_photo_3bhk`, `video_url_3bhk`, `offer_text`, `gallery_photos`, `gallery_videos`, `all_location_link`, `contact_email_footer`, `contact_phone_footer`, `social_insta`, `social_facebook`, `social_linkedin`, `social_youtube`.

### `counters`
Auto-increment helper for generating sequential IDs.

---

## Dependencies

```
express, mongoose, jsonwebtoken, bcryptjs,
helmet, cors, express-rate-limit, zod, compression,
multer, multer-storage-cloudinary, cloudinary,
sib-api-v3-sdk, dotenv
```

---

## Related Docs

- [API Reference](./API_Keys_and_Hosting_Guide.md) — Full API endpoints & hosting setup
- [Security Documentation](./Security_Audit_and_Hardening_Plan.md) — Auth, rate limiting & hardening details
