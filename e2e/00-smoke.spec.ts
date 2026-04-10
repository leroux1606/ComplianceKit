import { test, expect } from "@playwright/test";

/**
 * Minimal smoke test — verifies Playwright can talk to the dev server
 * and the sign-in page renders. No auth dependency.
 */
test.describe("Smoke test", () => {
  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page).toHaveTitle(/Sign In/);
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In", exact: true })).toBeVisible();
  });

  test("home page loads", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ComplianceKit/);
  });
});
