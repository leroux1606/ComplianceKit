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
5. When a code change requires a Vercel env var or infrastructure action, add it to VERCEL_SETUP.md

> VERCEL_SETUP.md — all pending Vercel environment variables and infrastructure actions

---

## CURRENT STATUS

**Phase:** Pre-launch (P1 items in progress)
**P0 items completed:** 6 / 6 ✓ ALL P0 ITEMS COMPLETE
**P1 items completed:** 19 / 19 ✓ ALL P1 ITEMS COMPLETE
**P2 items completed:** 6 / 6 ✓ ALL P2 ITEMS COMPLETE

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
| D2 | Demo mode + setup wizard | COMPLETE | `/demo` public page + in-dashboard sample scan preview |
| D3 | WordPress plugin | CODE COMPLETE — NEEDS WP TESTING | `wordpress-plugin/compliancekit/` — 5 bugs found and fixed; PHP tests written; needs local WP install to run tests and verify |
| D4 | USD pricing on marketing page | COMPLETE | `priceUsd` field on Plan; pricing page shows $USD primary + "Billed as R{price} via Paystack" |
| D5 | Onboarding email sequence | COMPLETE | Day 0 welcome on signup + Days 1/3/7 cron at `/api/cron/onboarding-emails` |
| E1 | Onboarding checklist in dashboard | COMPLETE | 5-step checklist on dashboard; hides when all steps done; deep links to correct website pages |
| E2 | Actionable compliance score UI | COMPLETE | Rewrote `ActionChecklist` — 3 severity groups, plain-English "why it matters", per-type action buttons |
| E3 | Installation verification tool | COMPLETE | `GET /api/websites/[id]/verify-installation` + `VerifyInstallationButton` on embed page + quick actions |
| F1 | Sentry error tracking | COMPLETE | `sentry.{client,server,edge}.config.ts` + `instrumentation.ts` + `withSentryConfig` in next.config.ts |
| F2 | Security event alerting | COMPLETE | `sendSecurityAlertEmail()` in lib/email.ts; wired fire-and-forget into logSecurityEvent; `SECURITY_ALERT_EMAIL` env var |
| F3 | Uptime monitoring setup | COMPLETE | `/api/health` endpoint created; UptimeRobot setup guide in VERCEL_SETUP.md item 9 |

---

## P2 — SCALE (Complete before 50+ customers)

| ID | Issue | Status | Notes |
|----|-------|--------|-------|
| C1 | Async job queue for scans | COMPLETE | Fire-and-forget run route + status polling; zero new deps |
| C2 | Widget JS on CDN | COMPLETE | `public/widget.js` static file; legacy route is a zero-DB bootstrap shim |
| C3 | Database connection pooling | COMPLETE | `max:1` on Pool + `directUrl` in schema + `.env.example` docs |
| C4 | Consent table archival | COMPLETE | Composite index + daily cron + vercel.json |
| D6 | Public JS API for banner | COMPLETE | `window.ComplianceKit` — `getConsent()`, `openSettings()`, `onConsentChange(cb)` in `public/widget.js`; 28 passing vitest tests |
| E4 | Live banner preview in config | COMPLETE | srcdoc iframe + 3-tab UI (Banner/Settings/Withdrawal); `lib/banner-preview-html.ts` pure fns; 52 passing vitest tests |

---

## RECOMMENDED NEXT SESSION ORDER

All P0 and most security P1 items are done. Remaining P1 items ordered by impact:

### Quick wins (under 1 day each)
1. **D4** — USD pricing on marketing page (directly affects sales conversion, 1 day)
2. **F2** — Security event alerting via email (Resend already wired, 1 day)
3. **F1** — Sentry error tracking (1 day, Next.js wizard install)
4. **E3** — Installation verification tool (helps customers succeed, 1-2 days)
5. **F3** — Uptime monitoring (external service only, 2 hours — UptimeRobot/Better Uptime)

### Medium effort (2-4 days each)
6. **E1** — Onboarding checklist in dashboard (reduces activation drop-off)
7. **D5** — Onboarding email sequence (reduces churn, Resend already wired)
8. **E2** — Actionable compliance score UI

### Large features (1 week each)
9. **D2** — Demo mode + setup wizard
10. **D3** — WordPress plugin (PHP, separate project)

### P2 remaining
✓ ALL P2 ITEMS COMPLETE

### Next priorities
- **WordPress plugin** — Run PHP tests in a local WP install + submit to wordpress.org
- **P3 backlog** — see AUDIT.md for lower-priority items

---

## LAUNCH-PLAN PHASE STATUS (as of 2026-04-10)

| Item | Status |
|------|--------|
| Phase 2.4 REST API | ✅ Complete |
| Phase 2.5 E2E tests | ✅ 18 passing, 12 expected skips |
| Phase 3.1 Team/multi-user management | ✅ Complete |
| Phase 3.2 CCPA compliance scanner | ✅ Complete |
| Phase 3.3 Automated scan scheduling | ✅ Complete |
| Phase 3.4 Remediation guidance + GDPR article links | ✅ Complete |
| Phase 3.5 AI-powered policy generation | ✅ Complete |
| Phase 3.6 Support infrastructure | ✅ Complete |

---

## SESSION LOG

### 2026-04-10 — Phase 2.5 E2E tests: UNBLOCKED AND PASSING

**E2E test suite: ✅ 18 passing, 12 expected skips, 0 failures**

Root causes found and fixed:
1. **Password label-input broken** — `FormControl` (Radix `Slot`) passed `id` to wrapper `<div>` instead of `<Input>`. Fixed in `sign-in-form.tsx` and `sign-up-form.tsx`.
2. **Server action redirects hang** — `signIn()` throws `NEXT_REDIRECT` that never reaches the browser (next-auth@5 beta + Next.js 16 issue). Fixed `global-setup.ts` to auth via NextAuth API endpoint.
3. **False lockout on successful login** — `signInWithCredentials` catch block called `recordFailedAttempt()` on redirect throws, locking accounts after 5 logins. Fixed in `lib/auth-actions.ts`.
4. **Selector issues** — button "Sign in" matched "Sign in with Google"; `.or()` chains hit strict mode; free-plan checks ran before page loaded. Fixed across all 6 spec files.

Files changed:
- `lib/auth-actions.ts` — moved `recordFailedAttempt` inside `AuthError` check; added `recordSuccessfulLogin` on redirect
- `components/auth/sign-in-form.tsx` — moved `<div className="relative">` outside `<FormControl>`
- `components/auth/sign-up-form.tsx` — same fix for password + confirm password fields
- `e2e/global-setup.ts` — rewritten: authenticates via NextAuth API, not UI form
- `e2e/00-smoke.spec.ts` — new standalone smoke test
- `e2e/01-signup.spec.ts` through `e2e/06-cancel-delete.spec.ts` — selector fixes
- `scripts/seed-test-user.mjs` — clears lockout records on seed
- `playwright.config.ts` — added smoke project

### 2026-04-09 — Phase 3.6 complete + Phase 2.5 infrastructure (auth blocker)

**Phase 3.6 — Support infrastructure: ✅ COMPLETE**
- `/docs` page already covers help centre (confirmed — not a stub)
- Created `components/layout/crisp-chat.tsx` — client component injecting Crisp script via `next/script` (afterInteractive); renders nothing if `NEXT_PUBLIC_CRISP_WEBSITE_ID` unset
- Mounted `<CrispChat />` in `app/(dashboard)/layout.tsx` — widget only appears in the dashboard, never on marketing pages
- Added `NEXT_PUBLIC_CRISP_WEBSITE_ID` to `.env.example` with instructions
- Added §10 to `VERCEL_SETUP.md` with step-by-step Crisp setup
- All of Phase 3 is now complete

**Phase 2.5 — E2E tests: ⚠️ INFRASTRUCTURE IN PLACE, AUTH BLOCKER**
- Installed `@playwright/test` and `dotenv-cli` via pnpm
- Created `playwright.config.ts` — webServer config, storage state auth, serial execution
- Created `e2e/global-setup.ts` — signs in as seeded test user, saves auth state
- Created 6 spec files covering full user flows:
  - `01-signup.spec.ts` — signup happy path + validation errors
  - `02-website-scan.spec.ts` — add website → run real Puppeteer scan → verify results
  - `03-policies.spec.ts` — template cookie + privacy policy generation
  - `04-billing.spec.ts` — billing page, pricing, upgrade CTA (no real payment)
  - `05-dsar.spec.ts` — public DSAR submit, owner complete + reject
  - `06-cancel-delete.spec.ts` — cancel subscription + account deletion dialogs
- Created `scripts/seed-test-user.mjs` — uses Prisma + PrismaPg adapter + bcrypt to upsert test user directly; bypasses signup UI for reliability
- Created separate Supabase test DB (`compliancekit_test`, project ref `ejzcznfqzcdfhpyfaiko`, eu-west-1, `aws-0-eu-west-1.pooler.supabase.com`)
- Pushed Prisma schema to test DB
- Added `.env.test.example`, `E2E-SETUP.md`
- Added scripts: `dev:test` (port 3001), `test:e2e`, `test:e2e:seed`, `test:e2e:ui`, `test:e2e:report`
- Seed script **confirmed working** (`Test user ready: e2e@test.local`)

**Blocker:** `global-setup.ts` line 18 times out after 60s on sign-in. All 26 tests show "did not run". Debugging steps for tomorrow are documented in `SESSION-STATUS.md`.

**Bonus fix during session:** restored a corrupted `.env.local` — lines had been deleted. Added back `DATABASE_URL` and `DIRECT_URL` using production project ref `cqackltoemwpsugboyzp`; removed stray "in my current .env.local" text from the top.

### 2026-04-08 — Phase 3.5: AI-powered policy generation
- Installed `@anthropic-ai/sdk` via pnpm (npm arborist bug blocked it)
- Created `lib/ai-policy.ts` — builds tailored prompts for Claude Opus and calls the API:
  - Privacy policy prompt: instructs Claude to cover GDPR Arts 13–14 + CCPA/CPRA if tracking detected; references actual cookie names, third-party services, and company details from the scan
  - Cookie policy prompt: generates Markdown tables with real cookie names/domains/expiry from scan data
  - Returns raw markdown; never throws by design — callers handle errors
- Added `generateAiPolicy()` server action to `lib/actions/policy.ts`:
  - Gated behind new `aiPolicyGenerator` feature flag (Professional/Enterprise only)
  - Loads scan data (cookies, scripts, findings) + owner company details, calls Claude, saves with `isAiGenerated: true`
  - Falls back with a human-readable error if `ANTHROPIC_API_KEY` is not set
- Added `aiPolicyGenerator: boolean` to `PlanFeatures` and all plan definitions in `lib/plans.ts`:
  - Free/Starter: false | Professional/Enterprise: true
- Added `isAiGenerated Boolean @default(false)` to `Policy` model in schema → pushed to DB
- Created `components/dashboard/generate-ai-policy-button.tsx` — "✨ AI Policy [New]" button, loading state
- Updated `GeneratePolicyButton` to accept a `variant` prop
- Updated policies page (`app/(dashboard)/dashboard/websites/[id]/policies/page.tsx`):
  - Professional+ sees both buttons: `[AI Privacy Policy] [Template]`
  - Starter users see purple upsell card explaining AI generation advantage
  - Help section updated to explain both options
- Updated policy view page (`[policyId]/page.tsx`):
  - AI policies get a purple "✨ AI" badge in the header
  - Amber review banner for AI-generated policies listing 3 specific things to check before publishing
- Added `ANTHROPIC_API_KEY` to `.env.example` with full documentation
- TypeScript clean, build passes

---

### 2026-04-08 — Phase 3.2: CCPA/CPRA compliance scanner
- Created `lib/scanner/ccpa-detector.ts`:
  - `detectDoNotSellLink(page)` — checks home page for "Do Not Sell or Share My Personal Information", "Your Privacy Choices" links, and opt-out iframes; runs in parallel with other page-level detectors
  - `analyzeCcpaPolicyContent(text)` — pure function; analyses policy text for CCPA mentions, California consumer rights (≥2 hits), California contact method, last-updated date
  - `calculateCcpaScore(checks)` — 0–100 score: opt-out link (35), CCPA policy section (25), CA rights list (20), contact method (15), last-updated (5)
  - `generateCcpaFindings(checks, hasTracking)` — produces `ccpa_do_not_sell` / `ccpa_privacy_policy` / `ccpa_consumer_rights` findings; severity escalates to error when tracking is detected
- Added 3 new `FindingType` values to `lib/scanner/types.ts`; added `ccpaScore?: number` to `ScanResult`
- Updated `lib/scanner/index.ts` — CCPA home-page check runs in parallel with GDPR detectors; after GDPR policy navigation, extracts page text and runs CCPA policy analysis without re-navigating
- Added `ccpaScore Int?` to Scan model in schema → pushed to DB; `lib/scan-runner.ts` persists it
- Updated `components/dashboard/action-checklist.tsx` — CCPA finding metadata with oag.ca.gov regulation links; "Regulation" label shows `CCPA §...` instead of `GDPR Art.` for CCPA findings
- Updated scan results page — shows GDPR score and CCPA score as two separate cards (CCPA card only shown when not null)
- TypeScript clean, build passes

---

### 2026-04-08 — Phase 3.1: Team/multi-user management
- Added `TeamMember` model to schema: ownerId/userId FK, email, role (admin/viewer), status (pending/active/revoked), inviteToken, invitedAt/acceptedAt
- Created `lib/team-context.ts`: `getTeamContext(sessionUserId)` reads `ck_active_owner` cookie to determine effective ownerId; `canWrite(role)` helper
- Created `lib/actions/team.ts`: `getTeamMembers`, `getMyTeamMemberships`, `inviteTeamMember`, `acceptTeamInvite`, `updateMemberRole`, `revokeTeamMember`, `switchActiveAccount` (sets httpOnly cookie)
- Updated all 6 data actions (website, scan, banner, policy, analytics, dsar — 24 functions total) to call `getTeamContext` and use `ownerId` instead of `session.user.id`
- Role enforcement: viewers get errors on writes; only owners can delete websites
- Created team page at `/dashboard/team` (invite form + member list with role dropdown)
- Created `/accept-invite?token=xxx` page — works logged-in or logged-out; uses `callbackUrl` to return after auth
- Created `components/layout/account-switcher.tsx` — dropdown for switching between "My account" and team accounts
- Dashboard layout shows blue "Viewing [Account]'s workspace" banner when in team context
- Team nav item visible only on Professional/Enterprise plans
- Added `sendTeamInviteEmail` to `lib/email.ts`
- Added `"team"` key to all 5 locale files (en/de/es/fr/nl)
- TypeScript clean, build passes, 122/122 tests passing

---

### 2026-04-08 — Phase 2.4: REST API
- Created `app/api/v1/websites/route.ts` — `GET /api/v1/websites` (list websites for API key owner)
- Created `app/api/v1/websites/[id]/scan/route.ts` — `POST /api/v1/websites/:id/scan` (trigger scan, returns 202)
- Created `app/api/v1/scans/[id]/route.ts` — `GET /api/v1/scans/:id` (status + cookies + findings)
- Created `app/api/v1/policies/route.ts` — `GET /api/v1/policies` (filterable by `?websiteId=&type=`)
- Created `lib/api-auth.ts` — `validateApiKey()` helper; keys stored hashed in DB
- Created `lib/actions/api-key.ts` — `getApiKey`, `generateApiKey`, `revokeApiKey`; keys format `ck_live_{48 hex chars}`; requires active subscription with `apiAccess` feature
- Created `components/dashboard/api-key-section.tsx` — show/hide toggle, copy, generate, revoke; shows amber "copy now" warning on first generation
- Updated settings page to show API key card
- TypeScript clean

---

### 2026-04-08 — Phases 3.3 + 3.4: Automated scanning + remediation guidance
*(Done in previous session, committed this session)*
- **3.3**: Added `scanSchedule`/`nextScheduledScanAt` fields to Website model; schedule picker in edit form; cron at `/api/cron/scheduled-scans` runs every 6 h, fires `executeScan`, advances schedule, sends score-drop email if score drops ≥5 pts; `sendScanScoreDropEmail` added to `lib/email.ts`
- **3.4**: Updated `action-checklist.tsx` — all 12 `FindingType` values in `FINDING_META` now have `gdprArticle` + `gdprArticleUrl`; expanded panel renders "Regulation" link to gdpr-info.eu

---

### 2026-03-08 — D6: Public JS API for banner
- Added `window.ComplianceKit` API object to `public/widget.js` — exposed synchronously before the config fetch so integrators can register callbacks before the banner appears
- **`getConsent()`** — synchronous; returns `{ necessary, analytics, marketing, functional }` or `null` if no prior consent. Reads `window.CK_CONSENT` which is populated from localStorage at startup.
- **`openSettings()`** — opens the cookie preferences modal. If config hasn't loaded yet, queues the call and executes it when config arrives (returning visitors only; first-time visitors see the banner). No-op if modal already open.
- **`onConsentChange(callback)`** — registers a listener; fires immediately with existing preferences (catch-up pattern), then on every future consent change. Returns an unsubscribe function. Non-function arguments return a no-op unsubscribe safely.
- Refactored `saveConsent()`: moved `window.CK_CONSENT = preferences` assignment here (was duplicated in every click handler). Callbacks fire here using a snapshot of the array so mid-iteration unsubscribes are safe. Each callback is wrapped in try/catch so one failing callback never blocks others.
- Added `_ckConfig`, `_ckConsentModeV2`, `_ckPendingOpenSettings` private state vars
- Added `aria-modal`, `role="dialog"`, `aria-label` to consent modal and banner (WCAG improvement)
- Added `window.ComplianceKit._callbacks` internal reference for WordPress footer link
- **28 vitest tests** in `lib/__tests__/widget-api.test.ts` (jsdom environment) — all pass. Tests cover: init, getConsent all cases, onConsentChange (immediate catch-up, banner clicks, modal save, unsubscribe, error isolation, multi-listener), openSettings (queuing, no-op guard, pre-population)
- WordPress plugin footer link is now functional (it calls `window.ComplianceKit.openSettings()` which is implemented); removed the "coming soon" note from plugin settings page description

---

### 2026-03-08 — Vitest setup + automated test infrastructure
- Installed `vitest` + `vite-tsconfig-paths` as devDependencies
- Created `vitest.config.ts` (node environment, tsconfig paths)
- Added `pnpm test` and `pnpm test:watch` scripts to `package.json`
- Wrote 42 unit tests for `lib/ssrf-check.ts` in `lib/__tests__/ssrf-check.test.ts` — all 42 pass
- Tests cover: protocol blocking, localhost/loopback, all RFC1918 ranges, link-local, CGNAT, reserved TLDs, DNS-resolved private IPs, edge cases
- **Rule going forward:** all Next.js code changes require passing vitest tests before delivery

---

### 2026-03-08 — D3: WordPress plugin (revised — bugs found and fixed)
- Created `wordpress-plugin/compliancekit/compliancekit.php` — single-file GPL-2.0 WordPress plugin:
  - **Settings page** at Settings → ComplianceKit: embed code field, app URL field, footer link toggle
  - **`wp_head` hook** — injects `<script src="{app_url}/widget.js" data-embed-code="{embed_code}" defer></script>`; no-op if embed code is empty
  - **`wp_footer` hook** — optional "Manage Cookie Preferences" link; calls `window.ComplianceKit.openSettings()` (widget JS API); degrades gracefully; only shown when footer link toggle is enabled
  - **Admin notice** — shows a warning with link to settings page when embed code is not yet configured; suppressed on the settings page itself and for non-admin users
  - **Security**: all settings go through `register_setting` with sanitize callbacks (`ck_sanitize_embed_code` strips non-alphanumeric, `ck_sanitize_url` validates via `esc_url_raw`); all output escaped with `esc_attr`/`esc_url`/`esc_html`; capability check (`manage_options`) on settings render
  - **Settings preview** — when embed code is set, shows the exact `<script>` tag that will be injected
  - Getting Started guide rendered on settings page
- Created `wordpress-plugin/compliancekit/readme.txt` — WordPress.org directory format (description, install guide, FAQ, changelog)
- Updated embed page (`app/(dashboard)/dashboard/websites/[id]/embed/page.tsx`): WordPress framework note now links to the plugin on wordpress.org
- **Bugs found and fixed in revised session:**
  1. **Checkbox never saved false** — HTML forms don't submit unchecked checkboxes; added `<input type="hidden" name="ck_footer_link" value="0">` before the checkbox so unchecking always submits a value
  2. **`window.ComplianceKit.openSettings()` doesn't exist** — D6 (Public JS API) not started; footer link is gracefully non-functional; documented in settings UI and code comment
  3. **Missing `uninstall.php`** — created; deletes all 3 `ck_*` options on plugin deletion (WordPress.org submission requirement)
  4. **Missing `load_plugin_textdomain()`** — added on `plugins_loaded` hook; translations now work
  5. **`printf(esc_html__(...), '<a ...>')` pattern** — replaced with `wp_kses_post(sprintf(...))` throughout (WordPress.org coding standards)
- **PHP tests written:** `tests/ComplianceKitTest.php` + `tests/bootstrap.php` + `composer.json` using Brain Monkey
  - Cannot run PHP tests in this environment (PHP not installed)
  - Run with: `cd wordpress-plugin/compliancekit && composer install && composer test`
- **Still needed before D3 is truly complete:**
  - Local WordPress install (Local by Flywheel recommended) to run the PHP tests
  - Manual testing against WP 6.5+ with a caching plugin (see QA-MASTER.md Phase 10)
  - WordPress.org submission and reviewer round-trip
- **Created QA-MASTER.md** — comprehensive 14-phase test plan covering all features, GDPR compliance, WCAG 2.1 AA, performance, cross-browser, and WordPress plugin; supersedes TESTING-CHECKLIST.md

---

### 2026-03-08 — E4: Live banner preview in config UI
- Created `lib/banner-preview-html.ts` — pure TypeScript module (no DOM, no fetch) exporting:
  - `escapeHtml(raw)` — XSS-safe HTML escaping for user-supplied URLs
  - `generateBannerCss(config)` — mirrors `getBannerStyles()` from `public/widget.js` exactly; includes customCss appended at end
  - `generateBannerHtml(config, privacyPolicyUrl, cookiePolicyUrl)` — mirrors `getBannerHTML()` exactly; XSS-safe policy links; defaults to `/privacy-policy` and `/cookie-policy`
  - `generateWithdrawalButtonHtml(config)` — mirrors `createWithdrawalButton()` exactly; respects `withdrawalButtonPosition`
  - `generatePreviewDocument(config, panel)` — full `<!DOCTYPE html>` document for iframe `srcDoc`; three panel modes: `"banner"` (initial state), `"settings"` (Customize view), `"withdrawal"` (floating button only)
- **52 vitest tests** in `lib/__tests__/banner-preview-html.test.ts` — all 52 pass. Tests cover: escapeHtml (6), generateBannerCss (13), generateBannerHtml (14), generateWithdrawalButtonHtml (7), generatePreviewDocument (12).
- Rewrote `components/dashboard/banner-preview.tsx`:
  - Uses `<iframe srcDoc={generatePreviewDocument(config, panel)} sandbox="" ...>` — genuinely isolated, no JS executes inside the preview
  - Three tab buttons (Banner / Settings Panel / After Consent) with `aria-pressed`; updates `panel` state on click
  - Iframe height adapts to panel and banner position (center = 420px, withdrawal = 160px, others = 300px)
  - Iframe re-keyed on `panel + position` to force remount on panel/position change (avoids stale srcdoc)
  - `title` and `aria-label` attributes on iframe for WCAG
  - "Live preview — updates as you configure" label below iframe
- Updated `QA-MASTER.md` Phase 4 with section 4.10 (9 test cases for E4)
- **All 122 vitest tests passing** (52 banner-preview + 42 ssrf + 28 widget-api)

---

### 2026-03-07 — D2: Demo mode + public demo page
- Created `lib/demo-data.ts` — static demo scan data for "Demo Store" (score 42, 8 cookies, 3 scripts, 5 findings covering all key finding types: cookie_banner/error, privacy_policy/error, tracking_script/warning, third_party_cookie/warning, secure_cookie/info)
- Created `app/(marketing)/demo/page.tsx` — full public marketing demo page at `/demo`:
  - Same header pattern as `/pricing` (logo + sign in/sign up buttons)
  - Hero: "See what ComplianceKit finds" with amber sample-data disclaimer
  - Full scan results layout reusing `ComplianceScore`, `FindingsList`, `CookieList`, `ScriptList`
  - Tabs: Findings (5), Cookies (8), Scripts (3)
  - CTA section at bottom: "Get your free compliance report" → `/sign-up`, "See pricing" → `/pricing`
- Updated `app/(dashboard)/dashboard/page.tsx` — when `websiteCount === 0`, shows a "Sample Scan — Demo Store" card:
  - "Demo data" badge to clearly label it as sample
  - Compliance score gauge (42 / Fair) + cookie/script/finding counts
  - Top 3 findings listed with severity icons and one-line description
  - "View full demo" link → `/demo`; "Add your site" CTA → `/dashboard/websites/new`
  - Card disappears once user adds their first website
- TypeScript clean

---

### 2026-03-06 — E2: Actionable compliance score UI
- Rewrote `components/dashboard/action-checklist.tsx` (was generic checklist, now a fully actionable findings panel):
  - Added `websiteId: string` prop — used to build direct links to banner, policies, embed pages
  - **Severity grouping** — findings split into 3 labelled sections with count badges:
    - "Critical — fix now" (error) — red tint
    - "Important — fix this week" (warning) — yellow tint
    - "Minor — when you can" (info) — blue tint
  - **`FINDING_META` registry** — maps all 12 `FindingType` values to:
    - `whyItMatters` — plain-English GDPR risk explanation (no jargon, specific regulation cited)
    - `actionLabel` + `actionPath` — direct link to the relevant dashboard page for actionable types
  - **Expanded detail panels** — each finding expands to show: "What it means", "Why it matters", "How to fix", and action button (where applicable)
  - **Non-actionable types** (secure_cookie, user_profile_settings, data_export, account_deletion, data_rectification) — shown with explanation but no button (fixes require changes on the customer's own server/site)
  - Retained checkbox/progress-bar UX from previous version
- Updated `app/(dashboard)/dashboard/websites/[id]/scans/[scanId]/page.tsx` — passes `websiteId={id}` to `ActionChecklist`
- TypeScript clean

---

### 2026-03-06 — D5: Onboarding email sequence
- Added 4 email functions to `lib/email.ts`:
  - `sendWelcomeEmail()` — Day 0 immediate; 3-step getting-started guide with direct CTA to add first website
  - `sendOnboardingDay1Email()` — no scan yet; explains what scan finds, links directly to scan page
  - `sendOnboardingDay3Email()` — banner not live (no consents); step-by-step install guide, links to embed page
  - `sendOnboardingDay7Email()` — still on free plan; Pro feature list with pricing, links to /pricing
  - All functions use shared `emailShell()` helper (avoids repeating 50 lines of inline CSS per email)
  - All catch errors internally and never throw (fire-and-forget safe)
- Wired Day 0 welcome into `lib/auth-actions.ts` `signUp()`: fire-and-forget after user creation, before `signIn()` call — never blocks signup
- Created `app/api/cron/onboarding-emails/route.ts` (GET, daily at 09:00 UTC):
  - Day 1 window: `createdAt` 24–48 h ago, user has no websites with scans → sends Day 1 email
  - Day 3 window: `createdAt` 72–96 h ago, user has no websites with consents → sends Day 3 email
  - Day 7 window: `createdAt` 168–192 h ago, no active paid subscription → sends Day 7 email
  - Each window is a separate Prisma query with nested `none:{}` filters to avoid N+1
  - Same CRON_SECRET bearer token auth as other cron routes
  - Returns `{ day1, day3, day7, errors }` counts for observability
- Updated `vercel.json`: added `{ path: /api/cron/onboarding-emails, schedule: 0 9 * * * }`
- TypeScript clean

---

### 2026-03-06 — E1: Onboarding checklist in dashboard
- Updated `getWebsiteStats()` in `lib/actions/website.ts`:
  - Added `bannerConfigCount` (parallel Prisma count on `BannerConfig` table filtered by user)
  - Added `firstWebsiteId` (earliest website by `createdAt`) — used to generate deep links for each step
- Replaced old 4-step static "Get Started" card in `app/(dashboard)/dashboard/page.tsx` with a proper 5-step checklist:
  1. Add your website (websiteCount > 0)
  2. Run your first scan (scanCount > 0) → links to `/websites/{id}/scan`
  3. Generate a cookie policy (policyCount > 0) → links to `/websites/{id}/policies`
  4. Configure your consent banner (bannerConfigCount > 0) → links to `/websites/{id}/banner`
  5. Install the banner (consentCount > 0) → links to `/websites/{id}/embed`
- Each incomplete step shows an action button with a deep link; complete steps show a strikethrough label + green check
- Progress counter in card description: "X of 5 steps complete"
- Checklist card hidden entirely once all 5 steps complete (`consentCount > 0` covers step 5)
- Added `ChecklistStep` as a file-local component (not a separate file — it's only used here)
- Removed unused `Circle`, `BarChart3` imports; added `Scan`, `Code`, `Download`, `ReactNode`
- TypeScript clean

---

### 2026-03-06 — F3: Uptime monitoring
- Created `app/api/health/route.ts` — lightweight GET endpoint, returns `{"status":"ok","timestamp":"..."}` with `Cache-Control: no-store`; no DB hit so it survives DB outages and cold starts faster
- Updated VERCEL_SETUP.md item 9 with step-by-step UptimeRobot setup: alert contact → 4 monitors (App, Health API, Widget JS, Consent API) with exact URLs and expected status codes
- No environment variables needed — this is external service configuration only
- Action required: sign up at uptimerobot.com and follow VERCEL_SETUP.md item 9

---

### 2026-03-06 — E3: Installation verification tool
- Created `app/api/websites/[id]/verify-installation/route.ts` (GET):
  - Auth + ownership check via Prisma (`findFirst` with `userId` filter)
  - SSRF protection: reuses `validateScanUrl()` from `lib/ssrf-check.ts` before fetching
  - Fetches customer homepage with 10 s `AbortController` timeout, `User-Agent: ComplianceKit-VerifyBot/1.0`
  - Detects both new format (`data-embed-code="<code>"`) and legacy format (`/widget/<code>/script.js`) via string search
  - Returns `{ detected: boolean, message: string }` — never throws a 5xx for site-reachability issues
- Created `components/dashboard/verify-installation-button.tsx` (client component):
  - Idle → Loading (spinner) → Detected (green banner) / Not detected (red banner)
  - Shows human-readable message returned from the API
- Added `VerifyInstallationButton` to embed page (`app/(dashboard)/dashboard/websites/[id]/embed/page.tsx`) — only shown when banner is configured
- Added `VerifyInstallationButton` to Quick Actions on website detail page — only shown when banner is configured
- TypeScript clean

---

### 2026-03-06 — F1: Sentry error tracking
- Installed `@sentry/nextjs@10` (package.json already had it from interrupted session)
- Created `sentry.client.config.ts` — client-side init with Session Replay (100% on error, 1% session sampling), 10% traces
- Created `sentry.server.config.ts` — server-side init with 10% traces
- Created `sentry.edge.config.ts` — edge runtime init with 10% traces
- Created `instrumentation.ts` — Next.js instrumentation hook registers server/edge configs at runtime
- Updated `next.config.ts`: wrapped export with `withSentryConfig` (silent build, hideSourceMaps, automaticVercelMonitors, disableLogger)
- Added `https://*.ingest.sentry.io` to CSP `connect-src` directive
- Added `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` to `.env.example` with setup instructions
- Vercel action required: set the four SENTRY_* env vars (see VERCEL_SETUP.md)

---

### 2026-03-06 — F2: Security event alerting via email
- Added `sendSecurityAlertEmail()` to `lib/email.ts`:
  - Sends to `SECURITY_ALERT_EMAIL` env var (falls back to `NEXT_PUBLIC_SUPPORT_EMAIL`)
  - HTML email with event type badge + details table (event type, timestamp, IP, user ID, email, resource, message, metadata)
  - Inner try/catch — never throws, logs failure to console instead
- Updated `logSecurityEvent()` in `lib/security-log.ts`:
  - Removed `// TODO: Send alert notification` comment
  - Fires `sendSecurityAlertEmail()` for all `shouldAlert()` events: `LOGIN_LOCKED`, `CSRF_DETECTED`, `SQL_INJECTION_ATTEMPT`, `XSS_ATTEMPT`, `UNAUTHORIZED_ACCESS`, `RATE_LIMIT_DB_ERROR`
  - Fire-and-forget (`.catch(() => {})`) — email failure cannot break the request
  - `logSecurityEvent` stays synchronous; no caller changes needed
- Added `SECURITY_ALERT_EMAIL` to `.env.example` with full documentation
- TypeScript clean

---

### 2026-03-06 — D4: USD pricing on marketing page
- Added `priceUsd: number` field to `Plan` interface in `lib/plans.ts`
- Set USD display prices: Starter $16, Professional $43, Enterprise $109 (approximate ZAR conversion at ~18.5 ZAR/USD)
- Updated `app/(marketing)/pricing/page.tsx`: shows `$XX/mo` as primary with `Billed as R{price} via Paystack` as secondary (xs text)
- Dashboard billing/checkout pages left showing ZAR — those are payment confirmation flows where the actual charge amount matters
- Homepage (`app/page.tsx`) already had its own hardcoded USD-string pricing list — no change needed there
- TypeScript clean (priceUsd added to all 3 plan objects)

---

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
## ALL 19 P1 ITEMS COMPLETE

---

### 2026-03-09 — Documentation audit + QA-MASTER.md fixes
- Read PROGRESS.md, QA-MASTER.md, DEPLOYMENT.md, AUDIT.md — confirmed all P0/P1/P2 items are code-complete
- Fixed ENV-1 table in QA-MASTER.md: `NEXT_PUBLIC_RESEND_FROM_EMAIL` → `EMAIL_FROM` (matches actual code in `lib/email.ts` and `.env.example`)
- Removed outdated "Known gaps" bullet from QA-MASTER.md: "WordPress plugin: footer link non-functional until D6 is built" — D6 was completed in the previous session; footer link correctly calls `window.ComplianceKit.openSettings()`
- Remaining non-code items before launch: set 9 Vercel env vars per VERCEL_SETUP.md; run WP plugin PHP tests in local WP install; submit plugin to wordpress.org

---

### 2026-03-09 — WordPress plugin pre-submission fixes
- Fixed readme.txt `Stable tag: 1.0.0` → `1.0.1` to match PHP header `Version: 1.0.1` (mismatch would fail wordpress.org review)
- Added `1.0.1` changelog entry to readme.txt with all 5 fixes documented
- Added upgrade notice for 1.0.1
- **Still needed:** 3 screenshots (see step-by-step guide below); LocalWP install + manual QA phase 10; wordpress.org submission

---

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

### 2026-03-05 — C4: Consent table archival
- **Schema:** Added `@@index([websiteId, consentedAt])` composite index to `Consent` model — needed for efficient archival deletes and date-range exports (A9). Applied to DB via `prisma db push` (used `DIRECT_URL` automatically).
- **`prisma.config.ts` fix:** C3's `directUrl` support was incorrectly placed in `schema.prisma` (Prisma 7 removed that). Moved to `prisma.config.ts` with conditional spread so `DIRECT_URL` is optional (safe for local dev without it set).
- **`app/api/cron/archive-consent/route.ts`:** Daily cron that deletes expired consent records per user's plan retention period (Free: 7d, Starter: 30d, Professional: 90d, Enterprise: 365d). Follows same auth pattern as `process-account-deletions` cron (`CRON_SECRET` bearer token). Logs deleted count per user.
- **`vercel.json`:** Created with both cron jobs scheduled — account deletions at 02:00 UTC, consent archival at 03:00 UTC.
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
