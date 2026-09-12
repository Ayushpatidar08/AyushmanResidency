# Ayushmaan Residency — Technical Audit Report

**Project:** Ayushmaan Residency — Real Estate Lead Management Platform  
**Audit Date:** August 26, 2026  
**Scope:** Full codebase review — frontend, backend, infrastructure configuration, security posture, and documentation  
**Auditor:** Automated static analysis and manual code review  
**Overall Risk Rating:** 🔴 **HIGH**

---

## 1. Executive Summary

Ayushmaan Residency is a full-stack real estate application built with React 19, Vite 6, TypeScript 5.8, Express.js, MongoDB (Atlas), Cloudinary, and Brevo (email). The application serves a public-facing marketing website alongside role-based portals for administrators, brokers, and clients.

The audit identified **1 critical**, **4 high**, and **8 medium** severity findings. The most urgent issue is the presence of live production credentials (MongoDB connection string with password, Brevo API key, Cloudinary API secret, JWT secret) stored in plaintext in the local `.env` file. While `.env` is properly gitignored and not tracked in version control, the credentials represent a significant exposure risk if the development machine is compromised or the file is accidentally shared. Additionally, the `NODE_ENV` variable is set to `" developer"` (with a leading space), which will not match the standard `"production"` string comparison used by the server's conditional logic, potentially causing incorrect environment detection at runtime.

The application demonstrates several strong security practices: Zod schema validation on inputs, rate limiting on sensitive endpoints, Helmet security headers with CSP, bcrypt password hashing (cost factor 10–12), timing-safe OTP comparison, broker ID isolation middleware, and MIME-type whitelisting for file uploads. These are commendable and indicate deliberate security engineering effort.

However, the project has no test suite, no CI/CD pipeline configuration, inconsistent dependency management (duplicate Vite versions, unused packages like Mongoose sequence helper, Google GenAI SDK, and Stitch SDK), and documentation that references SQLite architecture while the actual database is MongoDB. The TypeScript build currently fails due to a missing `@vercel/analytics` module in `node_modules`, suggesting an incomplete dependency installation.

---

## 2. Project Overview

### 2.1 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | React | ^19.0.0 |
| Build Tool | Vite | ^6.2.0 |
| Language | TypeScript | ~5.8.2 |
| Styling | Tailwind CSS | ^4.1.14 |
| Routing | React Router DOM | ^7.13.0 |
| Backend Framework | Express.js | ^4.21.2 |
| Database | MongoDB Atlas (Mongoose) | ^9.3.3 |
| Authentication | JSON Web Tokens (jsonwebtoken) | ^9.0.3 |
| Password Hashing | bcryptjs | ^3.0.3 |
| File Storage | Cloudinary | ^2.9.0 |
| Email Service | Brevo (sib-api-v3-sdk) | ^8.5.0 |
| Validation | Zod | ^4.3.6 |
| Security Headers | Helmet | ^8.1.0 |
| Rate Limiting | express-rate-limit | ^8.3.1 |
| Maps | Leaflet / React Leaflet | ^1.9.4 / ^5.0.0 |
| 3D Graphics | Three.js / React Three Fiber | ^0.183.1 / ^9.5.0 |

### 2.2 Application Architecture

- **Frontend:** Single-page React application served via Vite, deployed to Vercel as static assets.
- **Backend:** Express.js server (`server.ts`) running on Render.com, proxied through Vercel rewrites for `/api/*` routes.
- **Database:** MongoDB Atlas cluster with Mongoose ODM; collections for users, brokers, leads, settings, CMS content, client documents, site visits, and counters.
- **File Uploads:** Multer + Cloudinary storage adapter with MIME whitelist and 10MB size limit.
- **Email:** Brevo transactional email API for lead notifications, OTP delivery, and broker credential sharing.

### 2.3 Codebase Metrics

| Metric | Value |
|--------|-------|
| Total source files (`src/`) | 27 |
| Backend file (`server.ts`) | 823 lines |
| Largest component | SuperAdminPortal.tsx (58,432 bytes) |
| Public assets | 35 files (~14 MB) |
| npm dependencies (runtime) | 36 |
| npm dependencies (dev) | 12 |
| Test files | 0 |
| CI/CD configuration | None detected |

---

## 3. Findings Summary

| # | Severity | Category | Finding |
|-----|----------|----------|---------|
| F-01 | 🔴 Critical | Security | Plaintext production credentials in local `.env` file |
| F-02 | 🟠 High | Configuration | `NODE_ENV` set to `" developer"` with leading space — breaks environment detection |
| F-03 | 🟠 High | Build Health | Missing `@vercel/analytics` module causes TypeScript compilation failure |
| F-04 | 🟠 High | Testing | Zero test coverage across entire codebase |
| F-05 | 🟠 High | Architecture | Monolithic 823-line backend file with all schemas, routes, and logic inline |
| F-06 | 🟡 Medium | Dependencies | Duplicate Vite versions (^6.2.0 in both dependencies and devDependencies) |
| F-07 | 🟡 Medium | Dependencies | Unused runtime dependencies inflate bundle and attack surface |
| F-08 | 🟡 Medium | Security | CSP allows `'unsafe-eval'` and `'unsafe-inline'` for scripts |
| F-09 | 🟡 Medium | Documentation | Architecture document references SQLite while project uses MongoDB |
| F-10 | 🟡 Medium | Security | Broker default passwords use predictable pattern (firstName + suffix) |
| F-11 | 🟡 Medium | Security | `/api/settings` GET endpoint is public and unauthenticated |
| F-12 | 🟡 Medium | DevOps | No CI/CD pipeline or automated deployment checks |
| F-13 | 🟡 Medium | Code Quality | Large single-file components (>55KB) reduce maintainability |
| F-14 | 🟢 Low | Documentation | README is minimal (single line with live URL only) |

---

## 4. Detailed Findings

### F-01: Plaintext Production Credentials in Local `.env` File

**Severity:** 🔴 Critical  
**Category:** Security  
**Location:** `.env` (local disk, not committed to git)

**Description:** The `.env` file contains live production credentials including:

- MongoDB Atlas connection URI with embedded admin username and password
- Brevo (Sendinblue) API key (`xkeysib-...`)
- Cloudinary API key and secret pair
- JWT signing secret (96 characters)
- Admin initial password and recovery contact details
- Stitch AI API key and project identifier

While `.gitignore` correctly excludes `.env*` from version control (confirmed — `git ls-files .env` returns empty and no commit history includes it), these credentials exist in plaintext on the developer workstation. Any accidental inclusion in screenshots, screen shares, backup archives, or clipboard history would immediately expose the entire production database, email service, media storage, and authentication system.

**Impact:** Complete compromise of production data, unauthorized email sending, media replacement/deletion, and session forgery if exposed.

**Recommendation:**
1. Rotate all listed credentials immediately as a precautionary measure.
2. Store secrets in a managed vault (e.g., Render.com environment variables, Doppler, HashiCorp Vault).
3. Use short-lived scoped tokens where possible rather than long-lived API keys.
4. Enable MongoDB Atlas IP allowlisting to restrict database access to known server IPs only.

---

### F-02: Incorrect `NODE_ENV` Value Breaks Environment Detection

**Severity:** 🟠 High  
**Category:** Configuration  
**Location:** `.env`, line 3

**Description:** The `.env` file sets `NODE_ENV= developer` with a leading space after the equals sign. When loaded by `dotenv`, the value becomes `" developer"` (with space). The server uses this value to determine whether to serve static production assets from `dist/` or mount Vite dev middleware:

```typescript
if (process.env.NODE_ENV === "production") {
  // serve static dist/
} else {
  // mount Vite dev middleware
}
```

Since `" developer" !== "production"`, the server will always take the development branch, even when intended for production deployment on Render.com. This could result in attempting to load Vite middleware in production (which may fail or cause unexpected behavior) instead of serving compiled static assets.

Additionally, the log statement at startup prints `[SERVER] Environment:  developer` which confirms the space is preserved.

**Impact:** Production server may fail to serve the built frontend correctly, or serve in development mode with unminified code and source maps enabled.

**Recommendation:** Set `NODE_ENV=developer` without spaces, or more appropriately `NODE_ENV=production` for the deployed environment. Ensure Render.com environment variables override this correctly.

---

### F-03: TypeScript Compilation Failure Due to Missing Module

**Severity:** 🟠 High  
**Category:** Build Health  
**Location:** `src/App.tsx` line 3; `package.json`

**Description:** Running `tsc --noEmit` (the project's `lint` script) produces:

```
src/App.tsx(3,27): error TS2307: Cannot find module '@vercel/analytics/react' or its corresponding type declarations.
```

Investigation confirmed that `node_modules/@vercel/analytics` does not exist despite being listed in `package.json` dependencies (`"@vercel/analytics": "^2.0.1"`). This indicates either:
- An incomplete `npm install` was performed, or
- The package was added to `package.json` but never installed locally.

Since the build script runs `vite build` (which does not type-check), the production build would succeed but ship with a broken import that fails at runtime when the lazy-loaded chunk attempts to resolve the module.

**Impact:** Runtime failure on all pages importing `Analytics` from `@vercel/analytics/react`; lint/type-check gate cannot pass.

**Recommendation:** Run `npm install` to restore the missing module. Verify `npx tsc --noEmit` passes cleanly afterward.

---

### F-04: Zero Test Coverage

**Severity:** 🟠 High  
**Category:** Quality Assurance  
**Location:** Entire codebase

**Description:** The project contains no unit tests, integration tests, end-to-end tests, or test framework configuration. There is no Jest, Vitest, Playwright, Cypress, or any testing library present in `package.json`. The `lint` script only runs TypeScript type checking (`tsc --noEmit`).

For an application handling lead data, authentication, payment-adjacent workflows, and file uploads, this represents a significant quality risk. Refactoring or adding features can silently break existing functionality without detection.

**Impact:** High regression risk; inability to confidently deploy changes; no automated validation of business logic.

**Recommendation:**
1. Add Vitest for frontend component and utility testing.
2. Add Supertest + an in-memory MongoDB (mongodb-memory-server) for backend API route testing.
3. Prioritize tests for: authentication flows, lead CRUD, broker isolation, file upload validation, and OTP verification.

---

### F-05: Monolithic Backend Architecture

**Severity:** 🟠 High  
**Category:** Architecture / Maintainability  
**Location:** `server.ts` (823 lines)

**Description:** The entire backend is contained in a single `server.ts` file including:
- All Mongoose schemas and models (User, Broker, Lead, Setting, CMS, ClientDocument, SiteVisit, Counter)
- All email composition functions (lead notification, OTP, developer inquiry, broker credentials)
- Authentication middleware and JWT logic
- Rate limiter configurations
- Zod validation schemas
- All API route handlers (~40 endpoints)
- Cloudinary upload configuration
- Database seeding logic
- Server startup and Vite integration

This monolithic structure makes the code difficult to navigate, test individual components, and maintain. Adding new features requires editing the same large file, increasing merge conflict risk and cognitive load.

**Impact:** Reduced maintainability, difficulty writing targeted tests, higher risk of introducing bugs during modifications.

**Recommendation:** Split into logical modules:
```
server/
  models/       → User.ts, Broker.ts, Lead.ts, etc.
  routes/       → auth.routes.ts, leads.routes.ts, etc.
  middleware/   → auth.ts, rateLimiter.ts, upload.ts
  services/     → email.service.ts, cloudinary.service.ts
  schemas/      → zod.schemas.ts
  config/       → db.ts, env.ts
  seed.ts       → Initial data seeding
```

---

### F-06: Duplicate Vite Dependency

**Severity:** 🟡 Medium  
**Category:** Dependencies  
**Location:** `package.json`

**Description:** Vite `^6.2.0` appears in both the `dependencies` and `devDependencies` sections. Since Vite is exclusively a build tool and should never be bundled into production output, its placement in `dependencies` is incorrect and creates ambiguity about which copy npm resolves.

**Impact:** Potential version resolution conflicts; unnecessary production dependency; confusion about build toolchain.

**Recommendation:** Remove `"vite": "^6.2.0"` from `dependencies`. Retain only in `devDependencies`.

---

### F-07: Unused Runtime Dependencies

**Severity:** 🟡 Medium  
**Category:** Dependencies / Attack Surface  
**Location:** `package.json`

**Description:** Several packages listed under `dependencies` appear to have no imports anywhere in the source code:

| Package | Purpose | Referenced In Source? |
|---------|---------|----------------------|
| `@google/genai` | Gemini AI SDK | No |
| `@google/stitch-sdk` | Stitch UI generation | No |
| `better-sqlite3` | SQLite database driver | No (legacy from prior architecture) |
| `mongoose-sequence` | Auto-increment plugin | Not imported (manual counter used instead) |
| `clsx` | Class name utility | Not found in searched components |
| `tailwind-merge` | Tailwind class merging | Not found in searched components |

These add ~200MB+ to `node_modules` (particularly `better-sqlite3` which compiles native bindings), slow install times, and expand the supply chain attack surface.

**Impact:** Slower builds, larger deployment artifacts, unnecessary vulnerability exposure from unmaintained transitive dependencies.

**Recommendation:** Remove unused packages. Run `npm uninstall @google/genai @google/stitch-sdk better-sqlite3 mongoose-sequence clsx tailwind-merge` after confirming they are truly unreferenced.

---

### F-08: Content Security Policy Allows Unsafe Script Execution

**Severity:** 🟡 Medium  
**Category:** Security Headers  
**Location:** `server.ts` lines 452–469 (Helmet CSP directives)

**Description:** The Helmet Content-Security-Policy configuration includes:
```typescript
scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.jsdelivr.net"],
scriptSrcAttr: ["'unsafe-inline'"],
```

The `'unsafe-eval'` directive permits the use of `eval()`, `new Function()`, and `setTimeout()` with string arguments, significantly weakening XSS protections. `'unsafe-inline'` allows inline `<script>` blocks and event handlers. While some frameworks require these during development, keeping them in production reduces the effectiveness of CSP as a defense-in-depth mechanism against cross-site scripting attacks.

The `cdn.jsdelivr.net` allowance also broadens the attack surface to any script hosted on that CDN domain.

**Impact:** Reduced XSS mitigation effectiveness; potential exploitation if an injection vector is found elsewhere.

**Recommendation:**
1. Remove `'unsafe-eval'` in production builds.
2. Replace `'unsafe-inline'` with nonce-based or hash-based script policies.
3. Pin specific packages on cdn.jsdelivr.net rather than allowing the entire origin.

---

### F-09: Architecture Document References Outdated Database Technology

**Severity:** 🟡 Medium  
**Category:** Documentation Accuracy  
**Location:** `Ayushmaan_Residency_Backend_Architecture_v2.md`

**Description:** The architecture document describes the backend using SQLite with `better-sqlite3`, referencing a `leads.db` file. However, the actual implementation uses MongoDB Atlas via Mongoose ORM. Schema definitions, query patterns, and deployment instructions in the document do not match the current codebase.

This discrepancy can mislead developers joining the project, cause incorrect assumptions about data modeling, and result in wasted time debugging based on outdated information.

**Impact:** Developer confusion; incorrect onboarding; potential misuse of documented but nonexistent APIs.

**Recommendation:** Update `Ayushmaan_Residency_Backend_Architecture_v2.md` to accurately reflect MongoDB/Mongoose architecture, or deprecate it and write a new document.

---

### F-10: Predictable Default Broker Password Pattern

**Severity:** 🟡 Medium  
**Category:** Security  
**Location:** `server.ts` — `generateDefaultBrokerPassword()` function

**Description:** When a new broker account is created, the system generates a default password using the pattern `{firstName}{suffix}` where suffix defaults to `@00` (from `BROKER_DEFAULT_PASSWORD_SUFFIX`). For example, a broker named "Vivek Singh" receives password "Vivek@00".

This pattern is highly predictable. An attacker who knows a broker's name and guesses the suffix convention can attempt credential stuffing against the login endpoint. While rate limiting exists (10 attempts per 15 minutes), the narrow search space makes brute-force feasible over extended periods.

**Impact:** Unauthorized access to broker portal, lead data exposure, potential lateral movement.

**Recommendation:**
1. Generate cryptographically random passwords (e.g., `crypto.randomBytes(12).toString('base64url')`).
2. Force password change on first login.
3. Send credentials via a secure channel (not plain HTML email showing the password in cleartext).

---

### F-11: Public Settings Endpoint Without Authentication

**Severity:** 🟡 Medium  
**Category:** Access Control  
**Location:** `server.ts` — `app.get("/api/settings", ...)` (line 561)

**Description:** The `GET /api/settings` endpoint requires no authentication and returns all rows from the `settings` collection. Depending on what data is stored in settings (site configuration, feature flags, potentially sensitive operational parameters), this could leak internal configuration details to unauthenticated users.

The corresponding POST endpoint is properly protected with `verifyAdmin`.

**Impact:** Information disclosure of site configuration; reconnaissance aid for attackers.

**Recommendation:** Either protect the GET endpoint with authentication or filter the response to include only publicly safe keys (whitelist approach).

---

### F-12: Absence of CI/CD Pipeline

**Severity:** 🟡 Medium  
**Category:** DevOps  
**Location:** Repository root (no workflow files detected)

**Description:** There are no GitHub Actions, GitLab CI, or other pipeline configuration files. The deployment process relies entirely on manual execution (`npm run commit` script pushes directly to main branch). No automated checks run before deployment:

- No TypeScript compilation gate
- No linting beyond basic `tsc`
- No test suite execution
- No build verification
- No security audit (`npm audit`)

**Impact:** Broken code can reach production without detection; no automated rollback capability; inconsistent deployment process.

**Recommendation:** Add GitHub Actions workflow with steps: install → type-check → build → test → deploy. Enable branch protection rules requiring status checks to pass before merge.

---

### F-13: Oversized Single-File Components

**severity:** 🟡 Medium  
**Category:** Code Quality / Maintainability  
**Location:** `src/components/portal/SuperAdminPortal.tsx` (58,432 bytes); `src/components/portal/BrokerPortal.tsx` (57,737 bytes)

**Description:** Two portal components exceed 55KB each, containing hundreds of lines of JSX, state management logic, API calls, and UI rendering within a single functional component. This makes them difficult to reason about, refactor, or selectively update.

**Impact:** Poor developer experience; increased cognitive complexity; slower hot-module reload during development; difficulty isolating bugs.

**Recommendation:** Decompose into sub-components grouped by functional area (e.g., LeadTable, StatsCards, BrokerForm, DocumentUploader, PaginationControls, Modal dialogs, etc.). Extract custom hooks for data fetching and state logic.

---

### F-14: Minimal README Documentation

**Severity:** 🟢 Low  
**category:** Documentation  
**Location:** `README.md`

**Description:** The README contains a single line: "Get the Live Website at : https://ayushmanresidency.vercel.app/". It provides no setup instructions, prerequisites, environment variable documentation, or architectural overview.

**Impact:** New contributors cannot quickly set up a local development environment; undocumented tribal knowledge.

**Recommendation:** Expand README with sections for prerequisites, installation steps, environment variables table, scripts reference, and folder structure overview.

---

## 5. Positive Observations

The following practices demonstrate deliberate security and quality engineering effort and deserve recognition:

- ✅ **JWT Secret Enforcement:** Server refuses to start if `JWT_SECRET` is missing or shorter than 32 characters.
- ✅ **Zod Input Validation:** All mutation endpoints validate request bodies against Zod schemas.
- ✅ **Rate Limiting:** Six distinct rate limiters configured per endpoint type (login, OTP, lead submission, file lookup, developer contact, password reset).
- ✅ **Helmet CSP:** Comprehensive Content-Security-Policy configured with explicit directives for fonts, images, scripts, and connections.
- ✅ **CORS Lockdown:** CORS origin restricted to `APP_URL`; falls back to `false` (deny all) if unset.
- ✅ **Broker Isolation Middleware:** Dedicated `verifyBroker` middleware ensures brokers can only access their own assigned leads, visits, and documents.
- ✅ **Timing-Safe OTP Comparison:** Uses `crypto.timingSafeEqual()` to prevent timing attacks during OTP verification.
- ✅ **OTP Attempt Tracking:** Maximum 5 OTP verification attempts before invalidation.
- ✅ **bcrypt Password Hashing:** Cost factors of 10 (admin) and 12 (broker) applied consistently.
- ✅ **File Upload Whitelisting:** MIME type check plus 10MB size limit plus Cloudinary format restriction.
- ✅ **Lazy Loading:** Route-level code splitting with React.lazy and Suspense boundaries.
- ✅ **Image Optimization:** WebP formats throughout; dedicated `optimize-images.js` utility.
- ✅ **SEO:** Structured data (Schema.org), Open Graph tags, sitemap.xml, robots.txt, canonical URLs.
- ✅ **Git Hygiene:** `.env` properly gitignored; no secrets in commit history (confirmed via `git log --all -- .env`).

---

## 6. Risk Matrix

| Impact ↓ / Likelihood → | Unlikely | Possible | Likely |
|--------------------------|----------|----------|--------|
| **Severe** | | F-01 (credential exposure) | |
| **Major** | | F-02 (env misconfig) | F-03 (build failure) |
| **Moderate** | F-08 (weak CSP) | F-10 (predictable passwords) F-11 (public settings) | F-04 (no tests) |
| **Minor** | F-09 (stale docs) | F-06, F-07 (deps) F-12 (no CI/CD) | F-05, F-13 (monoliths) |

---

## 7. Remediation Roadmap

### Immediate (Priority 1 — within 24 hours)

1. **Rotate all credentials** listed in `.env` (F-01).
2. **Fix `NODE_ENV`** to remove leading space and set correct value (F-02).
3. **Run `npm install`** to resolve missing `@vercel/analytics` module (F-03).
4. **Verify `tsc --noEmit` passes** after dependency restoration.

### Short-Term (Priority 2 — within 1 week)

5. Restrict `GET /api/settings` response to safe public keys (F-11).
6. Implement random password generation for broker accounts (F-10).
7. Remove unused npm packages (F-07).
8. Deduplicate Vite from `dependencies` (F-06).

### Medium-Term (Priority 3 — within 30 days)

9. Set up GitHub Actions CI pipeline with type-check and build gates (F-12).
10. Add Vitest and Supertest test suites covering critical paths (F-04).
11. Harden CSP by removing `'unsafe-eval'` and implementing nonces (F-08).
12. Update architecture documentation to reflect MongoDB (F-09).

### Long-Term (Priority 4 — next sprint)

13. Refactor `server.ts` into modular directory structure (F-05).
14. Decompose oversized portal components into focused sub-components (F-13).
15. Write comprehensive README with setup and contribution guidelines (F-14).

---

## 8. Methodology & Limitations

This audit was conducted through:

- Manual source code review of all TypeScript/React files
- Static analysis via TypeScript compiler (`tsc --noEmit`)
- Dependency tree inspection (`package.json`, `package-lock.json`)
- Git history analysis for credential leakage
- Configuration file review (Vercel, Vite, tsconfig)
- Documentation consistency check

**Limitations:** This audit did not include dynamic testing, penetration testing, network-level analysis, or third-party service configuration review. Runtime behavior was not verified against a live instance. Dependency vulnerability scanning (`npm audit`) was not performed due to execution policy restrictions in the audit environment.

---

*End of Report*
