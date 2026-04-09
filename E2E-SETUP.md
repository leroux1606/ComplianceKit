# E2E Test Setup

---

## 1. Install Playwright's Chromium browser

```bash
npx playwright install chromium
```

---

## 2. Create a test database

Create a separate Postgres database so the tests don't touch your real data.

```bash
createdb compliancekit_test
```

Push the schema to it:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/compliancekit_test" npx prisma db push
```

---

## 3. Set up the test env file

```bash
cp .env.test.example .env.test
```

Open `.env.test` and set at minimum:

| Variable | What to set |
|---|---|
| `DATABASE_URL` | Point to `compliancekit_test` (the test DB from step 2) |
| `AUTH_SECRET` | Any 32+ character random string |
| `E2E_TEST_EMAIL` | e.g. `e2e@test.local` |
| `E2E_TEST_PASSWORD` | e.g. `E2eTest123!` |

Everything else can stay blank. Emails print to the terminal in dev mode — no `RESEND_API_KEY` needed.

---

## 4. Run the tests

```bash
npm run test:e2e
```

The dev server starts automatically. The first run creates the test account.

Interactive UI:

```bash
npm run test:e2e:ui
```

HTML report after a run:

```bash
npm run test:e2e:report
```

---

## 5. Billing tests (optional)

By default the billing tests only go as far as the pricing page and checkout redirect — no real payment is made.

To test a full Stripe checkout:

1. Set `STRIPE_SECRET_KEY=sk_test_...` and the other Stripe vars in `.env.test`
2. Use test card: **4242 4242 4242 4242** · any future expiry · any CVC

To test cancel/resume, the test account needs an active subscription first. Subscribe it manually via the pricing page with the test card above, then re-run.

---

## 6. What each test does

| File | What it does | Notes |
|---|---|---|
| `01-signup` | Creates a fresh account each run | Fast (~5s) |
| `02-website-scan` | Adds a website + runs a real scan against `example.com` | Slow (30–60s) |
| `03-policies` | Generates template cookie + privacy policy | Needs a website from 02 |
| `04-billing` | Billing page, pricing page, upgrade CTA | No real payment |
| `05-dsar` | Submits DSAR as visitor, owner completes + rejects | Needs a website from 02 |
| `06-cancel-delete` | Cancel dialog + delete account dialog | Cancel skips if Free plan |

---

## Troubleshooting

**Sign-in loop in global-setup** — check that `DATABASE_URL` in `.env.test` points to the test DB and that `prisma db push` was run against it (step 2).

**Scan test times out** — increase `test.setTimeout` in `02-website-scan.spec.ts` (currently 90s).
