/**
 * global-setup.ts
 *
 * Runs once before all tests. Signs in as the pre-seeded E2E test user
 * (created by `scripts/seed-test-user.mjs`) and saves the authenticated
 * browser state to e2e/.auth/user.json.
 *
 * Uses the NextAuth API endpoint directly instead of the UI form, because
 * the server action redirect doesn't complete in the test environment
 * (next-auth@5 beta + Next.js 16 compatibility issue).
 */
import { test as setup, request } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

const EMAIL = process.env.E2E_TEST_EMAIL ?? "e2e@test.local";
const PASSWORD = process.env.E2E_TEST_PASSWORD ?? "E2eTest123!";
const BASE = "http://localhost:3001";

setup("authenticate", async ({ browser }) => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  // Use Playwright's API request context to authenticate via NextAuth API
  const apiContext = await request.newContext({ baseURL: BASE });

  // Step 1: Get CSRF token + cookie
  console.log("[global-setup] Fetching CSRF token...");
  const csrfResp = await apiContext.get("/api/auth/csrf");
  const { csrfToken } = await csrfResp.json();
  console.log("[global-setup] Got CSRF token");

  // Step 2: POST credentials to NextAuth callback
  console.log("[global-setup] Signing in via NextAuth API...");
  const signInResp = await apiContext.post("/api/auth/callback/credentials", {
    form: {
      email: EMAIL,
      password: PASSWORD,
      csrfToken,
    },
    maxRedirects: 0, // Don't follow redirects — just capture the session cookie
  });
  console.log(`[global-setup] Sign-in response: ${signInResp.status()} ${signInResp.headers()["location"] ?? ""}`);

  // Step 3: Transfer cookies to a browser context and verify the session
  const context = await browser.newContext();

  // Get all cookies from the API context and set them on the browser context
  const cookies = await apiContext.storageState();
  await context.addCookies(cookies.cookies);

  const page = await context.newPage();
  console.log("[global-setup] Verifying session by navigating to dashboard...");
  await page.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 30_000 });

  const currentUrl = page.url();
  if (currentUrl.includes("/sign-in")) {
    const screenshotPath = path.join(__dirname, ".auth/setup-failure.png");
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await context.close();
    await apiContext.dispose();
    throw new Error(
      `Sign-in failed: redirected to ${currentUrl}. Screenshot: ${screenshotPath}`
    );
  }

  // Handle consent page if it appears
  if (currentUrl.includes("/consent")) {
    console.log("[global-setup] Consent page detected, accepting...");
    const checkboxes = page.locator("input[type='checkbox']");
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check().catch(() => {});
    }
    await page.getByRole("button", { name: /continue|accept|agree|confirm/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  }

  console.log(`[global-setup] Authenticated successfully. URL: ${page.url()}`);
  await context.storageState({ path: AUTH_FILE });
  await context.close();
  await apiContext.dispose();
});
