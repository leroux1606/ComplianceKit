# Project Status — 13 April 2026

Two-app compliance suite: **ComplianceKit** (privacy/GDPR) + **AccessKit** (accessibility/WCAG).

---

## ComplianceKit — Status

### Done ✅

**Critical fixes applied (from FINAL-REVIEW.md):**
- DB connection pool raised from `max: 1` → `max: 10` — was a complete bottleneck
- Consent upsert logic fixed + `@@unique([websiteId, visitorId])` added to schema
- Prisma migration baseline created (`0001_init`, `0002_dsar_token_expiry`)
- OAuth account linking vulnerability removed (`allowDangerousEmailAccountLinking`)
- Timeouts added to all external service calls (Resend 10s, PayStack 15s, Claude 60s, Puppeteer 4min)
- Webhook invoice deduplication (PayStack + Stripe) — prevents duplicate billing records
- Scan race condition fixed — blocks duplicate queued scans per website
- UI bugs fixed: AddWebsiteForm loading state, DeleteAccountDialog setTimeout cleanup
- getDsarStats N+1 queries → single query
- DOMPurify added to policy HTML rendering
- getWebsite over-fetching fixed — selects only needed fields (~90% less data)
- Analytics query capped at 50k rows — prevents OOM on large accounts
- Consent CSV export streaming — handles any size export
- Deleted accounts blocked from API access after grace period
- Middleware (proxy.ts) — protects dashboard/admin routes at edge
- Email retry logic (3 attempts, exponential backoff)
- CRON secret now uses `crypto.timingSafeEqual` — 4 cron routes updated
- DSAR verify endpoint rate-limited (5 attempts / 15 min)
- DSAR verification token expiry added (72 hours) + migration `0003`
- Sentry sample rate raised (0.1 → 0.5 prod, 1.0 dev)
- Env validation at startup (`lib/env.ts` via `instrumentation.ts`)
- Structured JSON logger (`lib/logger.ts`) replacing console.log
- Rate-limit memory cleanup (setInterval every 5 min)
- Custom CSS sanitization (`sanitizeCustomCss` via Zod transform)
- Password min length consistency (sign-in min raised to 8)
- CSV cell newline escaping fixed
- All console.error replaced with structured logger in action files

**POPIA support added:**
- `lib/scanner/popia-detector.ts` — detects 5 POPIA compliance checks (Conditions 2/3/6/8, §72)
- `popiaScore` added to scanner, DB schema (`0003_popia_score`), and scan runner
- AI policy generator updated — now produces POPIA + GDPR + CCPA compliant policies
- POPIA score card shown on scan detail page alongside GDPR and CCPA scores
- Action checklist updated with POPIA finding metadata and Information Regulator links

**Google OAuth fixed (root cause was port mismatch):**
- Removed hardcoded `AUTH_URL`/`NEXTAUTH_URL` from `.env` — `trustHost: true` auto-detects
- Fixed corrupted line in `.env.local`
- Added `https://accounts.google.com` to CSP `form-action`
- Renamed `middleware.ts` → `proxy.ts` (Next.js 16 convention)
- Created `auth.config.ts` (Edge-safe) to fix Edge Runtime crypto error

### Outstanding ⏳

**Payment integration (BLOCKER for revenue):**
- No Peach Payments account yet — see section below
- PayStack stub is in the code but needs live credentials + webhook testing
- Subscription state machine needs end-to-end testing

**Before launch:**
- Run E2E test suite end-to-end (need to update `.env.test` to point to new DB or local PG)
- Sentry source maps: set `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` in Vercel
- PAYSTACK plan codes need to be created in PayStack dashboard and linked
- Update `.env.example` to remove `AUTH_URL` entry (done in code, should be removed from docs too)

**Nice to have:**
- Middleware: add locale routing support (currently cookie-only, no URL-based locale)
- Admin: move from `ADMIN_EMAILS` env var to `isAdmin` boolean on User model
- Add `/api/health/db` deep health check endpoint
- Team invite flow could be improved

---

## AccessKit — Status

### Done ✅

**App is running** at `http://localhost:3001`

**All 7 build phases complete (A–G):**
- Core scanning: axe-core + Playwright crawler, pa11y secondary engine
- Standards mapping: WCAG 2.1 A/AA, WCAG 2.2, Section 508, EN 301 549
- Fix suggestions: 50+ template fixes per violation type
- Issue workflow: detail pages, comments, assignment, bulk actions, priority matrix
- Reporting: PDF generation, CSV export, shareable links, VPAT compliance reports
- Agency features: white-label, client portals, REST API v1, webhooks, OpenAPI docs
- Automation: Inngest scheduled scans, email notifications, benchmarking
- Landing page, API docs, GDPR data export, cookie consent

**Infrastructure set up in this session:**
- Supabase database created and schema pushed
- GitHub OAuth configured and working
- `trustHost: true` added to auth config
- `?pgbouncer=true` added to DATABASE_URL for Supabase transaction pooler
- `directUrl` added to Prisma schema
- Demo data seeded (3 websites, violations)

### Outstanding ⏳

**Critical security bugs (from code review, fix before launch):**
1. SSRF bypass via DNS rebinding — `src/lib/ssrf-guard.ts` needs DNS resolution check
2. Crawler not SSRF-guarded — discovered URLs not checked before fetching
3. No response size limit on verification fetch — could exhaust memory
4. MEMBER role can delete websites — should be ADMIN/OWNER only

**Data/Logic bugs:**
5. Multi-org membership `findFirst` is non-deterministic — affects any multi-org user
6. Org switcher onClick is a no-op (TODO comment)
7. "Reports" sidebar link 404s — page either missing or not wired up

**Payment integration (BLOCKER for revenue):**
- No Peach Payments account yet — see section below

**Stubs that need completing:**
- Team member invitation flow
- Org context switching (cookie or URL-based)
- AI fix suggestions via Claude API (schema has `aiFixSuggestion` field, no API call yet)
- Screenshot capture (R2 stub, needs Cloudflare R2 credentials)

**GDPR compliance gaps:**
- Data export incomplete (missing `IssueComment` and issue assignments)
- No data retention cleanup job
- Cookie consent not persisted server-side

**Testing gaps:**
- Server actions untested
- Crawler/scanner untested
- Inngest pipeline untested

---

## Payment — Peach Payments (PayGate)

### Situation

Both apps need a payment processor. **Stripe is not available in South Africa.**

**PayGate is now Peach Payments** (`peachpayments.com`) — same company, rebranded.

### Decision: Both apps use PayStack

**Both ComplianceKit and AccessKit use PayStack** — one payment processor, consistent implementation, same knowledge.

- ComplianceKit: PayStack code already written, just needs live account + plan codes
- AccessKit: PayStack integration needs to be built (mirroring ComplianceKit's implementation)

Stripe code remains in both codebases untouched — for potential future use if a foreign entity is incorporated.

### Two PayStack accounts

Use **two separate PayStack accounts** (one per app) for clean revenue tracking. Bundle pricing is handled at the marketing/app level, not the payment processor level.

### What you need to do

1. **Sign up at paystack.com** — create one account for ComplianceKit, one for AccessKit
2. Get your **Secret Key** and **Public Key** from each dashboard
3. **Create subscription plans** in each PayStack dashboard (Starter, Professional, Enterprise)
4. Fill in the plan codes in each app's environment variables

So the payment situation is:
| App | Payment Processor | Status |
|-----|------------------|--------|
| ComplianceKit | PayStack | Code written, needs live account + plan codes |
| AccessKit | PayStack | Needs to be built (mirror ComplianceKit), needs live account |

---

## Bundle Strategy — Selling Both Apps Together

### Options

**Option A — Separate products, discount code for bundle**
- Sell each app independently at full price
- Offer a "Bundle" discount code that gives 30% off both
- Simplest to implement, flexible pricing

**Option B — Shared "Compliance Suite" landing page**
- New marketing site at e.g. `compliancesuite.co.za`
- Single pricing page with bundle tier
- Clicking "Buy" opens both checkouts in sequence (or one checkout with line items)
- Each app activates independently after payment

**Option C — Single login, cross-app SSO**
- Users sign in once, access both apps from a shared dashboard
- Requires shared auth (same database/auth provider)
- Most complex but best UX

**Recommended path:** Start with **Option A** — get both apps generating revenue independently first. Once you have paying customers, you'll know which bundle price point works. Option B or C can be built later with actual data.

### Pricing direction (suggestion)

| Tier | ComplianceKit | AccessKit | Bundle |
|------|--------------|-----------|--------|
| Starter | R299/mo | R499/mo | R649/mo (save 20%) |
| Professional | R799/mo | R1,299/mo | R1,699/mo (save 20%) |
| Agency | R1,999/mo | R3,499/mo | R4,399/mo (save 20%) |

---

## Immediate Next Steps (Priority Order)

### Tonight / Tomorrow
1. Sign up for PayStack account #1 (ComplianceKit) at paystack.com
2. Sign up for PayStack account #2 (AccessKit) at paystack.com

### This Week
3. Create PayStack subscription plans → fill plan codes in ComplianceKit `.env`
4. Test ComplianceKit PayStack billing end-to-end
5. Fix AccessKit critical security bugs (SSRF, MEMBER delete, 404 link)
6. Fix AccessKit multi-org membership bug

### Next Week
7. Build PayStack integration in AccessKit (mirror ComplianceKit's `lib/paystack.ts`)
8. Test AccessKit billing end-to-end
9. Deploy ComplianceKit to Vercel (production)
10. Deploy AccessKit to Vercel (production)
11. Run full E2E test suite on ComplianceKit

---

*Last updated: 13 April 2026*
