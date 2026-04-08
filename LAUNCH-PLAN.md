# ComplianceKit — Launch Plan & Issue Tracker

> Combined from commercial viability evaluation (2026-04-08) and prior session notes.
> Work through each section top-to-bottom. Check off items as completed.

---

## Context

Last session: Google OAuth fixed, DSAR emails implemented, pushed to GitHub. Server runs on port 3002 locally.

**Verdict from evaluation:** Product is commercially viable and ready for soft launch. Core features work. Main risks are business-side — placeholder content, missing admin tooling, payment geography, and a few promised features not yet built.

---

## Phase 1 — Hard Blockers (Must fix before charging anyone)

### 1.1 Remove placeholder / fake marketing content

The marketing site contains unsubstantiated claims that will destroy credibility with any serious buyer.

- [ ] Remove or replace "10K+ users" stat (home page)
- [ ] Remove or replace demo testimonial (home page)
- [ ] Audit all marketing copy for any other fake/placeholder numbers or quotes
- [ ] Either replace with real data or remove entirely until you have real data

---

### 1.2 Fix mobile navigation on marketing site

The features/pricing/docs links are hidden on mobile — bad first impression for any visitor on a phone.

- [ ] Add hamburger menu to home page marketing nav
- [ ] Test on 375px (iPhone SE) and 390px (iPhone 14) viewports
- [ ] Verify all top-level links are accessible on mobile

---

### 1.3 Build minimal admin dashboard

You cannot run a SaaS without being able to look up a customer. Before the first paying customer:

- [ ] Customer lookup (search by email, view plan, subscription status)
- [ ] Ability to view/cancel a subscription manually (for refunds/disputes)
- [ ] View recent DSAR activity across all accounts
- [ ] View recent scan errors / failed scans
- [ ] Basic usage stats (active users, scans run today, new signups)

> Route suggestion: `/admin` — gate behind a hardcoded admin email or `ADMIN_EMAILS` env var.

---

### 1.4 Add Stripe for US/EU markets

PayStack covers South Africa, Nigeria, Ghana well. It does not cover the EU or US. If your target includes those markets, PayStack alone will lose you sales.

- [ ] Add Stripe as a second payment provider
- [ ] Route US/EU customers to Stripe, ZAR customers to PayStack (detect by locale/IP or let user choose)
- [ ] Mirror the 3-tier plan structure in Stripe (USD pricing)
- [ ] Test Stripe webhook flow end-to-end
- [ ] Update billing UI to show Stripe option

> Recommended USD pricing: Starter $15/mo · Professional $45/mo · Enterprise $99/mo

---

### 1.5 Test the 4 DSAR email flows (from prior session)

These were implemented but not yet confirmed working.

Go to `http://localhost:3002/dashboard/dsar` → copy the **Public Form** link.

| Step | Action | Expected |
|------|--------|----------|
| A1+A2 | Submit request from public form (incognito) | 2 emails: confirmation + owner notification |
| A3 | Mark request as **Completed** with a response | 1 email: response to requester |
| A4 | Submit second request → **Reject** with a reason | 1 email: rejection to requester |

> Emails print to terminal in dev mode (no `RESEND_API_KEY` needed).

- [ ] A1 — Submission confirmation email
- [ ] A2 — Owner notification email
- [ ] A3 — Completion/response email
- [ ] A4 — Rejection email

---

## Phase 2 — Important (Before scaling marketing)

### 2.1 Submit WordPress plugin to wordpress.org

Plugin is done and all tests (10.1–10.9) passed. This is a free distribution channel — just submit it.

1. Go to **wordpress.org/plugins/developers/add**
2. Name: `ComplianceKit — Cookie Consent`
3. Plugin URL: `https://compliancekit.com`
4. Upload `wordpress-plugin/compliancekit.zip`
5. Wait 1–5 business days for review

- [ ] Plugin submitted to wordpress.org
- [ ] Review approved
- [ ] Plugin listed publicly

---

### 2.2 Deploy to production (Vercel)

See `DEPLOYMENT.md` for full details.

- [ ] Set all env vars in Vercel dashboard (copy from `.env.local`)
- [ ] Set `NEXTAUTH_URL` / `AUTH_URL` to real domain (not localhost)
- [ ] Add production Google OAuth callback: `https://yourdomain.com/api/auth/callback/google`
- [ ] Add production PayStack webhook URL
- [ ] Push to main → verify Vercel auto-deploys cleanly
- [ ] Smoke test: signup → scan → generate policy → subscribe → DSAR form

---

### 2.3 Add annual billing

Standard SaaS practice — annual billing at ~20% discount improves LTV significantly and reduces churn risk.

- [ ] Add annual plan variants in PayStack (and Stripe when added)
- [ ] Update pricing page to show monthly / annual toggle
- [ ] Show savings label ("Save 20%")
- [ ] Update subscription logic to handle annual renewal cycles
- [ ] Test proration if user upgrades mid-year

---

### 2.4 Build the REST API (promised on Professional tier) ✅ COMPLETE

Professional plan currently advertises "API access" but no API exists. This is a broken promise.

Options:
- **Option A (fast):** Remove "API access" from Professional plan features until it's built
- **Option B (proper):** Build a basic REST API with key management

Minimum viable API endpoints:
- [x] `GET /api/v1/websites` — list user's websites
- [x] `POST /api/v1/websites/:id/scan` — trigger a scan
- [x] `GET /api/v1/scans/:scanId` — get scan results
- [x] `GET /api/v1/policies` — list generated policies
- [x] API key generation UI in dashboard settings
- [ ] Rate limiting per API key
- [ ] API documentation page

> If not building immediately: update plan feature list to remove "API access" to avoid false advertising.

---

### 2.5 Add E2E tests for critical flows

Current test coverage is ~15–25%. Payment flows and DSAR workflows have no integration tests — a breaking change there would be silent until a customer reports it.

- [ ] Signup → email verification → dashboard (happy path)
- [ ] Add website → run scan → view results
- [ ] Generate privacy policy → download PDF
- [ ] Upgrade plan (Stripe + PayStack)
- [ ] Submit DSAR → owner responds → requester receives email
- [ ] Cancel subscription → verify downgrade to Free
- [ ] Account deletion flow (soft delete + anonymization)

> Tool recommendation: Playwright. It works well with Next.js App Router.

---

### 2.6 Improve scan error UX

When a scan fails, users currently see a generic error with no next steps. This causes abandonment.

- [ ] Add specific error messages for common failures:
  - Site unreachable / timeout
  - Site blocked headless browser (bot protection)
  - Invalid URL
  - Scan limit reached (with upgrade CTA)
- [ ] Add "Retry scan" button on failure
- [ ] Log failed scans to admin view (1.3 above)

---

## Phase 3 — Growth Features (Q2 2026)

### 3.1 Team / multi-user management ✅ COMPLETE

Enterprise tier mentions "unlimited team members" but no invite system exists. Needed to sell Enterprise credibly.

- [x] Invite team member by email
- [x] Role system: Owner / Admin / Viewer
- [x] Revoke access
- [ ] Activity log per team member
- [x] Seat-based billing (or unlimited per Enterprise)

---

### 3.2 CCPA compliance scanner ✅ COMPLETE (core)

High value for US market. Currently GDPR-only.

- [x] Research CCPA scanner criteria (California Consumer Privacy Act)
- [x] Add CCPA checks to scanner engine
- [x] Add CCPA score to compliance report
- [ ] Generate CCPA-compliant privacy policy variant (covered by 3.5 AI policy)
- [ ] Add "Do Not Sell My Personal Information" banner option

---

### 3.3 Automated scan scheduling ✅ COMPLETE

Users currently must trigger scans manually. Compliance monitoring needs to be automatic.

- [x] "Schedule scans" UI — weekly / monthly options
- [x] Background job to run scheduled scans (Vercel Cron already in use)
- [x] Email alert when compliance score drops below threshold
- [ ] Changelog view: "Since last scan, 3 new cookies were detected"

---

### 3.4 Scan result remediation guidance ✅ COMPLETE (core)

Scan results show problems but don't tell users how to fix them.

- [x] For each finding, add a "How to fix" expandable section
- [x] Link to relevant GDPR article
- [x] Prioritise findings by severity (Critical / High / Medium / Low)
- [ ] Add "Mark as accepted risk" option for findings users won't fix

---

### 3.5 AI-powered policy generation ✅ COMPLETE

Currently template-based. AI generation would be a meaningful differentiator.

- [x] Integrate Claude API (Anthropic) for policy generation
- [x] Feed scan results + company info into prompt
- [x] Generate custom, non-generic policy text
- [x] Human review step before finalising (amber review banner + edit tab)
- [x] Gate behind Professional/Enterprise (upsell opportunity)

---

### 3.6 Support infrastructure

Before any marketing spend, you need a way for customers to get help.

- [ ] Set up help centre / FAQ (Notion, Crisp Docs, or static page)
- [ ] Add in-app chat or support ticket widget (Crisp, Intercom, or Tawk.to)
- [ ] Create onboarding email sequence (Day 0, Day 3, Day 7 after signup)
- [ ] Add in-app onboarding checklist for new users (first scan, first policy, embed banner)

---

## Phase 4 — Longer Term (Q3–Q4 2026)

- [ ] Chrome extension for quick compliance checks
- [ ] Slack / Teams integration for scan alerts
- [ ] LGPD (Brazil) + PECR (UK) compliance scanner
- [ ] White-label / agency tier
- [ ] Mobile app
- [ ] Multi-tenant reseller model

---

## Technical Debt Log

Minor issues identified during evaluation — address opportunistically.

| Item | File / Area | Priority |
|------|-------------|----------|
| Large files to split | `scanner/index.ts` (200+ lines), `app/page.tsx` (400+ lines) | Low |
| Missing JSDoc on complex functions | Scanner engine, compliance scoring | Low |
| No pagination on consent analytics | Consent log query | Medium |
| Sidebar shows "Free / 1 website" statically | Sidebar component | Low |
| No dark mode toggle in UI | Theme system exists, no control | Low |
| No exponential backoff on API retries | Resend, PayStack clients | Low |
| Puppeteer single browser instance | Scanner service | Medium (performance) |

---

## Tracking

| Phase | Items | Done | Notes |
|-------|-------|------|-------|
| Phase 1 — Hard Blockers | 5 sections | 0 | Must complete before charging |
| Phase 2 — Important | 6 sections | 0 | Before scaling marketing |
| Phase 3 — Growth | 6 sections | 0 | Q2 2026 |
| Phase 4 — Longer Term | 6 items | 0 | Q3–Q4 2026 |

---

*Last updated: 2026-04-08*
