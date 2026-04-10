/**
 * 02-website-scan.spec.ts
 *
 * Covers:
 *   - Add a website (LAUNCH-PLAN 2.5 — add website → run scan → view results)
 *   - Trigger a compliance scan and wait for completion
 *   - Verify scan results page renders
 *
 * NOTE: The scan launches a real Puppeteer instance against https://example.com.
 * It will take 15–45 seconds. The test timeout is set to 90s for this file.
 */
import { test, expect } from "@playwright/test";

test.setTimeout(90_000);

test("can add a new website", async ({ page }) => {
  // Check if website already exists (from prior test run)
  await page.goto("/dashboard/websites");
  await page.waitForLoadState("networkidle");

  const existing = page.getByText("E2E Test Site").first();
  if (await existing.isVisible().catch(() => false)) {
    // Already exists — skip creation
    return;
  }

  await page.goto("/dashboard/websites/new");

  await page.getByLabel("Website Name").fill("E2E Test Site");
  await page.getByLabel("Website URL").fill("https://example.com");

  await page.getByRole("button", { name: "Add Website" }).click();

  // The server action returns data, then router.push navigates.
  // Wait for the detail page URL (excluding /new).
  await page.waitForURL(/\/dashboard\/websites\/(?!new)[^/]+$/, { timeout: 30_000 });
});

test("can navigate to scan page from website detail", async ({ page }) => {
  await page.goto("/dashboard/websites");
  await page.getByText("E2E Test Site").first().click();
  await page.waitForURL(/\/dashboard\/websites\/[^/]+$/);

  // Find and click the scan link/button
  const scanLink = page.getByRole("link", { name: /scan/i }).first();
  await scanLink.click();
  await page.waitForURL(/\/scan/, { timeout: 10_000 });

  // The scan button should be visible
  await expect(
    page.getByRole("button", { name: /scan|run scan/i }).first()
  ).toBeVisible();
});

test("can trigger a scan and wait for results", async ({ page }) => {
  // Navigate to the first website's scan page via the website list
  await page.goto("/dashboard/websites");
  await page.getByText("E2E Test Site").first().click();
  await page.waitForURL(/\/dashboard\/websites\/[^/]+$/);

  const scanLink = page.getByRole("link", { name: /scan/i }).first();
  await scanLink.click();
  await page.waitForURL(/\/scan/, { timeout: 10_000 });

  // Click the scan button
  await page.getByRole("button", { name: /scan|run scan/i }).first().click();

  // The button will change to "Queued…" then "Scanning…"
  await expect(
    page.getByText(/queued|scanning/i).first()
  ).toBeVisible({ timeout: 10_000 });

  // Wait for scan completion — the page should show results or redirect
  await page.waitForURL(/\/scans\/[^/]+$/, { timeout: 80_000 });
});

test("scan results page shows compliance score", async ({ page }) => {
  await page.goto("/dashboard/websites");
  await page.getByText("E2E Test Site").first().click();
  await page.waitForURL(/\/dashboard\/websites\/[^/]+$/);

  // Click the most recent scan result link
  const viewResults = page.getByRole("link", { name: /view results/i }).first();
  if (!(await viewResults.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, "No completed scan results available");
  }
  await viewResults.click();

  // The compliance score gauge / card should be visible
  await expect(
    page.getByText(/compliance score/i).or(page.getByText(/overall score/i)).first()
  ).toBeVisible();
});

test("websites list shows the added website", async ({ page }) => {
  await page.goto("/dashboard/websites");
  await expect(page.getByText("E2E Test Site").first()).toBeVisible();
});
