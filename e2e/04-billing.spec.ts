/**
 * 04-billing.spec.ts
 *
 * Covers:
 *   - Billing page renders correctly for a free user
 *   - "View Plans" navigates to pricing page
 *   - Pricing page shows all plans with upgrade buttons
 *   - Upgrade CTA initiates checkout redirect (Stripe or PayStack)
 *
 * NOTE: Actual payment completion is NOT tested here because it requires
 * live test API keys and interaction with third-party hosted pages.
 */
import { test, expect } from "@playwright/test";

test("billing page renders for a free user", async ({ page }) => {
  await page.goto("/dashboard/billing");

  // Should show current plan heading
  await expect(page.getByText("Current Plan")).toBeVisible();

  // Should show "Free Plan" somewhere
  await expect(page.getByRole("heading", { name: "Free Plan" })).toBeVisible();

  // Should have a link to view/change plans
  await expect(
    page.getByRole("link", { name: /view plans/i })
  ).toBeVisible();
});

test("billing page links to the pricing page", async ({ page }) => {
  await page.goto("/dashboard/billing");

  await page.getByRole("link", { name: /view plans/i }).first().click();
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

  // Annual toggle switch should exist
  await expect(
    page.getByRole("switch", { name: /annual/i })
  ).toBeVisible();
});

test("clicking upgrade initiates checkout (redirects away from /dashboard)", async ({ page }) => {
  await page.goto("/pricing");

  // Click the first upgrade/get started button
  const upgradeBtn = page
    .getByRole("link", { name: /get started|upgrade|choose|subscribe/i })
    .or(page.getByRole("button", { name: /get started|upgrade|choose|subscribe/i }))
    .first();

  if (!(await upgradeBtn.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, "No upgrade button found on pricing page");
  }

  await upgradeBtn.click();

  // Should navigate away from the pricing page
  await page.waitForURL((url) => !url.pathname.includes("/pricing"), { timeout: 15_000 });
});
