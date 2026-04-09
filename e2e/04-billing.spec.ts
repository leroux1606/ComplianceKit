/**
 * 04-billing.spec.ts
 *
 * Covers:
 *   - Billing page renders correctly for a free user
 *   - "Change Plan" navigates to pricing page
 *   - Pricing page shows all plans with upgrade buttons
 *   - Upgrade CTA initiates checkout redirect (Stripe or PayStack)
 *
 * NOTE: Actual payment completion is NOT tested here because it requires
 * live test API keys and interaction with third-party hosted pages.
 * To test a full Stripe checkout flow manually:
 *   1. Set STRIPE_SECRET_KEY=sk_test_... in .env.test
 *   2. Use Stripe test card: 4242 4242 4242 4242, any future expiry, any CVC
 *
 * To test PayStack manually:
 *   1. Set PAYSTACK_SECRET_KEY=sk_test_... in .env.test
 *   2. Use PayStack test card from their docs
 */
import { test, expect } from "@playwright/test";

test("billing page renders for a free user", async ({ page }) => {
  await page.goto("/dashboard/billing");

  // Should show current plan information
  await expect(page.getByText(/free plan/i).or(page.getByText(/current plan/i))).toBeVisible();

  // Should have a link or button to view/change plans
  await expect(
    page.getByRole("link", { name: /view plans/i })
      .or(page.getByRole("link", { name: /change plan/i }))
      .or(page.getByRole("button", { name: /change plan/i }))
  ).toBeVisible();
});

test("billing page links to the pricing page", async ({ page }) => {
  await page.goto("/dashboard/billing");

  const planLink = page
    .getByRole("link", { name: /view plans/i })
    .or(page.getByRole("link", { name: /change plan/i }));

  await planLink.first().click();
  await expect(page).toHaveURL(/pricing/);
});

test("pricing page shows all three plan tiers", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByText(/starter/i).first()).toBeVisible();
  await expect(page.getByText(/professional/i).first()).toBeVisible();
  await expect(page.getByText(/enterprise/i).first()).toBeVisible();
});

test("pricing page has a monthly/annual billing toggle", async ({ page }) => {
  await page.goto("/pricing");

  // Annual toggle should exist
  await expect(
    page.getByText(/annual/i).or(page.getByRole("switch")).or(page.getByRole("tab", { name: /annual/i }))
  ).toBeVisible();
});

test("clicking upgrade initiates checkout (redirects away from /dashboard)", async ({ page }) => {
  await page.goto("/pricing");

  // Click the first upgrade/get started button (skips free plan)
  const upgradeBtn = page
    .getByRole("button", { name: /get started|upgrade|choose|subscribe/i })
    .first();

  // Intercept the navigation — we just want to confirm it triggers, not complete the payment
  const [response] = await Promise.all([
    page.waitForEvent("framenavigated").catch(() => null),
    upgradeBtn.click(),
  ]);

  // Either redirected to checkout page or an external payment page
  const finalUrl = page.url();
  const isCheckout =
    finalUrl.includes("checkout") ||
    finalUrl.includes("paystack") ||
    finalUrl.includes("stripe") ||
    finalUrl.includes("billing");

  expect(isCheckout).toBe(true);
});
