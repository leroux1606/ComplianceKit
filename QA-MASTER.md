# ComplianceKit — QA Master Test Plan

> **Version:** 1.0 | **Date:** 2026-03-08
> **Supersedes:** TESTING-CHECKLIST.md (kept for reference, this document is authoritative)
>
> **How to use:** Work through each phase in order. Mark ✅ PASS or ❌ FAIL.
> For every FAIL: note the URL, error message, screenshot filename, and browser.
> Update this document as new features are added.

---

## AUTOMATED TESTS (run before every deploy)

```bash
# Next.js unit tests — must all pass before any code ships
pnpm test

# WordPress plugin PHP tests (requires PHP + Composer in WP environment)
cd wordpress-plugin/compliancekit
composer install
composer test
```

**Status:** ☐ All automated tests pass

---

## PRE-FLIGHT CHECKLIST

### ENV-1: Environment Variables

Verify `.env.local` contains all required variables:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | ✅ | Prisma runtime (pooled endpoint if using Neon/Supabase) |
| `DIRECT_URL` | ✅ | Prisma migrations (direct connection, bypasses PgBouncer) |
| `NEXTAUTH_SECRET` | ✅ | Session signing |
| `NEXT_PUBLIC_APP_URL` | ✅ | Widget embed URL, email links |
| `RESEND_API_KEY` | ✅ | All transactional email |
| `EMAIL_FROM` | ✅ | From address (e.g. `ComplianceKit <noreply@yourdomain.com>`) |
| `PAYSTACK_SECRET_KEY` | ✅ | Payments |
| `PAYSTACK_WEBHOOK_SECRET` | ✅ | Webhook signature verification |
| `CRON_SECRET` | ✅ | Cron route authentication |
| `NEXT_PUBLIC_SENTRY_DSN` | ✅ | Error tracking |
| `SENTRY_AUTH_TOKEN` | ✅ | Source map upload |
| `SECURITY_ALERT_EMAIL` | ✅ | Security event notifications |

**Status:** ☐ PASS / ☐ FAIL

---

### ENV-2: Build Passes

```bash
pnpm build
```

**Expected:** No TypeScript errors, no ESLint errors, build completes.

**Status:** ☐ PASS / ☐ FAIL — **Errors:** _______________________________

---

### ENV-3: Database Migrations Applied

```bash
pnpm db:generate
pnpm db:push
```

**Expected:** Schema in sync, Prisma client regenerated.

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 1 — AUTHENTICATION & SIGNUP

### 1.1: Sign Up with DPA + ToS

**Steps:**
1. Go to `/sign-up`
2. Fill in Name, Email, Password
3. Verify you see **two** checkboxes: "I agree to the Terms of Service and Privacy Policy" + "I agree to the Data Processing Agreement"
4. Try submitting with only one checked — expect error
5. Check both and submit

**Expected:**
- Both checkboxes required (form rejects with one unchecked)
- Account created on both checked
- Redirected to `/dashboard`

**GDPR:** Article 28 requires DPA acceptance before processing data on behalf of customers.

**Status:** ☐ PASS / ☐ FAIL

---

### 1.2: Welcome Email Received

**Steps:**
1. Complete 1.1 with a real email address
2. Check inbox within 2 minutes

**Expected:**
- Email received from configured `NEXT_PUBLIC_RESEND_FROM_EMAIL`
- Subject: welcome / getting started
- Contains link to add first website
- Contains 3-step guide

**GDPR:** No personal data in email beyond name/email; no tracking pixels.

**Status:** ☐ PASS / ☐ FAIL — **Email received:** ☐ YES / ☐ NO

---

### 1.3: Sign In / Sign Out / Password Reset

| Step | Expected | Status |
|------|----------|--------|
| Sign in with correct credentials | Redirected to `/dashboard` | ☐ P / ☐ F |
| Sign in with wrong password | "Invalid credentials" error | ☐ P / ☐ F |
| 5 wrong passwords in a row | Account locked, lockout message shown | ☐ P / ☐ F |
| Security alert email received on lockout | Email to `SECURITY_ALERT_EMAIL` | ☐ P / ☐ F |
| Sign out | Redirected to homepage, session cleared | ☐ P / ☐ F |
| Password reset flow | Reset email received, link works | ☐ P / ☐ F |

---

### 1.4: Rate Limiting — Auth Endpoints

**Steps:**
1. Submit 6+ sign-in attempts rapidly
2. On the 6th attempt, expect rate limit response

**Expected:** HTTP 429 with `Retry-After` header.

**Security:** Confirms B3 (rate limiting) is active.

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 2 — ONBOARDING FLOW

### 2.1: Empty Dashboard Shows Demo Scan

**Steps:**
1. Log in with a brand-new account (no websites added)
2. View dashboard

**Expected:**
- "Sample Scan — Demo Store" card visible with "Demo data" badge
- Compliance score ≈ 42, labelled "Fair"
- 5 findings visible (at least)
- "View full demo" link → `/demo`
- "Add your site" CTA visible
- Onboarding checklist visible (5 steps, 0 complete)

**Status:** ☐ PASS / ☐ FAIL

---

### 2.2: Public Demo Page (`/demo`)

**Steps:**
1. Go to `/demo` (no login required)
2. Check content

**Expected:**
- Accessible without authentication
- Sample scan results for "Demo Store"
- Compliance score, findings, cookies, scripts all visible
- Amber disclaimer: "This is sample data"
- CTA buttons at bottom → `/sign-up` and `/pricing`

**WCAG 2.1:** All content accessible by keyboard; color contrast ≥ 4.5:1.

**Status:** ☐ PASS / ☐ FAIL

---

### 2.3: Onboarding Checklist Advances

**Steps:**
1. Verify all 5 steps show incomplete on fresh account
2. Add a website → step 1 checks off
3. Run a scan → step 2 checks off
4. Generate a policy → step 3 checks off
5. Configure a banner → step 4 checks off
6. Note: step 5 (Install banner) checks off only when first consent is recorded

**Expected:** Each step shows deep link button when incomplete; green check when done. Card disappears when all 5 complete.

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 3 — WEBSITE SCANNING & SSRF PROTECTION

### 3.1: Add Website with SSRF-Blocked URL

**Steps:**
1. Go to add website form
2. Try each of these URLs:
   - `http://localhost:5432`
   - `http://169.254.169.254/latest/meta-data/`
   - `http://192.168.1.1`
   - `http://10.0.0.1`
   - `file:///etc/passwd`

**Expected:** Each URL rejected with a clear error message. Website not created.

**Security:** Confirms B1 (SSRF protection) is active on website create action.

**Status:** ☐ PASS / ☐ FAIL

---

### 3.2: Scan a Real Website

**Steps:**
1. Add a real public website (e.g., `https://example.com`)
2. Click "Scan"
3. Verify scan status: `Queued` → `Running` → `Completed` (polling every ~3s)

**Expected:**
- No browser hang — scan is async
- Status updates visible without page refresh
- Completes within 120s
- Navigates to scan results on completion

**Architecture:** Confirms C1 (async scan queue) is working.

**Status:** ☐ PASS / ☐ FAIL — **Duration:** ________s

---

### 3.3: Scan Results

**Expected on results page:**
- Compliance score 0–100 with label (Excellent/Good/Fair/Poor)
- **Disclaimer visible:** "This score reflects technical compliance indicators only and does not constitute legal advice"
- Findings tab: grouped by severity (Critical / Important / Minor)
- Each finding: plain-English description + "Why it matters" + action button where applicable
- Cookies tab: name, domain, category
- Scripts tab: URL, type
- GDPR: findings linked to specific GDPR articles

**Status:** ☐ PASS / ☐ FAIL

---

### 3.4: Actionable Findings (E2)

**Steps:**
1. On scan results, expand a finding with an action button
2. Click the action button (e.g., "Generate Cookie Policy")

**Expected:**
- Navigates to the correct dashboard page for that action
- Finding groups: Critical (red) / Important (yellow) / Minor (blue)
- "Why it matters" explanation uses plain English, not legal jargon

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 4 — COOKIE BANNER & CONSENT

### 4.1: Banner Configuration

**Steps:**
1. Go to Website → Banner
2. Configure: theme, position, colors, button style, withdrawal button position
3. Toggle "Google Consent Mode v2" on and off
4. Save

**Expected:** Settings saved, no error. Consent Mode v2 toggle persists.

**Status:** ☐ PASS / ☐ FAIL

---

### 4.2: Widget Script Injected Correctly

**Steps:**
1. Go to Website → Embed Code
2. Copy the embed code snippet

**Expected format:**
```html
<script src="https://compliancekit.com/widget.js" data-embed-code="YOURCODE" defer></script>
```
- Static file URL (`/widget.js`), NOT `/api/widget/.../script.js`
- `data-embed-code` attribute present
- `defer` present

**Architecture:** Confirms C2 (static widget JS) is working.

**Status:** ☐ PASS / ☐ FAIL

---

### 4.3: Widget Behaviour on Test Page

**Steps:**
1. Create `test-banner.html` with your embed snippet in `<head>`
2. Open in browser (incognito)

**Expected sequence:**

| Action | Expected |
|--------|----------|
| Page load (no prior consent) | Banner appears |
| "Accept All" clicked | Banner hides, withdrawal button appears |
| Open DevTools → Application → localStorage | `CK_CONSENT` key present with `consentMethod: "accept_all"` |
| Reload page | Banner does NOT reappear; withdrawal button appears immediately |
| Click withdrawal button | Settings modal opens |
| Change preferences, save | Modal closes, new consent recorded |
| "Reject All" from fresh incognito | `consentMethod: "reject_all"` in localStorage |

**Status:** ☐ PASS / ☐ FAIL

---

### 4.4: Google Consent Mode v2 (D1)

**Steps:**
1. Ensure "Google Consent Mode v2" toggle is ON in banner config
2. Load the test page from 4.3
3. Open DevTools Console before accepting

**Expected:**
- `dataLayer` array exists before consent decision
- `gtag('consent', 'default', {...})` logged — all signals `denied`
- After "Accept All": `gtag('consent', 'update', {...})` with `ad_storage: 'granted'`, `analytics_storage: 'granted'`
- After "Reject All": update call with all signals `denied`

**Status:** ☐ PASS / ☐ FAIL

---

### 4.5: Consent Record Fields (A3)

**Steps:**
1. Submit consent on test page (Accept All)
2. Export consent CSV from dashboard (Website → Quick Actions → Export Consents)

**Expected CSV columns:**
- `visitor_id` — present, pseudonymous
- `consented_at` — timestamp
- `consent_method` — `accept_all`, `reject_all`, or `custom`
- `banner_version` — ISO timestamp of banner config at time of consent (NOT empty)
- `policy_version` — integer version of active policy (or null if no policy generated)
- `necessary`, `analytics`, `marketing`, `functional` — booleans

**GDPR:** Article 7 + Recital 42 require proof of what the visitor saw when consenting.

**Status:** ☐ PASS / ☐ FAIL

---

### 4.6: Consent Withdrawal Mechanism (A4)

**Steps:**
1. Accept consent on test page
2. Verify withdrawal (floating "Manage Cookie Preferences") button appears
3. Click it — settings modal opens with existing preferences pre-populated
4. Change analytics from on to off, save
5. Check localStorage — `CK_CONSENT` updated with new preferences
6. Export consent CSV — two records for same visitor: original + updated

**GDPR:** Article 7(3) — withdrawal must be as easy as giving consent.

**Status:** ☐ PASS / ☐ FAIL

---

### 4.7: Consent CSV Export (A9)

**Steps:**
1. Website Quick Actions → "Export Consents"
2. File downloads as CSV

**Expected:**
- Filename: `consent-log-[sitename]-[date].csv`
- All fields from 4.5 present
- Test `?from=` / `?to=` date filter query params via direct URL

**Status:** ☐ PASS / ☐ FAIL

---

### 4.8: Public JS API — window.ComplianceKit (D6)

Open DevTools Console on any page with the widget installed.

**`getConsent()`**

| Scenario | Command | Expected |
|----------|---------|----------|
| No prior consent | `window.ComplianceKit.getConsent()` | `null` |
| After Accept All | `window.ComplianceKit.getConsent()` | `{ necessary: true, analytics: true, marketing: true, functional: true }` |
| After Reject All | `window.ComplianceKit.getConsent()` | `{ necessary: true, analytics: false, marketing: false, functional: false }` |

**`openSettings()`**

| Scenario | Action | Expected |
|----------|--------|----------|
| Returning visitor | `window.ComplianceKit.openSettings()` | Cookie preferences modal opens |
| Modal already open | Call again | Only one modal — no duplicate |
| First-time visitor | `window.ComplianceKit.openSettings()` | No modal (banner handles first choice) |

**`onConsentChange(callback)`**

```javascript
// Register a listener
var unsub = window.ComplianceKit.onConsentChange(function(prefs) {
  console.log('Consent changed:', prefs);
});

// If consent already exists: callback fires immediately in console
// Accept All → callback fires with all:true
// Reject All → callback fires with analytics/marketing/functional: false

// Unsubscribe
unsub();
// Accept All again → callback does NOT fire
```

**Status:** ☐ PASS / ☐ FAIL

---

### 4.9: Installation Verification (E3)

**Steps:**
1. Install embed code on a live website
2. Dashboard → Website → Quick Actions → "Verify Installation"

**Expected:** "Installed correctly ✓" within 10 seconds.

**Steps (negative):**
1. Remove embed code from the site
2. Click "Verify Installation" again

**Expected:** "Not detected — check your installation"

**Status:** ☐ PASS / ☐ FAIL

---

### 4.10: Live Banner Preview (E4)

**Pre-condition:** Dashboard → Website → Cookie Banner configuration page.

**Steps — Tab switching:**
1. Observe the preview panel on the right side of the banner config form
2. Three tabs should be visible: **Banner**, **Settings Panel**, **After Consent**
3. Click each tab in turn

**Expected:**
- **Banner** tab: shows the cookie consent banner in its initial state (Accept All / Reject All / Customize buttons visible)
- **Settings Panel** tab: shows the Customize view with Necessary, Analytics, Marketing, Functional toggles visible
- **After Consent** tab: shows only the floating "Cookie Preferences" button — no banner

**Status:** ☐ PASS / ☐ FAIL

---

**Steps — Live config reflection:**
1. Change **Primary Color** to `#e11d48`
2. Observe preview updates without saving

**Expected:** Banner buttons and withdrawal button reflect the new colour immediately.

**Status:** ☐ PASS / ☐ FAIL

---

**Steps — Theme:**
1. Switch **Theme** to Dark
2. Observe preview

**Expected:** Banner background changes to `#1f2937`; text to `#f9fafb`.

**Status:** ☐ PASS / ☐ FAIL

---

**Steps — Position:**
1. Switch **Position** to Center
2. Observe Banner tab

**Expected:** Banner floats centred in the preview iframe, not pinned to an edge.

**Status:** ☐ PASS / ☐ FAIL

---

**Steps — Button style:**
1. Switch **Button Style** to Pill
2. Observe banner buttons in preview

**Expected:** Buttons have fully rounded (pill) corners.

**Status:** ☐ PASS / ☐ FAIL

---

**Steps — Custom CSS:**
1. Enter `.ck-accept-all { background: orange !important; }` in the Custom CSS field
2. Observe preview

**Expected:** Accept All button turns orange.

**Status:** ☐ PASS / ☐ FAIL

---

**Steps — Withdrawal button position:**
1. Switch **Withdrawal Button Position** to Bottom Left
2. Click the **After Consent** tab

**Expected:** Floating button appears in the bottom-left of the preview.

**Status:** ☐ PASS / ☐ FAIL

---

**Steps — Sandbox security (no script execution):**
1. Open DevTools → iframe devtools context
2. Verify no JavaScript executes inside the preview iframe (it's purely static HTML+CSS)

**Expected:** No fetch calls, no cookie writes, no `window.ComplianceKit` inside the iframe.

**Status:** ☐ PASS / ☐ FAIL

---

**Steps — Accessibility:**
1. Ensure preview iframe has `title` attribute describing it
2. Ensure tab buttons have `aria-pressed` set correctly on the active tab

**Expected:** Both conditions met.

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 5 — POLICY GENERATION

### 5.1: Privacy Policy

**Steps:**
1. Go to Website → Policies → Generate Privacy Policy
2. View the generated policy

**Expected:**
- **Amber disclaimer box at the very top:** "This policy was generated by ComplianceKit based on information you provided. It is a starting template. You should have it reviewed by a qualified legal professional before publishing."
- Policy contains company name from website settings
- Covers: data collection, cookies, user rights, contact details
- Public URL at `/api/policy/[embedCode]` accessible without login

**GDPR:** A5 — no policy should be presented as legally reviewed without disclaimer.

**Status:** ☐ PASS / ☐ FAIL — **Disclaimer visible:** ☐ YES / ☐ NO

---

### 5.2: Cookie Policy

**Steps:**
1. Generate Cookie Policy (requires prior scan)
2. View policy

**Expected:**
- Same amber disclaimer at top
- Lists cookies discovered in the most recent scan
- Organized by category (Necessary, Analytics, Marketing, Functional)

**Status:** ☐ PASS / ☐ FAIL — **Disclaimer visible:** ☐ YES / ☐ NO

---

## PHASE 6 — DSAR MANAGEMENT

### 6.1: DSAR Submission + Email Notifications (A1 + A2)

**Steps:**
1. Go to Dashboard → DSAR → copy the public form URL
2. Open the URL in an incognito window
3. Submit a request: Name "Test Person", Email (a real address you can check), Type "Access", Description "Test DSAR"
4. Wait 2 minutes and check **two** email inboxes:
   - The email address used in the form (requester confirmation)
   - The website owner's registered email (owner notification)

**Expected — Requester email:**
- Subject mentions DSAR / data request
- Contains reference number
- Confirms 30-day response deadline
- Company name present

**Expected — Owner email:**
- Subject mentions new data request received
- Requester name + email visible
- **Due date highlighted** (30 days from submission)
- Direct link to dashboard to manage the request

**GDPR:** Article 12(3) — acknowledgment required; missing email means breach of this article.

**Status:** ☐ PASS / ☐ FAIL
- Requester email received: ☐ YES / ☐ NO
- Owner email received: ☐ YES / ☐ NO

---

### 6.2: DSAR Dashboard Management

**Steps:**
1. View DSAR in dashboard (created in 6.1)
2. Update status: Pending → In Progress → Completed
3. Add internal note

**Expected:** Status updates save, activity timeline visible.

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 7 — BILLING

### 7.1: Pricing Page — USD Display (D4)

**Steps:**
1. Go to `/pricing`

**Expected:**
- Prices shown in **USD as primary** (e.g., "$16/mo")
- ZAR shown as secondary small text: "Billed as R299 via Paystack"
- NOT ZAR as primary

**Status:** ☐ PASS / ☐ FAIL

---

### 7.2: DPA Page

**Steps:**
1. Go to `/dpa`

**Expected:**
- Full Data Processing Agreement text
- Covers Article 28 obligations, sub-processors, retention periods
- Accessible without login

**GDPR:** Article 28 requires a written DPA between ComplianceKit and each customer.

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 8 — MONITORING & SECURITY

### 8.1: Health Endpoint

```bash
curl https://your-domain.com/api/health
```

**Expected:** `{"status":"ok","timestamp":"..."}` with HTTP 200. No DB dependency.

**Status:** ☐ PASS / ☐ FAIL

---

### 8.2: Sentry Integration (F1)

**Steps:**
1. Verify `NEXT_PUBLIC_SENTRY_DSN` is set in Vercel
2. Trigger a test error (or check Sentry dashboard for any captured events from previous deploys)

**Expected:** Errors appear in Sentry project within 30 seconds.

**Status:** ☐ PASS / ☐ FAIL / ☐ SKIP (not deployed yet)

---

### 8.3: Security Alert Email (F2)

**Steps:**
1. Trigger an account lockout (5 wrong passwords)
2. Check `SECURITY_ALERT_EMAIL` inbox

**Expected:** Email received with event type `LOGIN_LOCKED`, IP address, timestamp.

**Status:** ☐ PASS / ☐ FAIL

---

### 8.4: Widget Template Injection (B2 regression)

**Steps:**
1. Try accessing: `GET /api/widget/AAAA'%2Balert(document.domain)%2B'BBBB/script.js`
2. Inspect the response body

**Expected:**
- Returns 404 (unknown embed code rejected)
- Response body does NOT contain any unescaped version of the payload

**Security:** Confirms B2 fix (safeJsString + DB validation) holds.

**Status:** ☐ PASS / ☐ FAIL

---

### 8.5: SSRF Blocked in Scanner

**Steps:**
1. Add a website with URL `https://attacker-controlled.com` that you configure to return a 301 redirect to `http://169.254.169.254`
   *(Or: test with a URL that resolves to a private IP if you control DNS)*

**Note:** Full DNS rebinding tests require a controlled environment. Basic checks (IP literals) are tested by automated tests. Confirm those pass: `pnpm test`.

**Status:** ☐ PASS / ☐ SKIP (requires controlled DNS environment)

---

## PHASE 9 — ONBOARDING EMAIL SEQUENCE (D5)

### 9.1: Day 0 — Welcome Email

Already tested in Phase 1.2. Mark here for cross-reference.

**Status:** ☐ PASS (from 1.2) / ☐ FAIL

---

### 9.2: Day 1 Cron (No Scan)

**Steps:**
1. Create a test account and do NOT add any website
2. Manually trigger the cron: `GET /api/cron/onboarding-emails` with `Authorization: Bearer {CRON_SECRET}` header — but first set `createdAt` to 25 hours ago in the DB for this user
3. Check inbox

**Expected:** Day 1 "Have you scanned yet?" email received.

**Status:** ☐ PASS / ☐ FAIL / ☐ SKIP (manual DB edit required)

---

### 9.3: Cron Auth Rejects Unauthenticated Requests

**Steps:**
```bash
curl https://your-domain.com/api/cron/onboarding-emails
curl https://your-domain.com/api/cron/archive-consent
```

**Expected:** HTTP 401 (no bearer token provided).

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 10 — WORDPRESS PLUGIN

### 10.1: Plugin Activates Without Fatal Errors

**Steps:**
1. Install a fresh WordPress site (Local by Flywheel or similar)
2. Upload `wordpress-plugin/compliancekit/` to `wp-content/plugins/`
3. Activate from Plugins screen

**Expected:** No PHP fatal error. No white screen of death. Plugin listed as active.

**Status:** ☐ PASS / ☐ FAIL

---

### 10.2: Settings Page Accessible

**Steps:**
1. Go to Settings → ComplianceKit

**Expected:**
- Page loads without error
- Three fields: Embed Code, App URL, Footer Link checkbox
- Admin warning notice visible ("not configured")
- "Getting Started" guide at bottom

**Status:** ☐ PASS / ☐ FAIL

---

### 10.3: Script Injected in `<head>`

**Steps:**
1. Enter a valid embed code (e.g., `ABC123TEST`) and save
2. View frontend of WordPress site
3. Right-click → View Page Source

**Expected:**
```html
<!-- ComplianceKit Cookie Consent v1.0.1 -->
<script src="https://compliancekit.com/widget.js" data-embed-code="ABC123TEST" defer></script>
```

**Status:** ☐ PASS / ☐ FAIL

---

### 10.4: No Script When Embed Code Is Empty

**Steps:**
1. Clear the embed code field, save
2. View page source

**Expected:** No `widget.js` script tag in `<head>`. No ComplianceKit comment.

**Status:** ☐ PASS / ☐ FAIL

---

### 10.5: Footer Link Checkbox Saves Correctly in Both Directions

**Steps:**
1. Check "Footer Link" checkbox, save settings
2. View frontend source — `<div id="ck-footer-link">` present in `<body>`
3. **Uncheck** the checkbox, save settings
4. View frontend source — `<div id="ck-footer-link">` **NOT** present

**This is the checkbox regression test.** Step 4 failing means the hidden field fix (Bug #1) is not working.

**Status:** ☐ PASS / ☐ FAIL

---

### 10.6: Admin Notice Suppressed on Settings Page

**Steps:**
1. With no embed code set, navigate around the WP admin (Posts, Pages, etc.)
2. Note warning notice appearing
3. Navigate to Settings → ComplianceKit

**Expected:** Notice is NOT shown on the settings page itself (avoids duplicate UI).

**Status:** ☐ PASS / ☐ FAIL

---

### 10.7: Options Cleaned Up on Plugin Deletion

**Steps:**
1. Check `wp_options` table: `SELECT * FROM wp_options WHERE option_name LIKE 'ck_%';` — 3 rows
2. Deactivate and **Delete** the plugin
3. Re-check `wp_options`

**Expected:** All 3 `ck_*` options removed from DB.

**Status:** ☐ PASS / ☐ FAIL

---

### 10.8: XSS — Sanitized Embed Code in Script Tag

**Steps:**
1. Enter `ABC';alert(document.domain)//` in the embed code field and save
2. View page source

**Expected:**
- The stored/displayed embed code is alphanumeric only: `ABCalertdocumentdomain`
- No XSS payload in the `data-embed-code` attribute or anywhere else

**Status:** ☐ PASS / ☐ FAIL

---

### 10.9: Compatibility — Caching Plugin

**Steps:**
1. Install WP Super Cache or W3 Total Cache
2. Clear cache after saving ComplianceKit settings
3. View cached page source

**Expected:** `widget.js` script tag present even on cached pages (since it's in `wp_head` which is typically included in cached output).

**Status:** ☐ PASS / ☐ FAIL / ☐ SKIP

---

## PHASE 11 — GDPR COMPLIANCE VERIFICATION

### 11.1: Right of Access — Data Export

**Steps:**
1. Dashboard → Settings → Export Data
2. Download the JSON file

**Expected:**
- Includes: account info, websites, scans, policies, DSARs, consent records
- Machine-readable JSON
- Delivered immediately (not by email)

**GDPR:** Article 15 + 20.

**Status:** ☐ PASS / ☐ FAIL

---

### 11.2: Right to Erasure — Account Deletion

**Steps:**
1. Dashboard → Settings → Delete Account
2. Confirm deletion email sent
3. Follow deletion link
4. Log in with deleted credentials

**Expected:**
- Cannot log in (account gone)
- After cron runs (check `process-account-deletions` cron): all websites, scans, consents, DSARs deleted

**GDPR:** Article 17.

**Status:** ☐ PASS / ☐ FAIL

---

### 11.3: Data Retention Cron

**Steps:**
1. Check `vercel.json` — `archive-consent` cron is scheduled at `0 3 * * *`
2. Verify consent records older than the plan's retention period are deleted by the cron

**Expected:** Records beyond retention limit removed; recent records kept.

**GDPR:** Data minimisation, Article 5(1)(e).

**Status:** ☐ PASS / ☐ SKIP (requires old test data in DB)

---

### 11.4: Public Legal Pages

| URL | Expected | Status |
|-----|----------|--------|
| `/privacy` | ComplianceKit privacy policy loads | ☐ P / ☐ F |
| `/terms` | Terms of Service loads; section 3.1 states 18+ | ☐ P / ☐ F |
| `/cookie-policy` | Cookie policy loads | ☐ P / ☐ F |
| `/dpa` | GDPR Article 28 DPA loads | ☐ P / ☐ F |

---

## PHASE 12 — WCAG 2.1 AA ACCESSIBILITY

Run automated checks first: paste each URL into [https://wave.webaim.org](https://wave.webaim.org) or run `axe` in DevTools.

### 12.1: Color Contrast

**Tool:** DevTools → Accessibility → Contrast, or browser extension "Colour Contrast Analyser"

| Requirement | Standard |
|-------------|----------|
| Normal text (< 18pt) | ≥ 4.5:1 contrast ratio |
| Large text (≥ 18pt or ≥ 14pt bold) | ≥ 3:1 |
| UI components (buttons, inputs, borders) | ≥ 3:1 |

**Pages to check:** Homepage, Dashboard, Sign-up form, Banner config, Scan results, `/demo`

**Status:** ☐ PASS / ☐ FAIL — **Failures:** _______________________________

---

### 12.2: Keyboard Navigation

**Steps:**
1. Tab through the entire sign-up form using only keyboard
2. Tab through the dashboard navigation
3. Tab through the scan results page (findings expand/collapse)
4. Open the test banner on a page — tab through it

**Expected:**
- Every interactive element reachable by Tab
- Focus indicator clearly visible (not just browser default outline)
- No keyboard traps (can Tab out of every element)
- Escape closes modals

**Status:** ☐ PASS / ☐ FAIL

---

### 12.3: Cookie Banner Keyboard Accessibility

**Steps:**
1. Load test page with banner (fresh incognito)
2. Tab into banner — can you reach Accept / Reject / Settings buttons?
3. Use Enter/Space to activate buttons
4. Open settings modal — can you tab through toggles?
5. Escape to close modal without saving

**Expected:**
- All banner controls reachable by keyboard
- Settings modal is a proper dialog (focus trapped inside until closed)
- Escape closes modal

**WCAG:** 2.1.1 Keyboard, 2.1.2 No Keyboard Trap.

**Status:** ☐ PASS / ☐ FAIL

---

### 12.4: Form Labels and Error Messages

**Steps:**
1. Go to `/sign-up`
2. Right-click each form field → Inspect → verify `<label for="...">` matches field `id`
3. Submit empty form
4. Verify error messages are displayed **and** associated to the correct field via `aria-describedby` or similar

**Expected:**
- Every input has an associated `<label>`
- Error messages are programmatically associated (not just visually placed near the field)
- No input labelled only by placeholder text

**WCAG:** 1.3.1 Info and Relationships, 3.3.1 Error Identification.

**Status:** ☐ PASS / ☐ FAIL

---

### 12.5: Images and Icons Have Text Alternatives

**Steps:**
1. Open DevTools → Accessibility tab on homepage and dashboard
2. Check all `<img>` elements for `alt` attributes
3. Check all icon-only buttons (e.g., copy button on embed code) for `aria-label`

**Expected:**
- Decorative images: `alt=""`
- Meaningful images: descriptive `alt` text
- Icon-only buttons: `aria-label` or visually-hidden text

**WCAG:** 1.1.1 Non-text Content.

**Status:** ☐ PASS / ☐ FAIL

---

### 12.6: Screen Reader Test

**Tool:** NVDA (Windows, free) or VoiceOver (Mac, built-in)

**Steps:**
1. Enable screen reader
2. Navigate to `/sign-up` — can you complete the form?
3. Navigate to `/dashboard` — can you understand page structure (headings, landmarks)?
4. Navigate to a scan result — are the findings comprehensible?

**Expected:**
- Page landmarks announced (`<main>`, `<nav>`, `<header>`)
- Headings in logical order (h1 → h2 → h3)
- Dynamic content updates (scan status) announced via `aria-live` region

**WCAG:** 4.1.3 Status Messages.

**Status:** ☐ PASS / ☐ FAIL / ☐ PARTIAL

---

### 12.7: Motion and Animations

**Steps:**
1. In OS settings, enable "Reduce Motion"
2. Load the dashboard and scan results

**Expected:**
- Animations reduced or eliminated
- No content flashing more than 3 times per second

**WCAG:** 2.3.1 Three Flashes, 2.3.3 Animation from Interactions (AAA but worth testing).

**Status:** ☐ PASS / ☐ FAIL / ☐ SKIP

---

### 12.8: Responsive Design (Mobile)

**Steps:**
1. Open DevTools → Device toolbar → iPhone 14 (390×844)
2. Test: homepage, sign-up, dashboard, scan results, banner config

**Expected:**
- No horizontal scroll
- All text readable (≥ 16px body text)
- Touch targets ≥ 44×44 CSS px (WCAG 2.5.5)
- Navigation accessible on mobile

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 13 — PERFORMANCE

### 13.1: Widget JS File Size

```bash
ls -lh C:/Private/AI/ComplianceKit/public/widget.js
```

**Expected:** < 50KB uncompressed (< 15KB gzipped).

**Status:** ☐ PASS / ☐ FAIL — **Size:** _______

---

### 13.2: Banner First Appearance Time

**Steps:**
1. Open test page in Chrome → Network tab → throttle to "Fast 4G"
2. Hard reload
3. Note time between DOMContentLoaded and banner visible

**Expected:** Banner appears within 2 seconds on Fast 4G.

**Status:** ☐ PASS / ☐ FAIL — **Time:** _______ms

---

### 13.3: Dashboard Load Time

**Steps:**
1. Open Chrome → Network tab → no throttle
2. Hard reload dashboard

**Expected:** < 3s to interactive (LCP < 2.5s, CLS < 0.1, FID/INP < 200ms)

**Status:** ☐ PASS / ☐ FAIL

---

## PHASE 14 — CROSS-BROWSER

Test key user journeys in each browser:

| Journey | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Sign up + sign in | ☐ | ☐ | ☐ | ☐ |
| Cookie banner shows + consent recorded | ☐ | ☐ | ☐ | ☐ |
| Consent withdrawal works | ☐ | ☐ | ☐ | ☐ |
| Dashboard loads without errors | ☐ | ☐ | ☐ | ☐ |
| Scan results readable | ☐ | ☐ | ☐ | ☐ |

---

## SUMMARY

Fill out after completing all phases:

| Phase | Status | Notes |
|-------|--------|-------|
| Automated tests | ☐ | |
| Pre-flight | ☐ | |
| Auth & Signup | ☐ | |
| Onboarding | ☐ | |
| Scanning & SSRF | ☐ | |
| Cookie Banner & Consent | ☐ | |
| Policy Generation | ☐ | |
| DSAR | ☐ | |
| Billing | ☐ | |
| Monitoring & Security | ☐ | |
| Onboarding Emails | ☐ | |
| WordPress Plugin | ☐ | |
| GDPR Compliance | ☐ | |
| WCAG 2.1 AA | ☐ | |
| Performance | ☐ | |
| Cross-browser | ☐ | |

**Overall:** ☐ Ready to launch / ☐ Needs fixes (list below) / ☐ Significant issues

**Blocking issues:**
1. _______________________________________________
2. _______________________________________________

**Known gaps to address before launch:**
- WordPress plugin: PHP tests require local WP environment + Composer to run (`cd wordpress-plugin/compliancekit && composer install && composer test`)
- WordPress plugin: not yet submitted to WordPress.org plugin directory

---

*Update this document when new features are added. Last updated: 2026-03-08*
