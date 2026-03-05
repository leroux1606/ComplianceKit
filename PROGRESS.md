# ComplianceKit — Implementation Progress

> This file is updated by Claude at the end of every working session.
> At the start of each session: read AUDIT.md for the full issue list, then read this file to know where we are.

---

## HOW CLAUDE SHOULD USE THIS FILE

At the start of each session:
1. Read AUDIT.md to understand the full picture
2. Read this file to know what is done, in progress, and next
3. When the user says "work on [item]" — implement it, then update this file
4. Always append to the Session Log at the bottom with date + what was done

---

## CURRENT STATUS

**Phase:** Pre-launch (P0 items in progress)
**P0 items completed:** 6 / 6 ✓ ALL P0 ITEMS COMPLETE
**P1 items completed:** 9 / 19
**P2 items completed:** 3 / 6

---

## P0 — LAUNCH BLOCKERS (Must complete before first paying customer)

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| A1 | DSAR confirmation email to requester | COMPLETE | `sendDsarConfirmationEmail` in lib/email.ts |
| A2 | DSAR notification email to website owner | COMPLETE | `sendDsarOwnerNotificationEmail` in lib/email.ts |
| A3 | Add banner/policy version to consent records | COMPLETE | 3 new fields on Consent model |
| A4 | Consent withdrawal mechanism in widget | COMPLETE | Withdrawal button + settings modal in widget |
| B1 | SSRF protection on scanner URL input | COMPLETE | `lib/ssrf-check.ts` + scanner + website actions |
| D1 | Google Consent Mode v2 | COMPLETE | Widget JS + config API + DB field + UI toggle |

---

## P1 — FIRST MONTH (Complete within 30 days of launch)

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| A5 | Legal disclaimer on generated policies | COMPLETE | Inline-styled amber warning box at top of both policy templates |
| A6 | Data Processing Agreement (DPA) | COMPLETE | `/dpa` public page + `dpaAcceptedAt` on User model + signup checkbox |
| A7 | Fix age verification approach | COMPLETE | Removed checkbox; ToS s.3.1 (18+ required) is the legal basis |
| A8 | Compliance score disclaimer | COMPLETE | Disclaimer in scan results CardFooter + ComplianceGauge |
| A9 | Consent record CSV export | COMPLETE | GET `/api/websites/[id]/consent-export` + `ConsentExportButton` in website Quick Actions |
| B2 | Widget template injection audit | COMPLETE | `safeJsString()` + DB validation in script.js route |
| B3 | Rate limit fail-open alerting | COMPLETE | In-memory fallback + `RATE_LIMIT_DB_ERROR` security alert |
| B4 | DSAR file attachment security audit | COMPLETE | Feature unimplemented (no risk); validator + schema guards created |
| B5 | Paystack webhook signature audit | COMPLETE | HMAC-SHA512 correct; fixed non-timing-safe comparison → `crypto.timingSafeEqual()` |
| D2 | Demo mode + setup wizard | NOT STARTED | |
| D3 | WordPress plugin | NOT STARTED | |
| D4 | USD pricing on marketing page | NOT STARTED | |
| D5 | Onboarding email sequence | NOT STARTED | |
| E1 | Onboarding checklist in dashboard | NOT STARTED | |
| E2 | Actionable compliance score UI | NOT STARTED | |
| E3 | Installation verification tool | NOT STARTED | |
| F1 | Sentry error tracking | NOT STARTED | |
| F2 | Security event alerting | NOT STARTED | |
| F3 | Uptime monitoring setup | NOT STARTED | External service only |

---

## P2 — SCALE (Complete before 50+ customers)

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| C1 | Async job queue for scans | COMPLETE | Fire-and-forget run route + status polling; zero new deps |
| C2 | Widget JS on CDN | COMPLETE | `public/widget.js` static file; legacy route is a zero-DB bootstrap shim |
| C3 | Database connection pooling | COMPLETE | `max:1` on Pool + `directUrl` in schema + `.env.example` docs |
| C4 | Consent table archival | NOT STARTED | |
| D6 | Public JS API for banner | NOT STARTED | |
| E4 | Live banner preview in config | NOT STARTED | |

---

## RECOMMENDED NEXT SESSION ORDER

Start here if no specific instruction given:

1. **B1** — SSRF protection (security risk, fast to fix, unblocks safe testing)
2. **A1 + A2** — DSAR emails (legal requirement, Resend already wired)
3. **D1** — Google Consent Mode v2 (biggest revenue impact)
4. **A4** — Consent withdrawal mechanism
5. **A3** — Consent record versioning (DB migration)

---

## SESSION LOG

### 2026-03-05 — A3: Consent record versioning (final P0 item)
- Added 3 fields to `Consent` model:
  - `consentMethod String @default("unknown")` — `accept_all` | `reject_all` | `custom`
  - `bannerConfigVersion String?` — `BannerConfig.updatedAt` ISO string at consent time (identifies which banner version the visitor saw)
  - `policyVersion Int?` — active privacy policy version at consent time
- `prisma db push` applied, Prisma client regenerated
- Consent API (`/api/widget/[embedCode]/consent`):
  - Accepts `consentMethod` from request body, validates against allowed values
  - Resolves `bannerConfigVersion` and `policyVersion` server-side via parallel DB lookups
  - Stores all three new fields on both create and update paths
- Widget JS: `saveConsent()` now takes `consentMethod` as 3rd arg; all 4 call sites pass the correct value (`accept_all`, `reject_all`, `custom`)
- TypeScript clean

---

## ALL 6 P0 ITEMS COMPLETE — READY FOR FIRST PAYING CUSTOMER

---

### 2026-03-05 — A4: Consent withdrawal mechanism
- Added `withdrawalButtonPosition String @default("bottom-right")` to `BannerConfig` schema + pushed to DB
- Config API exposes `withdrawalButtonPosition` inside the `config` object
- Widget JS refactored:
  - Removed early `return` for returning visitors — config is always fetched (needed for withdrawal button config)
  - `createWithdrawalButton(config, consentModeV2)` — persistent floating pill button, configurable corner position, appears after banner interaction and on every subsequent page load
  - `openSettingsModal(config, consentModeV2)` — modal overlay with pre-populated toggles (reads `window.CK_CONSENT`), reuses injected `.ck-*` CSS classes so toggles match the banner theme; saves via `saveConsent()`, closes on overlay click or ✕
  - `injectStyles(config)` extracted so styles are shared by banner and modal (guarded with `id="ck-styles"` to avoid double-injection)
  - `hideBanner(banner, callback)` now takes an optional callback — withdrawal button is created after the hide animation completes
- Dashboard: select added to banner config form for button position (bottom-right / bottom-left)
- TypeScript clean
- **Next:** A3 (consent record versioning — last P0 item)

### 2026-03-05 — D1: Google Consent Mode v2
- Added `consentModeV2 Boolean @default(true)` to `BannerConfig` schema + `prisma db push` applied to live DB
- Config API (`/api/widget/[embedCode]/config`) now returns `consentModeV2` flag
- Widget JS changes:
  - `gtagConsent()` helper creates a dataLayer shim if `window.gtag` doesn't exist (safe for GTM + gtag.js)
  - `setDefaultGtagConsent()` fires `gtag('consent', 'default', { all: 'denied' })` before the banner appears
  - `updateGtagConsent(prefs)` fires `gtag('consent', 'update', {...})` after user decides (maps marketing→ad signals, analytics→analytics_storage)
  - `consentModeV2` flag stored in localStorage with consent record — returning visitors get update signals without a config fetch
  - Signals are only fired when `consentModeV2: true` in config; no-op on sites without Google products
- `BannerConfigForm` — toggle switch added before Save button with descriptive help text
- `bannerConfigSchema` and `getDefaultBannerConfig()` updated
- TypeScript clean
- **Next:** A4 (consent withdrawal) or A3 (consent versioning)

### 2026-03-05 — A1 + A2: DSAR emails
- Added `sendDsarConfirmationEmail()` to `lib/email.ts` — sends requester their reference number, request type, due date, and company name
- Added `sendDsarOwnerNotificationEmail()` to `lib/email.ts` — sends website owner requester details, request type, due date (highlighted in red), and direct dashboard link
- Updated `app/api/dsar/[embedCode]/route.ts` to include `user { email }` in website query and call both emails via `Promise.allSettled` after DSAR creation
- Email failures are logged but do not fail the DSAR submission (correct behaviour — DSAR must be recorded even if email bounces)
- In dev mode, emails print to console (existing `sendEmail` behaviour)
- TypeScript clean
- **Next:** D1 (Google Consent Mode v2)

### 2026-03-05 — B1: SSRF protection
- Created `lib/ssrf-check.ts` with `validateScanUrl()` utility
- Blocks: non-HTTP(S) protocols, localhost, .local/.internal/.localhost TLDs, private IP ranges (RFC1918, loopback, link-local/AWS metadata, CGNAT, IPv6 private), unresolvable hostnames
- Defense in depth: validation runs in scanner (before `page.goto`) AND in website create/update actions
- TypeScript clean (`tsc --noEmit` passes)
- **Next:** A1 + A2 (DSAR emails)

### 2026-03-05 — B4: DSAR file attachment security audit
- **Audit finding:** `DsarAttachment` schema model exists but zero upload implementation — no API route, no storage integration, no component. No active vulnerability.
- Created `lib/dsar/attachment-validator.ts` — security-first validator ready for when storage is integrated:
  - `validateAttachment(buffer, filename, declaredMime)` — enforces all four required controls
  - MIME allowlist (PDF, JPEG, PNG, WebP, GIF, plain text, DOC, DOCX)
  - Magic-number byte inspection — validates actual file bytes, not just Content-Type header
  - 10 MB hard cap (`MAX_ATTACHMENT_BYTES`)
  - `sanitizeFilename()` — strips path separators, double-dot traversal, control chars, leading dots
- Added security requirement comments to `DsarAttachment` model in `prisma/schema.prisma` documenting: private bucket requirement, signed-URL-only serving, size/MIME/filename rules
- TypeScript clean

---

### 2026-03-05 — C3: Database connection pooling
- **Problem:** `pg.Pool` default size is 10. With 50 concurrent Vercel serverless cold starts each opening a pool, that's 500 connections — well above typical PostgreSQL limits (100 default).
- **Code fix 1 — `lib/db.ts`:** Added `max: 1` to `Pool` config. Each serverless instance handles one request at a time, so a pool larger than 1 only wastes connections. PgBouncer then multiplexes these single connections across all instances.
- **Code fix 2 — `prisma/schema.prisma`:** Added `directUrl = env("DIRECT_URL")`. Prisma uses `DIRECT_URL` for migrations (`prisma db push` / `migrate deploy`) and `DATABASE_URL` for runtime queries. Needed because PgBouncer runs in transaction mode and can't handle the persistent connections that migrations require.
- **Code fix 3 — `.env.example`:** Documented both URLs with step-by-step instructions for Neon and Supabase (which dashboard tab, which port).
- **Infrastructure action required (not in code):** Point `DATABASE_URL` to the PgBouncer pooled endpoint in your Neon or Supabase project settings. Set `DIRECT_URL` to the direct connection string. This is a Vercel env var update — no redeployment needed.
- TypeScript clean

---

### 2026-03-05 — C2: Widget JS served as static file (CDN-ready)
- **Problem:** Every page load on every customer site hit `/api/widget/[embedCode]/script.js` — a serverless function with a DB lookup. 100 customers × 1,000 visitors/day = 100,000 serverless invocations/day from the widget script alone.
- **Solution:** Widget JS is now a single universal static file at `public/widget.js`, served by Next.js with zero serverless cost. Any CDN (Cloudflare, CloudFront) can cache it globally.
- Key changes to the JS:
  - `CK_EMBED_CODE` is read at runtime from `document.currentScript.getAttribute('data-embed-code')` (primary)
  - Fallback: parses embedCode from the script src URL (legacy `/api/widget/[embedCode]/script.js` format)
  - `CK_API_URL` is derived from `new URL(document.currentScript.src).origin` — works in dev and production without hardcoding
  - `document.currentScript` is captured synchronously at IIFE entry before any async code can null it
  - All banner/withdrawal/consent/GCM v2 logic is identical to the old template
- `script.js/route.ts` — replaced DB-querying route with a zero-DB bootstrap shim:
  - Validates embedCode format with regex (no DB needed)
  - Returns a 3-line JS snippet that injects `<script src="/widget.js" data-embed-code="...">` — backward compat for old embed snippets
  - `Cache-Control: public, max-age=86400, stale-while-revalidate=604800` — CDN caches it for 24h
- New embed format: `<script src="/widget.js" data-embed-code="ABC123" defer></script>`
- `EmbedCodeDisplay` updated to show new format with updated description copy
- **CDN upgrade path:** Upload `public/widget.js` to Cloudflare R2 / S3+CloudFront, update `NEXT_PUBLIC_APP_URL` or the embed snippet URL. No code changes required.
- TypeScript clean

---

### 2026-03-05 — C1: Async job queue for scans
- **Problem:** `triggerScan()` was a server action that blocked for up to 120s while Puppeteer ran, causing UI hangs and Vercel 60s timeout kills.
- **Solution:** Zero-dependency fire-and-forget + polling architecture:
  - `triggerScan()` (server action) — now only creates a `queued` scan record and returns `{scanId}` in <100ms
  - `lib/scan-runner.ts` — extracted full scan execution logic (Puppeteer + DB writes), shared module callable from server
  - `POST /api/scans/[id]/run` — authenticated route that runs the actual scan; client calls this fire-and-forget (does not await response)
  - `GET /api/scans/[id]/status` — lightweight poll endpoint returning `{status, score, error}`; auto-recovers stale "running" scans after 5 minutes (serverless timeout detection)
  - `ScanButton` — fully rewritten: queues scan, fires run endpoint without awaiting, polls status every 3s, shows "Queued…" → "Scanning…" states, navigates to results on completion, shows error toast on failure
- Scan status values: `queued` → `running` → `completed` / `failed` (no schema change — string field)
- TypeScript clean
- **Upgrade path:** To migrate to Inngest/Trigger.dev, replace the `fetch(/api/scans/${scanId}/run)` call in ScanButton with `inngest.send('scan/requested', { scanId })` — no other changes needed

---

### 2026-03-05 — B5: Paystack webhook signature audit
- **Audit finding:** HMAC-SHA512 verification was already implemented and correctly structured — raw body read with `request.text()` before JSON parsing, `x-paystack-signature` header checked before any business logic, 401 returned on failure.
- **Issue found:** `hash === signature` string equality is not timing-safe. An attacker with precise network timing could potentially reconstruct the expected HMAC byte by byte via repeated requests.
- **Fix:** Replaced `hash === signature` with `crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))` wrapped in try/catch (timingSafeEqual throws if buffer lengths differ — catches malformed signatures).
- TypeScript clean (no new types introduced).

---

### 2026-03-05 — B3: Rate limit fail-open alerting + in-memory fallback
- Added `RATE_LIMIT_DB_ERROR` to `SecurityEventType` enum in `lib/security-log.ts`
- Added it to `shouldAlert()` — triggers a `[SECURITY ALERT]` console error (and future email/Slack once F2 is implemented)
- Added `checkMemoryFallback()` in `lib/rate-limit.ts`:
  - Per-instance Map-based sliding window: 20 req/min per IP+path key
  - Probabilistic cleanup when Map exceeds 500 entries to bound memory
- Updated catch block: now logs `RATE_LIMIT_DB_ERROR` event AND applies in-memory fallback instead of silently allowing all requests
- Result: during DB outage, each serverless instance independently enforces 20 req/min (down from unlimited); alerts fire so the outage is visible
- TypeScript clean

---

### 2026-03-05 — B2: Widget script template injection fix
- **Vulnerability:** `embedCode` (URL path parameter — attacker-controlled) was interpolated directly into a JS string literal with single quotes: `var CK_EMBED_CODE = '${embedCode}'`. A payload like `'+alert(document.domain)+'` would break out and execute on any site embedding the widget.
- **Fix 1:** Added `safeJsString()` helper using `JSON.stringify()` + manual U+2028/U+2029 escaping. `JSON.stringify` produces a properly double-quoted, escape-safe JS string literal for any input.
- **Fix 2:** Added DB lookup at the start of the route — `embedCode` is validated against the `Website` table before any script is generated. Unknown/malicious codes now receive a 404 instead of a rendered script template.
- Changed two interpolation points: `CK_EMBED_CODE` and `CK_API_URL` base URL
- TypeScript clean

---

### 2026-03-05 — A9: Consent record CSV export
- Created `app/api/websites/[id]/consent-export/route.ts` — authenticated GET endpoint
  - Verifies website ownership (userId match) before querying
  - Exports all consent records as RFC-compliant CSV (double-quote escaped)
  - Columns: visitor_id, consented_at, updated_at, consent_method, policy_version, banner_version, necessary, analytics, marketing, functional, ip_address, user_agent
  - Supports optional `?from=` / `?to=` date filter query params
  - Filename: `consent-log-[website-name]-[date].csv`
- Created `components/dashboard/consent-export-button.tsx` — client component
  - Fetches the export route, creates a Blob URL, triggers browser download
  - Shows loading spinner while downloading, toast on success/error
- Added `ConsentExportButton` to website detail page Quick Actions — only visible when `_count.consents > 0`
- TypeScript clean

---

### 2026-03-05 — A8: Compliance score disclaimer
- Added disclaimer to scan results page (`/dashboard/websites/[id]/scans/[scanId]/page.tsx`): CardFooter below `ComplianceScore` with "Technical indicators only. Does not constitute legal advice — a high score does not guarantee regulatory compliance."
- Added disclaimer to `ComplianceGauge` component (analytics page): small text below the score label
- TypeScript clean

---

### 2026-03-05 — A7: Fix age verification approach
- Removed the "I confirm I am 16 or older" checkbox from the signup form (a checkbox is legally meaningless as age verification)
- Removed `ageConfirmation` field from `signUpSchema` in `lib/validations.ts`
- Removed `ageVerifiedAt: now` from `lib/auth-actions.ts` — field remains nullable in DB for existing records
- Age eligibility is now enforced by Terms of Service section 3.1: "You must be at least 18 years old and legally capable of entering into binding contracts"
- This is the correct approach for B2B SaaS: the ToS contract itself establishes eligibility; a checkbox adds no legal protection
- TypeScript clean

---

### 2026-03-05 — A6: Data Processing Agreement (GDPR Article 28)
- Added `dpaAcceptedAt DateTime?` to `User` model in Prisma schema + `prisma db push` applied + client regenerated
- Created `app/(marketing)/dpa/page.tsx` — full GDPR Article 28 compliant DPA public page (same styling as `/terms`)
  - Covers: definitions, parties, subject matter, nature/purpose of processing, types of personal data, data subject categories, processor obligations (Art. 32 security, sub-processors, data subject rights, breach notification), controller obligations, sub-processors table (Supabase, Resend, Vercel), international transfers (SCCs), data retention periods, liability, governing law
- Updated `signUpSchema` in `lib/validations.ts` — added `acceptDpa: z.literal(true)` field
- Updated `components/auth/sign-up-form.tsx` — added DPA checkbox with link to `/dpa`, opens in new tab
- Updated `lib/auth-actions.ts` — stores `dpaAcceptedAt: now` on user creation alongside `consentedAt` and `ageVerifiedAt`
- TypeScript clean

---

### 2026-03-05 — A5: Legal disclaimer on generated policies
- Added inline-styled amber warning box to both policy templates before the `<h1>` heading
- `lib/generators/templates/privacy-policy.ts` — disclaimer before `<h1>Privacy Policy</h1>`
- `lib/generators/templates/cookie-policy.ts` — disclaimer before `<h1>Cookie Policy</h1>`
- Uses inline CSS (amber background, dark amber border/text) — renders in all contexts: dashboard iframe preview, public `/api/policy/[embedCode]` endpoint, downloaded HTML
- TypeScript clean

---

### 2026-03-03 — Initial audit and roadmap creation
- Performed full codebase analysis
- Created AUDIT.md with all issues prioritized by severity
- Created PROGRESS.md (this file) as working session tracker
- No code changes made this session
- **Next recommended action:** Start with B1 (SSRF protection) as it is a security risk and a fast fix

---
