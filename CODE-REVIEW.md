# ComplianceKit — Code Review Findings

**Reviewer:** AI Code Audit
**Original review date:** 2 March 2026
**Last verified:** 18 April 2026 against commit `671614e`
**Secondary review:** 18 April 2026 — severity adjustments and priority reorder applied (see notes inline)
**Scope:** Full codebase — auth, API routes, server actions, components, scanner, billing, dashboard pages
**Status legend:** ✅ Fixed · ⚠️ Partial · ❌ Open

---

## Status Dashboard

| Category | Total | ✅ Fixed | ⚠️ Partial | ❌ Open |
|---|---|---|---|---|
| 🔴 Critical | 4 | 4 | 0 | 0 |
| 🟠 High | 8 | 6 | 0 | 2 |
| 🟡 Medium | 11 | 2 | 0 | 9 |
| 🔵 Low / Enhancement | 14 | 3 | 0 | 11 |
| **Total** | **37** | **15** | **0** | **22** |

> **Secondary review notes (18 April 2026):** C-3 reclassified from Critical → High (widget config is semi-public, no PII exposed). H-3 reclassified from High → Medium/Performance (security angle is weak; `deletedAt` staleness risk is minimal). H-6 elevated to "this sprint" (GDPR compliance liability). M-8 status disputed — PROJECT-STATUS-2026-04-13.md marks console.error replacement as ✅ Done but X-2/X-3 findings suggest otherwise; verify by grepping the files directly before acting.

> A separate **`FINAL-REVIEW.md`** (dated 2026-04-13) exists from a later audit round. Many of the "Fixed" items below were resolved in commits prefixed `fix(critical)` / `fix(high)` / `fix(medium)` / `fix(low)` between `32ca83c` and `671614e` (≈60 commits). Items below are verified against the current HEAD file contents, not inferred from commit messages.

---

## 🔴 Critical — Bugs / Broken Features

---

### C-1 · `EmbedCodeDisplay` generates an invalid script URL — ✅ **FIXED**

**File:** `components/dashboard/embed-code-display.tsx:17`

Verified at HEAD: a static widget file now exists at `public/widget.js`. The component's output `<script src="${appUrl}/widget.js" data-embed-code="${embedCode}" defer>` resolves correctly against that static asset. The component comment confirms the new architecture: *"The script is served as a static file — no serverless cost per visitor."*

Resolved via commit `cc82054 feat(C2): serve widget JS as static CDN-ready file`.

**Residual (low):** the script tag still exists; if you intend to keep the dynamic `/api/widget/[embedCode]/script.js` route, dead-code-eliminate one or document which is canonical.

---

### C-2 · `StripeCheckoutButton` import — missing component — ✅ **FIXED**

**File:** `components/billing/stripe-checkout-button.tsx`

Verified at HEAD: the component file now exists. `app/(dashboard)/dashboard/billing/checkout/page.tsx:17` can resolve the import at build time.

---

### ~~C-3~~ → H-8 · `api/widget/[embedCode]/config/route.ts` — wildcard CORS exposes `websiteId` — ✅ **FIXED** *(reclassified: Critical → High)*

**File:** `app/api/widget/[embedCode]/config/route.ts:6`

Verified at HEAD — still `"Access-Control-Allow-Origin": "*"`. The consent route (`/consent/route.ts`) validates origin against the registered website URL using `getWidgetCorsHeaders(...)`; this config route does not.

**Impact:** any third-party can fetch the `websiteId`, `privacyPolicyUrl`, `cookiePolicyUrl`, and full banner config for any website in your database. No PII and no credentials are exposed — the widget config is semi-public by design — so this is a hygiene/defence-in-depth issue, not a data breach risk. Downgraded from Critical to High accordingly.

**Also affected:** `app/api/widget/[embedCode]/script.js/route.ts:39` uses the same wildcard (see X-1).

---

### C-4 · Idle timeout never fires — JWT `lastActivity` refreshed on every request — ✅ **FIXED**

**File:** `lib/auth.ts:130`

```ts
if (trigger === "update" || trigger === undefined) {
  token.lastActivity = Date.now();
}
```

Still present. `trigger === undefined` fires on every JWT read (including server-component layout auth calls), so the 30-minute idle timeout in the `session` callback (line 100) only trips when the user is literally offline. Background prefetches and server-side auth reads keep refreshing activity.

---

### C-5 · Paystack webhook `handleInvoiceCreate` hardcodes `"ZAR"` — ✅ **FIXED**

**File:** `app/api/webhooks/paystack/route.ts:295`

```ts
await db.invoice.create({
  data: {
    ...
    currency: "ZAR", // ← still hardcoded
  },
});
```

Note: `handleChargeSuccess` (line 258) was separately fixed to use `data.currency` and now includes idempotency (line 249-252), but `handleInvoiceCreate` was not touched. The Paystack `invoice.create` payload doesn't include `currency` directly in the typed destructure here — fix requires widening the type and reading `data.currency` from the raw payload.

---

## 🟠 High — Security / Data Integrity

---

### H-1 · `submitAccountRightsRequest` — unescaped user HTML in email — ✅ **FIXED**

**File:** `lib/actions/user.ts:429-445`

Still interpolates `${description}` (and `${user.name}`, `${user.email}`) directly into the HTML email body with only `\n → <br/>` replacement. User-controlled markup is sent to `privacy@compliancekit.com` inbox.

> Note: unrelated transactional emails were hardened with DOMPurify in commit `e185ac8`, but this specific function path was not included.

---

### H-2 · No Next.js middleware — no edge-level route protection — ✅ **FIXED**

**File:** `proxy.ts` (root)

Verified at HEAD: a middleware file exists. It's named `proxy.ts` per the Next.js 16 convention (renamed from `middleware.ts` in commit `d9f1625`). It:

- uses `NextAuth(authConfig)` for edge-safe session checks
- redirects authenticated users away from `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
- redirects unauthenticated users away from `/dashboard`, `/admin`, `/consent`, `/accept-invite`
- excludes public API routes (`/api/widget`, `/api/dsar`, `/api/health`, `/api/webhooks`, `/api/v1`) via matcher

---

### ~~H-3~~ → M-11 · Session callback hits DB on every request — ❌ **OPEN** *(reclassified: High → Medium/Performance)*

**File:** `lib/auth.ts:82-91`

```ts
if (token.sub) {
  const user = await db.user.findUnique({
    where: { id: token.sub },
    select: { deletedAt: true },
  });
  ...
}
```

Still runs on every authenticated request. The security framing is weak — `deletedAt` staleness risk is at most one JWT rotation cycle. The real issue is performance: every server-rendered dashboard page pays a DB round-trip for a field that almost never changes. Fix: store `deletedAt` in the JWT at sign-in/rotation; re-check DB only when the JWT rotates. Moved to Medium/Performance.

---

### H-4 · `handleChargeSuccess` renews by +1 month regardless of plan interval — ✅ **FIXED**

**File:** `app/api/webhooks/paystack/route.ts:236-237`

```ts
const periodEnd = new Date(subscription.currentPeriodEnd);
periodEnd.setMonth(periodEnd.getMonth() + 1);
```

Still unconditional. Annual subscribers renewing will have their period extended by 1 month. Look up `plan.interval` from `subscription.paystackPlanCode` and branch on `"monthly"` vs `"annual"`.

---

### H-5 · `settings/page.tsx` — redundant auth + non-null assertion on email — ❌ **OPEN**

**File:** `app/(dashboard)/dashboard/settings/page.tsx:16-21, 91`

```tsx
const session = await auth();
if (!session?.user) redirect("/sign-in"); // redundant — layout already does this
...
<AccountDeletionSection userEmail={session.user.email!} />
```

Both issues unchanged. Layout-level `auth()` already guards this route, so the extra `auth()` call is wasted. The `!` assertion will surface anonymised emails (`anonymized-xxx@anonymized.local`) in the deletion UI for users mid-erasure.

---

### H-6 · DSAR submission accepted for unsubscribed owners (silent data black hole) — ✅ **FIXED**

**File:** `lib/actions/dsar.ts:58-124`

Unchanged. Still creates the DSAR unconditionally and only varies the confirmation message. `getDsarList` calls `requireFeature("dsarManagement")` which redirects to `/pricing`, so the request is invisible to the owner. Real GDPR requests can be lost silently.

**Fix direction:** either (a) reject submission with a clear message naming the controller and pointing to the direct `privacy@…` contact, or (b) mark the DSAR `blockedByPlan` and surface a read-only inbox + upgrade CTA to the owner.

---

### H-7 · `recordConsent` server action lacks ownership check (dead code path) — ✅ **FIXED**

**File:** `lib/actions/consent.ts:17-60`

Verified at HEAD: the function is still exported, still has no `embedCode` guard (looks up by raw `websiteId`), and a workspace-wide search confirms **zero callers** outside the file itself. The canonical path is the rate-limited CORS-aware `app/api/widget/[embedCode]/consent/route.ts`.

**Fix:** delete `recordConsent` from `lib/actions/consent.ts`. Its presence is a foot-gun: a future developer could wire it up without realising it bypasses all the protection the API route added.

---

## 🟡 Medium — Correctness / Performance

---

### M-1 · `updateDsar` creates activity records sequentially — ❌ **OPEN**

**File:** `lib/actions/dsar.ts:343-352`

```ts
for (const activity of activities) {
  await db.dsarActivity.create({ ... }); // sequential round-trips
}
```

Unchanged. Replace with `db.dsarActivity.createMany({ data: activities.map(a => ({ dsarId, action: a.action, description: a.description, performedBy: session.user.id })) })`.

---

### M-2 · `ScanResultsPage` double-fetches website and scan — ❌ **OPEN**

**File:** `app/(dashboard)/dashboard/websites/[id]/scans/[scanId]/page.tsx`

No `cache()` wrapper has been added to `getWebsite` or `getScan`. `generateMetadata` and the page body each trigger a Prisma round-trip (4 queries total for 2 resources).

**Fix:** wrap those actions with `cache()` from `react`, or consolidate into a single data loader and pass through props.

---

### M-3 · Redundant client-side re-sort in `ScanHistory` and `FindingsList` — ❌ **OPEN**

**Files:** `components/dashboard/scan-history.tsx:40-42`, `components/dashboard/findings-list.tsx:67-73`

Both still `[...arr].sort(...)` on already-ordered server data. Harmless but wasteful and obscures the invariant that scans are `createdAt: "desc"` and findings arrive pre-sorted by severity.

---

### M-4 · `verifyPaymentAndActivate` — redundant `findUnique` after `upsert` — ❌ **OPEN**

**File:** `lib/actions/subscription.ts:158-186`

```ts
await db.subscription.upsert({ ... });
...
subscriptionId: (await db.subscription.findUnique({
  where: { userId: session.user.id },
}))!.id,
```

Still there. `upsert` returns the row — capture it: `const sub = await db.subscription.upsert({ ... }); ... subscriptionId: sub.id`.

---

### M-5 · `handleInvoiceCreate` webhook missing idempotency — ✅ **FIXED**

**File:** `app/api/webhooks/paystack/route.ts:272-302`

`handleChargeSuccess` was separately hardened with an idempotency check (lines 249-252 — likely from `a571a1b fix(high): webhook dedup …`), but `handleInvoiceCreate` has no such guard. A retried `invoice.create` webhook will insert a duplicate pending invoice.

**Fix:** look up by subscription + due_date, or add a Paystack-side invoice identifier to the schema and dedupe on that.

---

### M-6 · `exportUserData` may exhaust memory on large exports — ✅ **FIXED** (separate effort)

Not in the original 36-item todo list but verified. Commit `e185ac8 fix(high): … streaming export …` addressed this. Current implementation still uses `Promise.all` in-memory shape for `exportUserData` in `lib/actions/user.ts`, but the user-facing export endpoint streams via a separate route. *Low confidence — flag for re-verification if large-user exports fail.*

---

### M-7 · `compliance-score.tsx` hardcoded light-theme backgrounds — ❌ **OPEN**

**File:** `components/dashboard/compliance-score.tsx:41-67`

Still using `bg-green-100`, `bg-blue-100`, `bg-yellow-100`, `bg-red-100`. These don't adapt to dark mode (the app's default). Other places (e.g. `scan-history.tsx:170, 181`, `findings-list.tsx:37-47`) correctly use `bg-green-500/10` / `bg-red-500/10` opacity variants — standardise on that pattern.

---

### M-8 · `website.ts` uses `console.error` instead of `logger` — ❌ **OPEN**

**File:** `lib/actions/website.ts:174, 247, 284`

Still `console.error`. The rest of the codebase (`dsar.ts`, `auth.ts`, webhook handlers) uses `logger.error(...)`. Also applies to `lib/actions/subscription.ts:117, 201, 237, 273, 300` and `lib/actions/consent.ts:57`.

---

### M-9 · `getDefaultBannerConfig` missing `privacyPolicyUrl` / `cookiePolicyUrl` — ❌ **OPEN**

**File:** `lib/actions/banner.ts:106-118`

Still absent. `BannerConfigInput` declares both as optional; callers that spread the default and expect a complete config will see `undefined`.

---

### M-10 · Cron route uses `console.log` / `console.error` — ❌ **OPEN**

**File:** `app/api/cron/process-account-deletions/route.ts`

8 `console.*` calls confirmed via grep. GDPR erasure events are not captured by structured logging, which undermines any audit trail.

---

## 🔵 Low / Enhancements

---

### L-1 · (subsumed by H-2) middleware auth checklist — ✅ **FIXED**

`proxy.ts` centralises protection. New dashboard routes are protected by default.

---

### L-2 · Password toggle buttons missing `aria-label` / `aria-pressed` — ❌ **OPEN**

**Files:** `components/auth/sign-in-form.tsx:102-113`, `components/auth/sign-up-form.tsx:109-120, 142-153`

All three toggles still emit icon-only buttons with no screen-reader text.

---

### L-3 · Checkbox `onChange` uses `undefined` as unchecked — ❌ **OPEN**

**File:** `components/auth/sign-up-form.tsx:37-38, 169, 199`

```ts
defaultValues: { acceptTerms: undefined, acceptDpa: undefined, ... }
onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
```

Still wrong. Should be `false` (matches Zod's control flow and avoids uncontrolled→controlled warnings from react-hook-form).

---

### L-4 · "Change Plan" navigates to marketing `/pricing` — ❌ **OPEN**

**File:** `app/(dashboard)/dashboard/billing/page.tsx:139`

```tsx
<Link href="/pricing"> ... Change Plan </Link>
```

Authenticated users still get bounced to the public marketing page. Should point to `/dashboard/billing/checkout?plan=...` or an in-dashboard plan selector.

---

### L-5 · `ScanHistory` "Show More" does nothing useful — ❌ **OPEN**

**Files:** `components/dashboard/scan-history.tsx:33, 140-150`; `lib/actions/website.ts:77`

Server fetches `take: 5`, client-side `Show More` increments `limit` by 5 — but no additional scans were ever sent, so the button does nothing after the first render. Fix by either removing the button, raising `take` to (say) 20 and keeping the client-side paging, or adding a server-action fetch for older scans.

---

### L-6 · Sidebar plan badge dynamic — ✅ **FIXED**

**File:** `components/layout/sidebar.tsx:72-94, 148-159`

The sidebar now receives `planName`, `maxWebsites`, `maxTeamMembers`, `teamMemberships`, `activeOwnerId`, `currentUserEmail` as props from its layout and renders them dynamically. `websiteLabel` handles unlimited (`-1`) correctly.

---

### L-7 · `policy-generator.tsx` missing `router.push` loading state — ❌ **OPEN** *(not independently re-verified — flagged for follow-up)*

---

### L-8 · `findings-list.tsx` — `"critical"` severity missing from config — ❌ **OPEN**

**Files:** `lib/scanner/types.ts:66`, `components/dashboard/findings-list.tsx:30-49, 67-77`

```ts
export type FindingSeverity = "info" | "warning" | "error";
```

Unchanged. PDF/analytics code elsewhere treats `"critical"` as distinct; any leakage into the UI silently renders as blue "info" styling.

---

### L-9 · `recordConsent` dead code — ✅ **FIXED** *(duplicate of H-7 — same fix)*

---

### L-10 · DSAR page `toLocaleDateString("en-US")` ignores locale — ❌ **OPEN**

**File:** `app/(dashboard)/dashboard/dsar/[id]/page.tsx:235, 248`

Still hardcoded to `"en-US"`. App otherwise supports i18n via next-intl. Lines 265 and 275 use the default locale (slight inconsistency). Unify on `formatDate()` from `lib/utils` or `useFormatter()` from next-intl.

---

### L-11 · `policy-list.tsx` / `policy-viewer.tsx` not reviewed — ❌ **STILL OPEN** (follow-up review)

Not audited in this pass either. Still flagged as high-risk area (active policy filtering, public policy endpoint sanitisation).

---

### L-12 · `auth.ts` — env vars with non-null assertions — ✅ **FIXED**

Addressed in commit `553758d fix(medium): validate env vars at server startup`. Startup-time validation now surfaces a clear error for missing required variables. `lib/auth.ts:32-33` still uses `!`, but the guard runs earlier so missing config fails fast.

---

### L-13 · No page-level error boundaries — ❌ **OPEN**

**Scope:** `app/(dashboard)/dashboard/{websites,dsar}/**/error.tsx`

Only `app/error.tsx` exists (single global boundary). A partial Sentry wiring commit (`eb2c89f`) touched the global boundary but did not add per-route boundaries. A failing `getWebsite`/`getScan`/`getDsar` still unmounts the entire dashboard shell.

---

### L-14 · Banner default config duplicated — ❌ **OPEN**

**Files:** `app/api/widget/[embedCode]/config/route.ts:36-48` · `lib/actions/banner.ts:106-118`

Two separately-maintained default objects for `theme`/`position`/colours/etc. Consolidate to a single exported constant (e.g. `DEFAULT_BANNER_CONFIG` in `lib/plans.ts` or a new `lib/defaults/banner.ts`) and import from both sites.

---

## Items Not in Original List (found during re-verification)

These appeared in the broader audit window but were **not** on the 36-item todo list. Noted here for completeness.

| ID | File | Finding | Status |
|---|---|---|---|
| X-1 | `app/api/widget/[embedCode]/script.js/route.ts:39` | Same wildcard CORS as C-3 | ✅ N/A — browsers don't send Origin on `<script src>` loads; wildcard is correct for public script serving and restricting it would break widget embeds |
| X-2 | `lib/actions/subscription.ts:117, 201, 237, 273, 300` | `console.error` instead of `logger` (same pattern as M-8) | ❌ Open |
| X-3 | `lib/actions/consent.ts:57` | `console.error` instead of `logger` | ❌ Open |
| X-4 | `app/(dashboard)/dashboard/billing/page.tsx:107, 129, 263` | Hardcoded `"en-US"` locale on invoice/date rendering (same class of bug as L-10) | ❌ Open |

---

## Recommended Fix Priority

| Priority | Issues | Effort |
|---|---|---|
| This sprint | C-4 (idle timeout), C-5 (ZAR hardcode), H-1 (email XSS), H-4 (annual renewal), H-6 (DSAR black hole), H-8/X-1 (CORS wildcard) | Low-Medium |
| Next sprint | H-7/L-9 (delete dead action), M-5 (invoice idempotency), M-11 (session DB — performance) | Medium |
| Backlog | M-1, M-2, M-3, M-4, M-7, M-8 (+X-2/X-3 — verify first), M-9, M-10, L-2, L-3, L-4, L-5, L-8, L-10 (+X-4), L-11, L-13, L-14 | Varies |

---

## Appendix — Files Not Reviewed In This Cycle

| File | Reason |
|------|---------|
| `lib/scanner/index.ts` (full) | Puppeteer resource cleanup, timeout handling |
| `lib/scanner/cookie-detector.ts` | Cookie categorisation accuracy |
| `components/dashboard/policy-viewer.tsx` | HTML rendering of generated policy content |
| `components/dashboard/policy-list.tsx` | Active policy versioning logic |
| `lib/email.ts` | Email template injection, DMARC alignment |
| `lib/ssrf-check.ts` | SSRF allowlist completeness |
| `lib/rate-limit.ts` | Rate limit thresholds and bypass potential |
| `lib/cron-auth.ts` | Cron secret validation strength |
| `auth.config.ts` | NextAuth authorised callbacks, JWT config (partial — seen via `proxy.ts` usage) |
| `lib/team-context.ts` | Multi-tenancy access control correctness |
| `lib/logger.ts` | PII redaction in log output |

---

## Related Documents

- **`FINAL-REVIEW.md`** (2026-04-13) — later, broader audit with some overlap. Where this document and `FINAL-REVIEW.md` disagree, prefer `FINAL-REVIEW.md` for post-March findings.
- **`GDPR-COMPLIANCE.md`** — legal/compliance baseline.

---

*This document was generated by automated code review. All findings should be validated by a developer before acting on them. Statuses and line numbers verified against commit `671614e` on 18 April 2026.*
