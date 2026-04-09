# ComplianceKit — Vercel & Production Setup Checklist

> This file collects every action that must be completed in Vercel (or linked external services)
> before the app is production-ready. Items are added here whenever a code change requires a
> corresponding infrastructure or environment variable change that cannot be done in code.
>
> Work through this top to bottom before onboarding the first paying customer.

---

## STATUS OVERVIEW

| # | Item | Done? |
|---|------|-------|
| 1 | Core environment variables | [ ] |
| 2 | Google OAuth credentials | [ ] |
| 3 | Resend email configuration | [ ] |
| 4 | Database — two connection strings (C3) | [ ] |
| 5 | Paystack — live keys + three plan codes | [ ] |
| 6 | Cron secret (C4) | [ ] |
| 7 | Security alert email (F2) | [ ] |
| 8 | Sentry error tracking (F1) | [ ] |
| 9 | Uptime monitoring (F3) | [ ] |
| 10 | Crisp chat widget (3.6) | [ ] |

---

## 1. Core Environment Variables

Add all of the following to **Vercel → Project → Settings → Environment Variables**.
Set scope to **Production** (and Preview if you want staging to work too).

| Variable | Value |
|----------|-------|
| `NEXTAUTH_SECRET` | Random 32-byte base64 string. Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your production domain, e.g. `https://compliancekit.app` |
| `NEXT_PUBLIC_APP_URL` | Same as above — used in widget embed snippets and email links |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | e.g. `support@compliancekit.app` |
| `NEXT_PUBLIC_PRIVACY_EMAIL` | e.g. `privacy@compliancekit.app` |

---

## 2. Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add Authorised redirect URI: `https://yourdomain.com/api/auth/callback/google`
4. Add to Vercel:

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |

---

## 3. Resend Email Configuration

1. Create account at [resend.com](https://resend.com)
2. Verify your sending domain (add DNS records Resend gives you)
3. Create an API key
4. Add to Vercel:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | From Resend dashboard |
| `EMAIL_FROM` | e.g. `ComplianceKit <noreply@compliancekit.app>` — must match your verified domain |

---

## 4. Database — Two Connection Strings (added in C3)

**Why two URLs?** PgBouncer (the connection pooler) runs in transaction mode and cannot handle
the persistent connections that Prisma migrations require. Runtime queries go through the pooler;
migrations bypass it via the direct URL.

### Step-by-step (Neon)

1. Go to your Neon project → **Connection Details**
2. Copy the **Pooled connection** string (shows port 6432 or has `-pooler` in hostname) → `DATABASE_URL`
3. Copy the **Direct connection** string (standard port 5432) → `DIRECT_URL`

### Step-by-step (Supabase)

1. Go to your Supabase project → **Settings → Database**
2. Under **Connection pooling**, copy the connection string (port 6543) → `DATABASE_URL`
3. Under **Connection string** (not pooling), copy the string (port 5432) → `DIRECT_URL`

### Add to Vercel

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Pooled connection string — used by the app at runtime |
| `DIRECT_URL` | Direct connection string — used by Prisma migrations only |

> No redeployment required after setting these — Vercel injects them at the next cold start.

---

## 5. Paystack — Live Keys + Plan Codes

### Step 1: Get your live API keys
1. Go to [Paystack Dashboard](https://dashboard.paystack.com) → Settings → API Keys & Webhooks
2. Switch from **Test** to **Live**
3. Copy Secret Key and Public Key

### Step 2: Create the three subscription plans in Paystack
Go to **Products → Plans → Create Plan** and create these three:

| Plan name | Amount | Interval | Notes |
|-----------|--------|----------|-------|
| Starter | R 299 | Monthly | |
| Professional | R 799 | Monthly | |
| Enterprise | R 1,999 | Monthly | |

After creating each plan, copy its **Plan Code** (format: `PLN_xxxxxxxxxx`).

### Step 3: Configure webhook
1. In Paystack → Settings → API Keys & Webhooks → Webhook URL
2. Set to: `https://yourdomain.com/api/webhooks/paystack`
3. Copy the webhook secret

### Add to Vercel

| Variable | Value |
|----------|-------|
| `PAYSTACK_SECRET_KEY` | Live secret key (`sk_live_...`) |
| `PAYSTACK_PUBLIC_KEY` | Live public key (`pk_live_...`) |
| `PAYSTACK_WEBHOOK_SECRET` | Webhook secret from Paystack settings |
| `PAYSTACK_STARTER_PLAN_CODE` | Plan code for Starter (e.g. `PLN_abc123`) |
| `PAYSTACK_PROFESSIONAL_PLAN_CODE` | Plan code for Professional |
| `PAYSTACK_ENTERPRISE_PLAN_CODE` | Plan code for Enterprise |

---

## 6. Cron Secret (added in C4)

The consent archival cron (`/api/cron/archive-consent`) and account deletion cron
(`/api/cron/process-account-deletions`) are both secured with a bearer token.
Without this set, neither cron will run — consent records will never be archived.

1. Generate a random secret: `openssl rand -base64 32`
2. Add to Vercel:

| Variable | Value |
|----------|-------|
| `CRON_SECRET` | Your generated secret |

> The cron schedule is already configured in `vercel.json`:
> - Account deletions: 02:00 UTC daily
> - Consent archival: 03:00 UTC daily
>
> Vercel runs these automatically — no further setup needed once the secret is set.

---

## 7. Security Alert Email (added in F2)

Critical security events (account lockouts, CSRF detected, SQL injection attempts, XSS attempts,
unauthorised access, rate-limit DB errors) now send an email alert automatically.

Set the inbox where you want these alerts delivered — ideally your personal email or a dedicated
ops inbox, not a shared support queue.

| Variable | Value |
|----------|-------|
| `SECURITY_ALERT_EMAIL` | e.g. `you@yourdomain.com` — your personal or ops inbox |

> If not set, alerts fall back to `NEXT_PUBLIC_SUPPORT_EMAIL`.
> The alert email is fire-and-forget — a delivery failure will never break a user request.

---

## 8. Sentry Error Tracking (added in F1)

1. Create a project at [sentry.io](https://sentry.io) — choose **Next.js** as the platform
2. Copy the **DSN** from Project Settings → Client Keys (DSN)
3. Generate an auth token at Account Settings → Auth Tokens with scopes: `project:read`, `project:releases`, `org:read`
4. Add to Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SENTRY_DSN` | DSN from Sentry project settings (starts with `https://...@...ingest.sentry.io/...`) |
| `SENTRY_AUTH_TOKEN` | Auth token — used during build to upload source maps |
| `SENTRY_ORG` | Your Sentry organisation slug (visible in Sentry URL: `sentry.io/organizations/<slug>`) |
| `SENTRY_PROJECT` | Your Sentry project slug |

> `NEXT_PUBLIC_SENTRY_DSN` is the only variable needed at runtime. The others are build-time only (source map upload).
> Without `SENTRY_AUTH_TOKEN`, the build still succeeds — source maps just won't be uploaded (stack traces will be minified).

---

## 9. Uptime Monitoring (F3)

A `/api/health` endpoint is now in the codebase (returns `{"status":"ok"}`, no DB hit).
External service configuration only — no further code changes needed.

### Step 1: Sign up
Go to [UptimeRobot](https://uptimerobot.com) and create a free account (free tier: 50 monitors, 5-minute intervals).

### Step 2: Add alert contact
1. Go to **My Settings → Alert Contacts → Add Alert Contact**
2. Add your email (or Slack via webhook)
3. Confirm the email verification

### Step 3: Create monitors
Go to **Dashboard → Add New Monitor** and create one HTTP monitor for each URL below:

| Monitor name | URL | Expected status |
|--------------|-----|-----------------|
| ComplianceKit — App | `https://yourdomain.com` | 200 |
| ComplianceKit — Health API | `https://yourdomain.com/api/health` | 200 |
| ComplianceKit — Widget | `https://yourdomain.com/widget.js` | 200 |
| ComplianceKit — Consent API | `https://yourdomain.com/api/widget/health` | 404 (confirms route is reachable) |

Settings for each monitor:
- **Monitoring Interval:** 5 minutes
- **Alert Contacts:** the contact you created in Step 2

### Step 4: Test
Click **Test** on each monitor. You should see a green "Online" status within a few minutes.

> Mark this item done once all four monitors show "Online" and you receive a test alert email.

---

## 10. Crisp Chat Widget (3.6)

Crisp is the in-app support chat shown to logged-in users inside the dashboard. It is free for small teams.

1. Sign up at [crisp.chat](https://crisp.chat) — create a new workspace for ComplianceKit
2. Go to **Dashboard → Settings → Website Settings → Setup Instructions**
3. Copy the **Website ID** (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
4. Add to Vercel:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_CRISP_WEBSITE_ID` | Your Crisp Website ID |

> Leave the variable empty (or unset) to disable the widget entirely — the app will not show a chat bubble.
> The widget is only injected on dashboard pages, not on marketing pages.

---

## Notes

- All env vars must be set **before** the first deploy or the app will start with missing config.
- After adding env vars in Vercel, trigger a redeployment (or wait for next push) for them to take effect — except `DATABASE_URL`/`DIRECT_URL` which take effect at next cold start.
- `DIRECT_URL` is optional in local development (Prisma falls back to `DATABASE_URL`). It is required in production when `DATABASE_URL` points to a pooler.

---

*Last updated: 2026-03-06 (F1 Sentry added) | Cross-reference: AUDIT.md (full issue list), PROGRESS.md (implementation status)*
