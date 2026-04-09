# Session Status — Pick up from here

## START HERE TOMORROW: Phase 2.5 — Debug E2E auth setup

**All Phase 3 items are complete.** Only Phase 2.5 (E2E tests) is partially done and blocked on one auth issue.

### The blocker (read this first)

The Playwright global-setup (`e2e/global-setup.ts` line 18) hangs for 60 seconds and then fails. The test suite is wired up correctly — **what fails is the initial sign-in against the test dev server**. All 26 tests show as "did not run" because the setup step never finishes.

Error shown in HTML report:
```
e2e\global-setup.ts:18:6 › authenticate
26 did not run
```

### What we know works

| Thing | Status |
|---|---|
| Playwright installed (`@playwright/test` v1.59.1) | ✅ |
| Chromium downloaded (`npx playwright install chromium`) | ✅ |
| All 6 spec files written (`e2e/01-signup.spec.ts` → `06-cancel-delete.spec.ts`) | ✅ |
| `playwright.config.ts` + `dotenv-cli` wiring | ✅ |
| Separate Supabase test database `compliancekit_test` created | ✅ |
| Prisma schema pushed to test DB (`prisma db push`) | ✅ |
| `.env.test` configured with test DB credentials | ✅ |
| Test user seeded directly in test DB via `scripts/seed-test-user.mjs` | ✅ (ran successfully: `Test user ready: e2e@test.local`) |
| Test dev server on port 3001 (`npm run dev:test`) | ✅ starts |

### What's broken

- `global-setup.ts` navigates to `/sign-in`, fills the form, clicks "Sign in" — then `waitForURL` for `/dashboard` or `/consent` **never fires**. The whole thing times out at 60s.
- We suspect Next.js is loading `.env.local` on top of `.env.test`, so the running dev server connects to the **production** database where the test user doesn't exist.
- User tested by renaming `.env.local` → same failure, so the `.env.local` override theory may be wrong.
- Was not yet verified: is the sign-in actually failing (test user credentials not matching), or is the redirect just not being detected?

### Where to start tomorrow

**Step 1 — isolate the problem.** Write a single minimal Playwright test that just does `page.goto('/sign-in')` and asserts the page title. No auth, no setup dependency. Run it with `npx playwright test --project=chromium --grep minimal`. If that passes, Playwright + dev server are fine and the problem is purely the auth flow.

**Step 2 — verify the test DB is actually being used.** Add a temporary `console.log(process.env.DATABASE_URL)` at the top of `lib/db.ts` and restart `npm run dev:test`. Confirm the terminal prints the Supabase test URL (`ejzcznfqzcdfhpyfaiko`), not the production one (`cqackltoemwpsugboyzp`).

**Step 3 — debug the sign-in itself manually.** Open `http://localhost:3001/sign-in` in a browser and try to log in with `e2e@test.local` / `E2eTest123!`. If it fails, the seed script's bcrypt hash isn't matching what NextAuth expects. If it succeeds, the Playwright selector (`page.getByLabel("Email")`) is what's broken.

**Step 4 — if sign-in fails manually,** check `lib/auth.ts` or wherever the credentials provider is defined. The seed script in `scripts/seed-test-user.mjs` hashes with `bcrypt.hash(password, 10)`. If NextAuth uses a different salt rounds or a different library, the hash won't verify.

### Files touched today (2026-04-09)

**Phase 3.6 (Crisp chat) — complete:**
- `components/layout/crisp-chat.tsx` (new)
- `app/(dashboard)/layout.tsx` (mounted `<CrispChat />`)
- `.env.example` (added `NEXT_PUBLIC_CRISP_WEBSITE_ID`)
- `VERCEL_SETUP.md` (new §10)

**Phase 2.5 (E2E tests) — infrastructure in place, auth debugging deferred:**
- `playwright.config.ts` (new)
- `e2e/global-setup.ts` (new — **this is where the bug lives**)
- `e2e/helpers/auth.ts` (new)
- `e2e/01-signup.spec.ts` through `e2e/06-cancel-delete.spec.ts` (new)
- `e2e/.auth/.gitkeep` (new)
- `scripts/seed-test-user.mjs` (new — seeds test user, **confirmed working**)
- `.env.test.example` (new)
- `.env.test` (user-created, has working DB creds)
- `package.json` — added scripts: `dev:test`, `test:e2e`, `test:e2e:ui`, `test:e2e:report`, `test:e2e:seed`; added devDeps `@playwright/test`, `dotenv-cli`
- `.gitignore` — ignores `/playwright-report`, `/test-results`, `e2e/.auth/user.json`, `.env.test`
- `E2E-SETUP.md` (new — setup instructions)

**Also fixed a broken `.env.local`** — user reported lines had been deleted. Restored `DATABASE_URL` and `DIRECT_URL` using the production project ref `cqackltoemwpsugboyzp`. Removed a stray "in my current .env.local" line that was at the top of the file.

### How to resume E2E work tomorrow

```bash
# CMD 1 — start the test dev server (uses .env.test + port 3001)
npm run dev:test

# CMD 2 — run the tests
npm run test:e2e

# If it fails, see the error:
npx playwright show-report
```

The test user is already seeded in the Supabase test database, so `npm run test:e2e:seed` doesn't need to run again unless the DB is reset.

---

## Phase completion as of 2026-04-09

| Phase | Status |
|-------|--------|
| Phase 1 — Launch Blockers | ✅ All P0/P1/P2 complete |
| 2.1 WordPress plugin | Code complete — needs WP testing + wordpress.org submission (manual) |
| 2.2 Vercel production deployment | Manual — follow VERCEL_SETUP.md |
| 2.3 Google Search Console | Manual — follow LAUNCH-PLAN.md instructions |
| 2.4 REST API | ✅ Complete |
| **2.5 E2E tests** | **⬅ STUCK — infrastructure done, auth debugging needed** |
| 2.6 Scan error UX | ✅ Complete (verified 2026-04-09) |
| 3.1 Team management | ✅ Complete |
| 3.2 CCPA scanner | ✅ Complete |
| 3.3 Automated scheduling | ✅ Complete |
| 3.4 Remediation guidance | ✅ Complete |
| 3.5 AI policy generation | ✅ Complete |
| 3.6 Support infrastructure | ✅ Complete (2026-04-09) |
| **Phase 4** | **Not started** |

---

## Important: set ANTHROPIC_API_KEY in Vercel

Phase 3.5 (AI policy generation) requires `ANTHROPIC_API_KEY` to be set in Vercel environment variables. Without it, clicking "AI Policy" shows a clear error message — the app won't crash, but the feature won't work. Add it at:

**Vercel → Project → Settings → Environment Variables → ANTHROPIC_API_KEY**

Get your key at: https://console.anthropic.com/
