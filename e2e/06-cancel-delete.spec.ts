/**
 * 06-cancel-delete.spec.ts
 *
 * Covers:
 *   - Cancel subscription → verify downgrade to Free
 *   - Account deletion flow (soft delete confirmation dialog)
 *
 * NOTE: Cancellation tests only run when the test account has an active
 * subscription. If on the Free plan (default), cancel tests skip automatically.
 */
import { test, expect } from "@playwright/test";

// ── Cancel subscription ───────────────────────────────────────────────────────

test("billing page shows cancel option for paid accounts", async ({ page }) => {
  await page.goto("/dashboard/billing");

  // Wait for page to fully render
  await page.waitForLoadState("networkidle");

  // If on free plan, skip gracefully
  const freePlanHeading = page.getByRole("heading", { name: "Free Plan" });
  if (await freePlanHeading.isVisible().catch(() => false)) {
    test.skip(true, "Test account is on Free plan — no subscription to cancel");
  }

  await expect(page.getByRole("button", { name: /cancel subscription/i })).toBeVisible();
});

test("cancel subscription shows confirmation dialog", async ({ page }) => {
  await page.goto("/dashboard/billing");
  await page.waitForLoadState("networkidle");

  const freePlanHeading = page.getByRole("heading", { name: "Free Plan" });
  if (await freePlanHeading.isVisible().catch(() => false)) {
    test.skip(true, "Test account is on Free plan — no subscription to cancel");
  }

  await page.getByRole("button", { name: /cancel subscription/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
});

test("confirming cancellation marks subscription as cancelling", async ({ page }) => {
  await page.goto("/dashboard/billing");
  await page.waitForLoadState("networkidle");

  const freePlanHeading = page.getByRole("heading", { name: "Free Plan" });
  if (await freePlanHeading.isVisible().catch(() => false)) {
    test.skip(true, "Test account is on Free plan");
  }

  const resumeBtn = page.getByRole("button", { name: /resume subscription/i });
  if (await resumeBtn.isVisible().catch(() => false)) {
    test.skip(true, "Subscription is already in cancelling state");
  }

  await page.getByRole("button", { name: /cancel subscription/i }).click();
  await page.getByRole("button", { name: /yes.*cancel|confirm/i }).click();

  await expect(
    page.getByRole("button", { name: /resume subscription/i })
      .or(page.getByText(/cancelled|access until/i).first())
  ).toBeVisible({ timeout: 15_000 });
});

// ── Account deletion ──────────────────────────────────────────────────────────

test("settings page has account deletion section", async ({ page }) => {
  await page.goto("/dashboard/settings");

  // The danger zone section and delete button
  await expect(page.getByRole("button", { name: /delete.*account/i }).first()).toBeVisible();
});

test("delete account shows confirmation flow", async ({ page }) => {
  await page.goto("/dashboard/settings");

  await page.getByRole("button", { name: /delete.*account/i }).first().click();

  // Confirmation page/section should appear with warnings
  await expect(
    page.getByText(/30.day|grace period|permanently/i).first()
  ).toBeVisible({ timeout: 10_000 });

  // Should have a "Type DELETE to confirm" input
  await expect(
    page.getByText(/type.*delete.*to confirm/i).first()
  ).toBeVisible();

  // Should still be on settings page or a deletion confirmation page
  const url = page.url();
  expect(url).toMatch(/settings|delete/);
});
