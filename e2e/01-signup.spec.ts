/**
 * 01-signup.spec.ts
 *
 * Happy-path signup flow using a fresh timestamped email so it never
 * collides with the persistent E2E test account.
 *
 * Covers: sign-up form → dashboard redirect (LAUNCH-PLAN 2.5 — signup flow)
 */
import { test, expect } from "@playwright/test";

// This spec creates its own fresh context — no storageState needed
test.use({ storageState: { cookies: [], origins: [] } });

test("user can sign up with email and land on the dashboard", async ({ page }) => {
  const email = `e2e+${Date.now()}@test.local`;
  const password = "E2eTest123!";

  await page.goto("/sign-up");

  // Form fields
  await page.getByLabel("Name").fill("E2E Signup User");
  await page.getByLabel("Email").fill(email);
  await page.getByPlaceholder("••••••••").nth(0).fill(password);
  await page.getByPlaceholder("••••••••").nth(1).fill(password);

  // Required consent checkboxes
  await page.getByLabel(/Terms of Service/).check();
  await page.getByLabel(/Data Processing Agreement/).check();

  await page.getByRole("button", { name: "Create Account" }).click();

  // Should land in the dashboard after successful signup
  await page.waitForURL("**/dashboard**", { timeout: 20_000 });
  await expect(page).toHaveURL(/dashboard/);
});

test("sign-up form shows validation errors for empty submission", async ({ page }) => {
  await page.goto("/sign-up");
  await page.getByRole("button", { name: "Create Account" }).click();

  // At least one error message should appear
  await expect(page.locator("[aria-live='polite'], [role='alert'], .text-destructive").first()).toBeVisible();
});

test("sign-up form rejects mismatched passwords", async ({ page }) => {
  await page.goto("/sign-up");

  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill(`mismatch+${Date.now()}@test.local`);
  await page.getByPlaceholder("••••••••").nth(0).fill("Password123!");
  await page.getByPlaceholder("••••••••").nth(1).fill("DifferentPass123!");
  await page.getByLabel(/Terms of Service/).check();
  await page.getByLabel(/Data Processing Agreement/).check();

  await page.getByRole("button", { name: "Create Account" }).click();

  // Should stay on sign-up and show a password mismatch error
  await expect(page).toHaveURL(/sign-up/);
});
