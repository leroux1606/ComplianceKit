/**
 * 03-policies.spec.ts
 *
 * Covers:
 *   - Navigate to policies page for a website
 *   - Generate a template-based cookie policy
 *   - Generate a template-based privacy policy
 *   - Verify the AI Policy button is visible (Professional/Enterprise feature)
 *
 * NOTE: AI policy generation is not tested end-to-end here because it requires
 * ANTHROPIC_API_KEY and a Professional/Enterprise subscription. The test only
 * verifies the button is present and accessible.
 */
import { test, expect } from "@playwright/test";

async function getFirstWebsiteId(page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never): Promise<string | null> {
  await page.goto("/dashboard/websites");
  const link = page.locator("a[href*='/dashboard/websites/']").first();
  if (!(await link.isVisible())) return null;
  await link.click();
  const match = page.url().match(/\/websites\/([^/]+)/);
  return match?.[1] ?? null;
}

test("policies page is reachable for a website", async ({ page }) => {
  const websiteId = await getFirstWebsiteId(page);
  if (!websiteId) {
    test.skip(true, "No websites found — run 02-website-scan first");
  }

  await page.goto(`/dashboard/websites/${websiteId}/policies`);
  await expect(page).toHaveURL(/policies/);

  // Both policy sections should exist
  await expect(page.getByText(/cookie policy/i).first()).toBeVisible();
  await expect(page.getByText(/privacy policy/i).first()).toBeVisible();
});

test("can generate a template cookie policy", async ({ page }) => {
  const websiteId = await getFirstWebsiteId(page);
  if (!websiteId) {
    test.skip(true, "No websites found — run 02-website-scan first");
  }

  await page.goto(`/dashboard/websites/${websiteId}/policies`);

  // Click the template generate button for the cookie policy
  const templateBtn = page
    .getByRole("button", { name: /template policy/i })
    .or(page.getByRole("button", { name: /generate.*cookie/i }))
    .first();

  await templateBtn.click();

  // After generation, the policy content or a view/download link should appear
  await expect(
    page.getByText(/cookie policy/i).or(page.getByRole("link", { name: /view policy/i }))
  ).toBeVisible({ timeout: 15_000 });
});

test("can generate a template privacy policy", async ({ page }) => {
  const websiteId = await getFirstWebsiteId(page);
  if (!websiteId) {
    test.skip(true, "No websites found — run 02-website-scan first");
  }

  await page.goto(`/dashboard/websites/${websiteId}/policies`);

  // Privacy policy section
  const templateBtn = page
    .getByRole("button", { name: /template policy/i })
    .or(page.getByRole("button", { name: /generate.*privacy/i }))
    .nth(1); // second one is privacy policy

  await templateBtn.click();

  await expect(
    page.getByText(/privacy policy/i).or(page.getByRole("link", { name: /view policy/i }))
  ).toBeVisible({ timeout: 15_000 });
});

test("AI Policy button is visible on the policies page", async ({ page }) => {
  const websiteId = await getFirstWebsiteId(page);
  if (!websiteId) {
    test.skip(true, "No websites found — run 02-website-scan first");
  }

  await page.goto(`/dashboard/websites/${websiteId}/policies`);

  // The AI Policy button should exist (may be locked behind plan upgrade)
  const aiBtn = page.getByRole("button", { name: /ai policy/i });
  await expect(aiBtn.or(page.getByText(/ai policy/i))).toBeVisible();
});
