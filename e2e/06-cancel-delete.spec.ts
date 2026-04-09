/**
 * 06-cancel-delete.spec.ts
 *
 * Covers:
 *   - Cancel subscription → verify downgrade to Free
 *   - Account deletion flow (soft delete confirmation dialog)
 *
 * NOTE: Cancellation tests only run when the test account has an active
 * subscription. If the test account is on the Free plan (the default for
 * a freshly created account), the cancel tests will be skipped automatically.
 *
 * To test with a subscription:
 *   1. Manually subscribe the E2E test account to a paid plan via PayStack/Stripe test mode
 *   2. Re-run the suite
 */
import { test, expect } from "@playwright/test";

// ── Cancel subscription ───────────────────────────────────────────────────────

test("billing page shows cancel option for paid accounts", async ({ page }) => {
  await page.goto("/dashboard/billing");

  const cancelBtn = page.getByRole("button", { name: /cancel subscription/i });
  const freeMessage = page.getByText(/free plan/i);

  // If on free plan, skip gracefully
  if (await freeMessage.isVisible()) {
    test.skip(true, "Test account is on Free plan — no subscription to cancel");
  }

  await expect(cancelBtn).toBeVisible();
});

test("cancel subscription shows confirmation dialog", async ({ page }) => {
  await page.goto("/dashboard/billing");

  const cancelBtn = page.getByRole("button", { name: /cancel subscription/i });
  const freeMessage = page.getByText(/free plan/i);

  if (await freeMessage.isVisible()) {
    test.skip(true, "Test account is on Free plan — no subscription to cancel");
  }

  await cancelBtn.click();

  // Confirmation dialog should appear
  await expect(
    page.getByRole("dialog").or(page.getByText(/cancel subscription\?/i))
  ).toBeVisible();

  // Should mention keeping access until period end
  await expect(page.getByText(/until.*end of.*billing|retain access/i)).toBeVisible();

  // Dismiss without confirming
  const dismissBtn = page
    .getByRole("button", { name: /keep.*subscription|no|cancel$/i })
    .first();
  if (await dismissBtn.isVisible()) {
    await dismissBtn.click();
  } else {
    await page.keyboard.press("Escape");
  }
});

test("confirming cancellation marks subscription as cancelling", async ({ page }) => {
  await page.goto("/dashboard/billing");

  const freeMessage = page.getByText(/free plan/i);
  if (await freeMessage.isVisible()) {
    test.skip(true, "Test account is on Free plan");
  }

  // Check if already in cancelling state (cancelAtPeriodEnd)
  const resumeBtn = page.getByRole("button", { name: /resume subscription/i });
  if (await resumeBtn.isVisible()) {
    test.skip(true, "Subscription is already in cancelling state");
  }

  await page.getByRole("button", { name: /cancel subscription/i }).click();

  // Confirm in the dialog
  await page.getByRole("button", { name: /yes.*cancel|confirm/i }).click();

  // After cancellation: billing page should now show "Resume Subscription"
  await expect(
    page.getByRole("button", { name: /resume subscription/i })
      .or(page.getByText(/subscription.*cancelled|access until/i))
  ).toBeVisible({ timeout: 15_000 });
});

// ── Account deletion ──────────────────────────────────────────────────────────

test("settings page has account deletion section", async ({ page }) => {
  await page.goto("/dashboard/settings");

  // The danger zone / delete account section
  await expect(
    page.getByRole("button", { name: /delete.*account/i })
      .or(page.getByText(/delete.*account|danger zone/i))
  ).toBeVisible();
});

test("delete account shows confirmation dialog and does not delete on dismiss", async ({ page }) => {
  await page.goto("/dashboard/settings");

  const deleteBtn = page.getByRole("button", { name: /delete.*account/i }).first();
  await deleteBtn.click();

  // Confirmation dialog should appear
  await expect(page.getByRole("dialog")).toBeVisible();

  // It should warn about permanent deletion / 30-day window
  await expect(
    page.getByText(/permanently deleted|30.day|cannot be undone/i)
  ).toBeVisible();

  // Dismiss without deleting
  const cancelBtn = page
    .getByRole("button", { name: /cancel|keep.*account|no/i })
    .first();
  if (await cancelBtn.isVisible()) {
    await cancelBtn.click();
  } else {
    await page.keyboard.press("Escape");
  }

  // Should still be on settings page
  await expect(page).toHaveURL(/settings/);
});
