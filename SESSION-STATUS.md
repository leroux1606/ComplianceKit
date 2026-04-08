# Session Status — Pick up from here

## START HERE TOMORROW: Phase 3.6 — Support Infrastructure

### What to do

Run `do 3.6` — Claude will pick up Phase 3.6 from LAUNCH-PLAN.md.

### What 3.6 covers

```
### 3.6 Support infrastructure
- [ ] Set up help centre / FAQ (static page in the app)
- [ ] Add in-app chat or support ticket widget (Crisp, Intercom, or Tawk.to)
- [ ] Create onboarding email sequence (Day 0, Day 3, Day 7 after signup)   ← ALREADY DONE (D5)
- [ ] Add in-app onboarding checklist for new users                          ← ALREADY DONE (E1)
```

Items 3 and 4 above are already done (D5 + E1 from the audit list). Only the help centre page and the in-app chat widget remain.

### Recommended approach for 3.6

1. **Help centre page** — Build a static `/help` or `/docs`-style page in the marketing layout with FAQs grouped by topic (Getting Started, Scanner, Banner, Billing, GDPR). Already have a `/docs` route — check if it's a stub or a real page first.

2. **In-app chat widget** — Crisp is free for small teams, easy to embed. Add `CRISP_WEBSITE_ID` env var, then inject the Crisp script in the dashboard layout's `<head>`. Show it only in the dashboard (not marketing pages).

---

## Phase completion as of 2026-04-08

| Phase | Status |
|-------|--------|
| Phase 1 — Launch Blockers | ✅ All P0/P1/P2 complete |
| 2.1 WordPress plugin | Code complete — needs WP testing + wordpress.org submission (manual) |
| 2.2 Vercel production deployment | Manual — follow VERCEL_SETUP.md |
| 2.3 Google Search Console | Manual — follow LAUNCH-PLAN.md instructions |
| 2.4 REST API | ✅ Complete (GET /v1/websites, POST /v1/websites/:id/scan, GET /v1/scans/:id, GET /v1/policies, API key UI) |
| 2.5 E2E tests | Not started |
| 2.6 Scan error UX | Not started |
| 3.1 Team management | ✅ Complete |
| 3.2 CCPA scanner | ✅ Complete |
| 3.3 Automated scheduling | ✅ Complete |
| 3.4 Remediation guidance | ✅ Complete |
| 3.5 AI policy generation | ✅ Complete |
| 3.6 Support infrastructure | **⬅ START HERE — final phase** |

---

> **Phase 3.6 is the final development phase. There is no Phase 4.**

---

## Important: set ANTHROPIC_API_KEY in Vercel

Phase 3.5 (AI policy generation) requires `ANTHROPIC_API_KEY` to be set in Vercel environment variables. Without it, clicking "AI Policy" shows a clear error message — the app won't crash, but the feature won't work. Add it at:

**Vercel → Project → Settings → Environment Variables → ANTHROPIC_API_KEY**

Get your key at: https://console.anthropic.com/
