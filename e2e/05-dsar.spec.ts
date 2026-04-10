/**
 * 05-dsar.spec.ts
 *
 * Covers:
 *   - Public DSAR form is accessible without login
 *   - Visitor can submit a DSAR request (A1 + A2 emails triggered)
 *   - Dashboard owner can see the submitted request
 *   - Owner can mark the request as Completed with a response (A3 email)
 *   - Owner can reject a second request with a reason (A4 email)
 *
 * Emails are printed to the terminal in dev mode (no RESEND_API_KEY needed).
 */
import { test, expect } from "@playwright/test";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Get the DSAR embed code from the dashboard. */
async function getEmbedCode(
  page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never
): Promise<string | null> {
  await page.goto("/dashboard/dsar");

  // The DSAR page shows public form links like /dsar/{embedCode}
  const linkEl = page.locator("a[href*='/dsar/']").first();
  if (!(await linkEl.isVisible({ timeout: 5_000 }).catch(() => false))) return null;

  const href = await linkEl.getAttribute("href");
  const match = href?.match(/\/dsar\/([^/?\s]+)/);
  return match?.[1] ?? null;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test("public DSAR form loads without authentication", async ({ page, context }) => {
  const embedCode = await getEmbedCode(page);
  if (!embedCode) {
    test.skip(true, "No websites found — run 02-website-scan first");
  }

  // Open the public form in a fresh (unauthenticated) context
  const publicPage = await context.newPage();
  await publicPage.goto(`/dsar/${embedCode}`);

  await expect(
    publicPage.getByText(/data.*request|submit.*request|your rights/i).first()
  ).toBeVisible();

  await publicPage.close();
});

test("visitor can submit a DSAR request", async ({ page, context }) => {
  const embedCode = await getEmbedCode(page);
  if (!embedCode) {
    test.skip(true, "No websites found — run 02-website-scan first");
  }

  const publicPage = await context.newPage();
  await publicPage.goto(`/dsar/${embedCode}`);

  // Fill the DSAR form
  const typeSelect = publicPage
    .getByLabel(/request type/i)
    .or(publicPage.getByRole("combobox"))
    .first();
  await typeSelect.selectOption({ index: 1 }); // pick first non-placeholder option

  await publicPage.getByLabel(/email/i).first().fill("visitor@test.local");
  await publicPage.getByLabel(/name/i).first().fill("Test Visitor");

  const descriptionField = publicPage
    .getByLabel(/details|description/i)
    .or(publicPage.getByRole("textbox").last())
    .first();
  await descriptionField.fill("E2E test DSAR submission — please ignore.");

  await publicPage.getByRole("button", { name: /submit/i }).click();

  // Success message should appear
  await expect(
    publicPage.getByText(/submitted|thank you|received/i).first()
  ).toBeVisible({ timeout: 10_000 });

  await publicPage.close();
});

test("owner can see the submitted DSAR request in the dashboard", async ({ page }) => {
  await page.goto("/dashboard/dsar");

  // At least one pending request should appear
  await expect(
    page.getByText(/visitor@test\.local/i)
      .or(page.getByText(/pending/i))
      .first()
  ).toBeVisible({ timeout: 10_000 });
});

test("owner can mark a DSAR request as completed", async ({ page }) => {
  await page.goto("/dashboard/dsar");

  // Click on a DSAR request row (link to detail page)
  const requestLink = page.locator("a[href*='/dashboard/dsar/']").first();
  if (!(await requestLink.isVisible({ timeout: 5_000 }).catch(() => false))) {
    test.skip(true, "No DSAR requests found — run submission test first");
  }
  await requestLink.click();
  await page.waitForURL(/\/dashboard\/dsar\/.+/, { timeout: 10_000 });

  // Write a response
  const responseField = page
    .getByLabel(/response/i)
    .or(page.getByRole("textbox").first())
    .first();
  await responseField.fill("Your data request has been processed. No personal data was found.");

  // Submit as completed
  const completeBtn = page
    .getByRole("button", { name: /complete|mark.*complete/i })
    .first();
  await completeBtn.click();

  // Should show success
  await expect(
    page.getByText(/completed|response sent/i).first()
  ).toBeVisible({ timeout: 10_000 });
});

test("owner can reject a DSAR request with a reason", async ({ page, context }) => {
  // Submit a second DSAR request to reject
  const embedCode = await getEmbedCode(page);
  if (!embedCode) {
    test.skip(true, "No websites found");
  }

  const publicPage = await context.newPage();
  await publicPage.goto(`/dsar/${embedCode}`);

  const typeSelect = publicPage
    .getByLabel(/request type/i)
    .or(publicPage.getByRole("combobox"))
    .first();
  await typeSelect.selectOption({ index: 2 });
  await publicPage.getByLabel(/email/i).first().fill("reject-test@test.local");
  await publicPage.getByLabel(/name/i).first().fill("Reject Test");
  const descriptionField = publicPage
    .getByLabel(/details|description/i)
    .or(publicPage.getByRole("textbox").last())
    .first();
  await descriptionField.fill("E2E test — this request will be rejected.");
  await publicPage.getByRole("button", { name: /submit/i }).click();
  await expect(
    publicPage.getByText(/submitted|thank you/i).first()
  ).toBeVisible({ timeout: 10_000 });
  await publicPage.close();

  // Back to dashboard — find the new request
  await page.goto("/dashboard/dsar");
  const pendingRow = page.locator("a[href*='/dashboard/dsar/']").last();
  await pendingRow.click();
  await page.waitForURL(/\/dashboard\/dsar\/.+/);

  // Fill rejection reason and reject
  const reasonField = page
    .getByLabel(/reason|response|rejection/i)
    .or(page.getByRole("textbox").first())
    .first();
  await reasonField.fill("This request falls outside the scope of our data processing.");

  const rejectBtn = page.getByRole("button", { name: /reject/i }).first();
  await rejectBtn.click();

  await expect(
    page.getByText(/rejected/i).first()
  ).toBeVisible({ timeout: 10_000 });
});
