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

// Shared state across tests in this file
let websiteId: string;
let scanId: string;

test("can add a new website", async ({ page }) => {
  await page.goto("/dashboard/websites/new");

  await page.getByLabel("Name").fill("E2E Test Site");
  await page.getByLabel("URL").fill("https://example.com");

  await page.getByRole("button", { name: "Add Website" }).click();

  // Should redirect to the new website's detail page
  await page.waitForURL(/\/dashboard\/websites\/[^/]+$/, { timeout: 15_000 });

  const match = page.url().match(/\/websites\/([^/]+)$/);
  expect(match).not.toBeNull();
  websiteId = match![1];
});

test("can trigger a scan and wait for results", async ({ page }) => {
  // If the previous test didn't set websiteId, navigate to the websites list
  // and pick the first website
  if (!websiteId) {
    await page.goto("/dashboard/websites");
    const firstLink = page.locator("a[href*='/dashboard/websites/']").first();
    await firstLink.click();
    const match = page.url().match(/\/websites\/([^/]+)/);
    websiteId = match?.[1] ?? "";
  }

  await page.goto(`/dashboard/websites/${websiteId}/scan`);

  // Click the scan button
  await page.getByRole("button", { name: "Run Scan" }).click();

  // The button will change to "Queued…" then "Scanning…"
  await expect(
    page.getByRole("button", { name: /Queued|Scanning/ })
  ).toBeVisible({ timeout: 10_000 });

  // Wait for scan completion — the page redirects to the scan results URL
  await page.waitForURL(/\/scans\/[^/]+$/, { timeout: 80_000 });

  const match = page.url().match(/\/scans\/([^/]+)$/);
  expect(match).not.toBeNull();
  scanId = match![1];
});

test("scan results page shows compliance score", async ({ page }) => {
  if (!websiteId || !scanId) {
    test.skip(true, "Requires websiteId and scanId from previous tests");
  }

  await page.goto(`/dashboard/websites/${websiteId}/scans/${scanId}`);

  // The compliance score gauge / card should be visible
  await expect(
    page.getByText(/compliance score/i).or(page.getByText(/overall score/i))
  ).toBeVisible();

  // Findings tab or section should exist
  await expect(page.getByText(/findings/i).first()).toBeVisible();
});

test("websites list shows the added website", async ({ page }) => {
  await page.goto("/dashboard/websites");
  await expect(page.getByText("E2E Test Site")).toBeVisible();
});
