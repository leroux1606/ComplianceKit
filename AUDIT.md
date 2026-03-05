# ComplianceKit — Full Audit & Fix Roadmap

> Generated: 2026-03-03
> Purpose: This is the master issue tracker and fix roadmap. At the start of each session,
> the developer reads this file and PROGRESS.md, then instructs Claude which items to work on.
> Claude updates PROGRESS.md after each completed item.

---

## HOW TO USE THIS FILE

1. Read this file to understand all outstanding issues
2. Read PROGRESS.md to see what is done and what is next
3. Tell Claude: "Work on item [ID]" or "Work on the next P0 items"
4. Claude implements the fix, updates PROGRESS.md, and reports what was done

---

## PRIORITY LEVELS

| Level | Meaning |
|-------|---------|
| P0 | Launch blocker — do not take paying customers without this |
| P1 | Important — needed within first month of launch |
| P2 | Scale issue — needed before 50+ customers |
| P3 | Strategic — improves competitiveness and revenue |

---

## CATEGORY A — LEGAL & COMPLIANCE (You and your customers are exposed)

### A1 — DSAR Email Confirmation is Missing [P0]
**Problem:** When a visitor submits a DSAR (Data Subject Access Request) through the public form, no confirmation email is sent to the requester. This is explicitly marked as a TODO in the codebase.
**Legal risk:** GDPR Article 12(3) requires acknowledgment of DSARs within one month. Failing to send confirmation means your customers are in breach of GDPR the moment they receive a DSAR through your tool.
**Fix:** Implement Resend email sending in the DSAR submission API route (`app/api/dsar/[embedCode]/route.ts`). Send: (1) confirmation to requester with their request reference number, (2) notification to website owner that a new DSAR arrived.
**Complexity:** Low — 1 day. Resend is already integrated, email templates just need to be written and wired.

---

### A2 — DSAR Owner Notification Email is Missing [P0]
**Problem:** Same as A1 — when a DSAR is submitted, the website owner is not notified by email. They would only see it if they log in and check the dashboard.
**Legal risk:** If a website owner misses a DSAR because they didn't check the dashboard, they breach GDPR Article 12 (1-month response deadline). You become the tool that caused the breach.
**Fix:** Send email to website owner's registered email when a DSAR is submitted for their site. Include: requester name/email, request type, due date (30 days from submission), link to dashboard to manage it.
**Complexity:** Low — bundled with A1, same day of work.

---

### A3 — Consent Records Missing Critical Legal Fields [P0]
**Problem:** The `Consent` database table stores preferences and visitor ID but does NOT record:
- Which version of the banner config was shown when consent was given
- Which version of the privacy/cookie policy was active at that time
- Whether consent was "accept all" or granular per-category selection

**Legal risk:** GDPR Recital 42 + Article 7 requires proof that consent was specific and informed. If a website owner's banner config changes after a visitor consented, there is no link between the stored consent record and what the visitor actually saw. A DPA auditor would reject these logs as insufficient proof of consent.
**Fix:** Add fields to `Consent` model: `bannerConfigVersion` (snapshot or version ID), `policyVersion` (active policy version at time of consent), `consentMethod` (enum: `accept_all` | `reject_all` | `custom`). Update the widget consent endpoint to populate these fields.
**Complexity:** Medium — 2 days. DB migration + widget JS update + API update.

---

### A4 — No Consent Withdrawal Mechanism [P0]
**Problem:** The consent banner records consent but there is no way for a website visitor to later withdraw or change their consent preferences. Once "Accept All" is clicked, there is no UI to revisit that decision.
**Legal risk:** GDPR Article 7(3) states withdrawal of consent must be as easy as giving it. An embedded banner with no way to re-open settings is non-compliant.
**Fix:** Add a persistent "Manage Cookie Preferences" button/link that the widget renders on the page (configurable position — typically bottom corner). Clicking it re-opens the consent settings panel. The widget already has a settings panel — it just needs to always remain accessible after initial consent.
**Complexity:** Medium — 2-3 days. Widget JS + banner config UI + documentation for customers on how to style/position the button.

---

### A5 — Generated Policies Have No Legal Disclaimer [P1]
**Problem:** The policy generator produces HTML privacy and cookie policies via template substitution. There is no disclaimer stating these are auto-generated templates, not legally reviewed documents. Customers may treat the generated policy as final legal documentation without professional review.
**Legal risk:** If a customer is fined by a DPA for an inadequate privacy policy that your tool generated, and there is no disclaimer, you may face complaints or reputational damage. The legal risk to you is limited by your ToS but the customer risk is real.
**Fix:** Add a visible disclaimer block at the top of every generated policy: "This policy was generated by ComplianceKit based on information you provided. It is a starting template. You should have it reviewed by a qualified legal professional before publishing."
**Complexity:** Low — a few hours. Update the policy generator template files.

---

### A6 — No Data Processing Agreement (DPA) for Customers [P1]
**Problem:** ComplianceKit processes personal data on behalf of its customers (visitor consent records, DSAR submissions, IP addresses). Under GDPR Article 28, this requires a written Data Processing Agreement between ComplianceKit and each customer.
**Legal risk:** Without a DPA, every customer using your product is technically non-compliant with Article 28. More importantly, you have no legal protection if a customer misuses the product or blames you for a breach.
**Fix:** Create a standard DPA document and:
1. Host it as a public page on the marketing site (`/dpa`)
2. Add acceptance of DPA to the signup flow (checkbox alongside ToS)
3. Record DPA acceptance date in the User model (add `dpaAcceptedAt` field)

**Complexity:** Medium — DPA document needs to be drafted (use a standard GDPR Article 28 template), then 1-2 days to integrate into signup flow and DB.

---

### A7 — Age Verification is a Non-Verifiable Checkbox [P1]
**Problem:** Signup records `ageVerifiedAt` when a user checks "I confirm I am 16 or older." A checkbox is legally meaningless as age verification.
**Risk:** Low for a B2B SaaS (customers are businesses, not children), but the claim of GDPR compliance while using a legally insufficient verification method is bad optics for a compliance product.
**Fix:** Either (a) remove the age field and rely on standard B2B terms stating the service is for business use only (simpler and actually more appropriate for B2B SaaS), or (b) add date of birth field and validate server-side. Option (a) is recommended.
**Complexity:** Low — 1 day.

---

### A8 — Compliance Score Has No Legal Disclaimer [P1]
**Problem:** The dashboard shows a score like "85/100 — Excellent." This looks like a legal opinion. If a customer gets fined after seeing this score, they may argue the product misled them.
**Fix:** Add a clearly visible disclaimer near the compliance score: "This score reflects technical compliance indicators only and does not constitute legal advice. A high score does not guarantee regulatory compliance."
**Complexity:** Low — UI copy change, a few hours.

---

### A9 — Consent Record Export Missing [P1]
**Problem:** If a DPA (data protection authority) requests that a customer provide their consent records as part of an investigation, there is no way to export them.
**Fix:** Add a consent log export feature in the dashboard — CSV download of all consent records for a website, filtered by date range. Fields: visitorId, consentedAt, preferences, method, policyVersion.
**Complexity:** Low-Medium — 1-2 days.

---

## CATEGORY B — SECURITY (Vulnerabilities that must be fixed before launch)

### B1 — Scanner Has No SSRF Protection [P0]
**Problem:** The scanner accepts a user-submitted URL and navigates to it with Puppeteer (headless Chrome). There is no validation preventing users from submitting internal network addresses such as:
- `http://localhost:5432` (database)
- `http://169.254.169.254/latest/meta-data/` (AWS metadata endpoint — exposes cloud credentials)
- `http://192.168.0.1` (internal router/admin panel)
- `http://10.0.0.1` (private network ranges)
- `file:///etc/passwd` (local file system)

**Security risk:** Critical. An attacker can use your scanner to probe internal infrastructure, steal cloud credentials, or exfiltrate sensitive data from your hosting environment.
**Fix:** Before passing any URL to Puppeteer, validate it:
1. Must be http:// or https:// only
2. Resolve the hostname — if the resolved IP falls in a private range (10.x.x.x, 172.16.x.x-172.31.x.x, 192.168.x.x, 127.x.x.x, 169.254.x.x), reject the scan
3. Block .local domains
4. Implement a URL allowlist check (must be a valid public domain)

**Complexity:** Low-Medium — 1 day. A URL validation utility + DNS resolution check before Puppeteer is invoked.

---

### B2 — Widget Script Template Injection Risk [P1]
**Problem:** The widget script is generated server-side with interpolated values (embedCode, API URL). If any interpolated value is not properly escaped for JavaScript string context, stored XSS is possible — and it would execute on every website using your widget.
**Fix:** Audit `app/api/widget/[embedCode]/script.js/route.ts` — ensure all interpolated values are JSON-encoded (not just string-concatenated) when inserted into JavaScript. Use `JSON.stringify()` for all dynamic values in the template.
**Complexity:** Low — audit + fix is a few hours.

---

### B3 — Rate Limiting Fails Open [P1]
**Problem:** The rate limiter is DB-backed, which is correct for serverless. However, if the database is unavailable, rate limiting is bypassed entirely (the code catches the DB error and allows the request through). This means a DB outage combined with a bad actor = unlimited requests to all endpoints.
**Fix:** Add monitoring/alerting when rate limiting fails open (log a critical-level security event). Consider a secondary in-memory fallback with a conservative limit (e.g., 10 requests per second per IP) using a simple sliding window that doesn't require DB. This limits blast radius during DB outages.
**Complexity:** Medium — 1-2 days.

---

### B4 — DSAR File Attachments Need Security Review [P1]
**Problem:** The `DsarAttachment` model exists in the schema. The security of file upload handling (MIME type validation, size limits, storage location, virus scanning) is unknown.
**Fix:** Audit the DSAR attachment upload implementation. Ensure: (1) MIME type validated server-side not just by extension, (2) file size limit enforced (suggest 10MB max), (3) files stored in private cloud storage (not publicly accessible URL), (4) filename sanitized before storage.
**Complexity:** Low-Medium — depends on what is already implemented.

---

### B5 — Paystack Webhook Signature Verification Needs Confirmation [P1]
**Problem:** Paystack webhooks should be verified using HMAC signature before processing. The codebase mentions a webhook secret but the actual verification implementation needs to be confirmed as correct.
**Fix:** Audit `app/api/webhooks/paystack/route.ts` — verify that the X-Paystack-Signature header is validated against HMAC-SHA512 of the raw request body using the PAYSTACK_WEBHOOK_SECRET before any business logic runs.
**Complexity:** Low — audit only, likely already implemented.

---

## CATEGORY C — ARCHITECTURE (Will break under real load)

### C1 — No Job Queue for Scans [P2]
**Problem:** Website scans run synchronously inside serverless API routes. Each scan uses Puppeteer which requires 300-500MB RAM and up to 120 seconds to complete. On Vercel, multiple simultaneous scans will:
- Hit memory limits and crash
- Time out on free/hobby tier (60 second function limit)
- Queue up without any user feedback

**Fix:** Implement an async job queue for scans:
1. User clicks "Scan" → API creates a scan job record with status `queued`, returns immediately
2. A background worker picks up the job and runs Puppeteer
3. Frontend polls scan status endpoint or uses server-sent events to show progress
4. Recommended tools: Trigger.dev (integrates well with Next.js), Inngest, or a separate Node.js worker on Railway/Render

**Complexity:** High — 1-2 weeks. This is a significant architectural change but necessary before any real traffic.

---

### C2 — Widget JS Served from Serverless API [P2]
**Problem:** Every page load on every customer's website makes a request to `/api/widget/[embedCode]/script.js`. This is a serverless function invocation. At 100 customers with 1,000 daily visitors each = 100,000 function invocations per day from the widget alone. At 1,000 customers this becomes 1 million daily invocations — expensive and slow.
**Fix:** Refactor widget delivery:
1. Widget JS becomes a static file stored on a CDN (Cloudflare R2, AWS S3 + CloudFront)
2. The static file fetches its configuration asynchronously from the API after load (`/api/widget/[embedCode]/config` — already exists)
3. Only the consent POST (`/api/widget/[embedCode]/consent`) remains a dynamic API call
4. Result: CDN serves JS for free/cheap, API only handles actual consent submissions

**Complexity:** High — 1 week. Requires refactoring widget delivery architecture.

---

### C3 — No Database Connection Pooling [P2]
**Problem:** On Vercel serverless, each function invocation can open a new PostgreSQL connection. Without connection pooling, under load you will hit PostgreSQL's connection limit and get random 500 errors.
**Fix:** Use a connection pooler. Options:
1. Switch to Neon or Supabase as database host (both include built-in pooling via PgBouncer)
2. Or add PgBouncer between Vercel and your DB
3. Update DATABASE_URL to use the pooled connection string

**Complexity:** Low — 1 day configuration change. No code changes needed if using Neon/Supabase.

---

### C4 — Consent Table Has No Archival Strategy [P2]
**Problem:** One consent record per visitor per website visit. At 100 customers with 1,000 visitors/day = 100,000 rows/day = 3 million rows/month. No partitioning or archival is planned.
**Fix:**
1. Add a database index audit for the consent table (ensure websiteId + consentedAt composite index exists)
2. Implement archival: consent records older than the plan's data retention period should be moved to a cold storage table or deleted
3. The data retention periods are already defined in the code (Free: 7 days, Starter: 30 days, etc.) — wire them to an archival cron job

**Complexity:** Medium — 2-3 days.

---

## CATEGORY D — MISSING FEATURES (Directly affects revenue)

### D1 — Google Consent Mode v2 Not Implemented [P0]
**Problem:** Since March 2024, Google requires Consent Mode v2 for anyone using Google Ads or Google Analytics 4 with audience/remarketing features. Without it, conversion tracking and audience features break for customers using Google Ads. This is the #1 question any SMB will ask before buying a consent tool.
**Fix:** Update the consent banner widget to implement Consent Mode v2 signals:
```javascript
// On page load (before consent):
gtag('consent', 'default', {
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'analytics_storage': 'denied'
});

// After user consents:
gtag('consent', 'update', {
  'ad_storage': preferences.marketing ? 'granted' : 'denied',
  'ad_user_data': preferences.marketing ? 'granted' : 'denied',
  'ad_personalization': preferences.marketing ? 'granted' : 'denied',
  'analytics_storage': preferences.analytics ? 'granted' : 'denied'
});
```
Add a toggle in BannerConfig to enable/disable Consent Mode v2 (for customers not using Google products).
**Complexity:** Medium — 2-3 days. Widget JS update + banner config UI toggle + documentation.

---

### D2 — No Demo / Preview Mode [P1]
**Problem:** A new user who signs up sees a blank dashboard. They must add a website, trigger a scan (30-120 second wait), and navigate multiple steps before seeing any value. There is no way to preview the product before signing up.
**Fix:**
1. Create a "demo scan" — pre-populated scan results for a fictional company (e.g., "Demo Store") visible immediately on first login before any website is added
2. Add a public marketing page with a live interactive demo showing a sample scan result, sample banner, sample dashboard
3. Add a setup wizard (step indicator: Add site → Scan → Configure banner → Install → Done)

**Complexity:** Medium — 1 week for demo mode + setup wizard.

---

### D3 — No WordPress Plugin [P1]
**Problem:** The target SMB market overwhelmingly uses WordPress (43% of all websites). Currently, installation requires manually pasting an embed code into a WordPress theme. This is a barrier that will cause significant drop-off during onboarding.
**Fix:** Create a WordPress plugin that:
1. Accepts the embed code as a settings field
2. Automatically injects the widget script into the site's `<head>`
3. Optionally: adds a "Manage Cookie Preferences" link to the footer automatically

This does not need to be a complex plugin — even a minimal plugin that handles script injection is enough to remove the friction.
**Complexity:** Medium — 1 week. WordPress plugin development (PHP).

---

### D4 — Pricing Displayed in ZAR Only [P1]
**Problem:** GDPR is primarily a European regulation. The target market includes EU and UK businesses. Showing prices in ZAR (South African Rand) signals a local product and creates confusion for international buyers. 299 ZAR is approximately $16 USD — a reasonable price — but international buyers don't know that.
**Fix:**
1. Display pricing in USD on the marketing/pricing page as primary currency
2. Keep Paystack and ZAR for actual payment processing (this is fine — Paystack supports international cards)
3. Show approximate local currency as secondary: "$16/month USD (~R299)"
4. Long term: add Stripe for direct USD/EUR billing

**Complexity:** Low — 1 day. Marketing page copy change + pricing component update.

---

### D5 — No Onboarding Email Sequence [P1]
**Problem:** After signup there is no email sequence to guide new users through setup. Without guidance, users who don't complete setup on day 1 will churn.
**Fix:** Implement a simple onboarding email sequence via Resend:
- Day 0 (immediate): Welcome email with "Your first scan in 3 steps" guide
- Day 1 (if no scan done): "Have you scanned your website yet?" nudge
- Day 3 (if no banner installed): "Your banner is ready — here's how to install it"
- Day 7 (if no plan upgraded): Value email showing what Pro unlocks

**Complexity:** Medium — 2-3 days. Resend is already integrated.

---

### D6 — No Public API for Banner Control [P2]
**Problem:** Technical customers (developers, agencies) need to programmatically control the consent banner — triggering it from their own code, reading consent status, or integrating with their own analytics. Currently the widget is black-box JS.
**Fix:** Expose a JavaScript API on the widget: `window.ComplianceKit.getConsent()`, `window.ComplianceKit.openSettings()`, `window.ComplianceKit.onConsentChange(callback)`. Document it.
**Complexity:** Medium — 3-4 days.

---

### D7 — No IAB TCF 2.2 Support [P3]
**Problem:** IAB TCF (Transparency and Consent Framework) certification is required to serve consent for programmatic advertising. Without it, you cannot serve enterprise adtech customers.
**Note:** This is expensive and complex (months of legal/technical work, certification fees). This is a long-term goal, not a short-term fix. Mention it on the roadmap page as "coming soon" to prevent losing enterprise conversations.
**Fix:** Add "IAB TCF 2.2 (coming Q3 2026)" to public roadmap.
**Complexity:** Very High — long-term project. Not for current sprint.

---

## CATEGORY E — USER EXPERIENCE

### E1 — No Setup Wizard / Onboarding Flow [P1]
**Problem:** New users land on a blank dashboard with no guidance. The steps to get value (add site → scan → configure banner → install → verify) are not surfaced.
**Fix:** Create a step-by-step onboarding checklist visible on the dashboard:
- [ ] Add your first website
- [ ] Run your first scan
- [ ] Generate your cookie policy
- [ ] Configure your consent banner
- [ ] Install the banner on your site
- [ ] Verify installation

Each step links to the relevant page. Checklist disappears once all steps are complete.
**Complexity:** Low-Medium — 2-3 days.

---

### E2 — Compliance Score Not Actionable Enough [P1]
**Problem:** A score of "67/100 — Fair" is not actionable for a non-technical SMB owner. They need to know exactly what to do, in what order, to improve their score.
**Fix:** Below the score, add a prioritized "Fix These Issues" list:
1. Show findings sorted by severity (errors first)
2. Each finding should have: what it means in plain English, why it matters, and a specific action button ("Generate Cookie Policy," "Configure Banner," etc.)
3. Group by: "Critical (fix now)," "Important (fix this week)," "Minor (when you can)"

**Complexity:** Medium — 3-4 days. Logic exists in findings data, needs UX translation layer.

---

### E3 — No Installation Verification [P1]
**Problem:** After a customer installs the embed code, there is no way to verify it was installed correctly. They may install it wrong and not know.
**Fix:** Add an "Verify Installation" button in the dashboard that:
1. Makes a lightweight request to the customer's website
2. Checks for the presence of the widget script tag
3. Returns: "Installed correctly ✓" or "Not detected — check your installation"

**Complexity:** Low-Medium — 1-2 days.

---

### E4 — Banner Preview Not Available Before Setup Completion [P2]
**Problem:** The banner configuration editor exists but there is no way to preview the banner without it being installed on a live site. Users configure in the dark.
**Fix:** Add a live interactive preview pane within the banner configuration UI — shows a real-time preview of the banner with the current settings (position, colors, theme, text) rendered in an iframe or modal.
**Complexity:** Medium — 3-4 days.

---

## CATEGORY F — MONITORING & OPERATIONS

### F1 — No Error Tracking [P1]
**Problem:** There is no Sentry or equivalent error tracking. If the scanner crashes, if an API route throws an unhandled error, or if Puppeteer fails silently, you have no visibility.
**Fix:** Add Sentry to the Next.js app. Configure it to capture:
- Unhandled exceptions in API routes
- Scan failures with context (website URL, scan ID)
- Client-side errors in the dashboard

**Complexity:** Low — 1 day. Sentry has a Next.js integration wizard.

---

### F2 — No Alerting for Critical Security Events [P1]
**Problem:** Security events are logged to the database (login_locked, CSRF detected, etc.) but there is a TODO comment for Slack/PagerDuty alerting. Without alerts, security events go unnoticed until you manually check logs.
**Fix:** Implement email alerting (via Resend, already integrated) for critical security events: account lockouts, multiple failed scans, rate limit bypass (when DB is down), webhook failures.
**Complexity:** Low — 1 day.

---

### F3 — No Uptime Monitoring [P1]
**Problem:** No external uptime monitoring configured. If the app goes down, you won't know until a customer complains.
**Fix:** Set up a free uptime monitor (Better Uptime, UptimeRobot, or Checkly). Monitor: app homepage, scan API, widget endpoint, consent endpoint.
**Complexity:** Very Low — 2 hours. External service configuration only.

---

## SUMMARY — LAUNCH READINESS

### Must be done before first paying customer (P0)
| ID | Issue | Days |
|----|-------|------|
| A1 | DSAR confirmation email to requester | 1 |
| A2 | DSAR notification email to website owner | bundled with A1 |
| A3 | Add banner/policy version to consent records | 2 |
| A4 | Consent withdrawal mechanism in widget | 3 |
| B1 | SSRF protection on scanner URL input | 1 |
| D1 | Google Consent Mode v2 | 3 |

**Estimated P0 total: ~10 working days**

### Must be done within first month of launch (P1)
| ID | Issue | Days |
|----|-------|------|
| A5 | Legal disclaimer on generated policies | 0.5 |
| A6 | Data Processing Agreement (DPA) | 3 |
| A7 | Fix age verification approach | 1 |
| A8 | Compliance score disclaimer | 0.5 |
| A9 | Consent record CSV export | 2 |
| B2 | Widget template injection audit | 0.5 |
| B3 | Rate limit fail-open alerting | 1 |
| B4 | DSAR file attachment security audit | 1 |
| B5 | Paystack webhook signature audit | 0.5 |
| D2 | Demo mode + setup wizard | 5 |
| D3 | WordPress plugin | 5 |
| D4 | USD pricing on marketing page | 1 |
| D5 | Onboarding email sequence | 3 |
| E1 | Onboarding checklist in dashboard | 2 |
| E2 | Actionable compliance score UI | 4 |
| E3 | Installation verification tool | 2 |
| F1 | Sentry error tracking | 1 |
| F2 | Security event alerting | 1 |
| F3 | Uptime monitoring | 0.5 |

**Estimated P1 total: ~35 working days**

### Needed before scale (P2)
| ID | Issue | Days |
|----|-------|------|
| C1 | Async job queue for scans | 10 |
| C2 | Widget JS on CDN | 5 |
| C3 | Database connection pooling | 1 |
| C4 | Consent table archival | 3 |
| D6 | Public JS API for banner | 4 |
| E4 | Live banner preview in config | 4 |

**Estimated P2 total: ~27 working days**

---

## MARKET POSITIONING NOTE (read before making any sales/marketing decisions)

**Target market:** Do NOT try to compete with Cookiebot, Termly, or Iubenda head-on for random SMBs via SEO. You will lose that fight without a marketing budget.

**Beachhead market:** Web agencies and freelancers managing compliance for multiple client sites. They have no good tool. Your multi-site dashboard at a flat rate is genuinely attractive. One agency at $99/month beats ten individual SMBs at $10/month on every metric (LTV, churn, support cost).

**Pitch:** "One dashboard. All your clients. DSARs handled. Cookie compliance automated."

**Pricing:** Display in USD. Keep Paystack for billing. Target $49/month (up to 10 sites), $149/month (unlimited sites). Annual discount of 20%.

---

*Last updated: 2026-03-03 | See PROGRESS.md for implementation status*
