/**
 * global-setup.ts
 *
 * Runs once before all tests. Signs in as the pre-seeded E2E test user
 * (created by `scripts/seed-test-user.ts`) and saves the authenticated
 * browser state to e2e/.auth/user.json.
 */
import { chromium, test as setup } from "@playwright/test";
import path from "path";
import fs from "fs";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

const EMAIL = process.env.E2E_TEST_EMAIL ?? "e2e@test.local";
const PASSWORD = process.env.E2E_TEST_PASSWORD ?? "E2eTest123!";
const BASE = "http://localhost:3001";

setup("authenticate", async () => {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(`${BASE}/sign-in`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  // Wait for either /dashboard or /consent
  await page.waitForURL((url) => url.pathname.includes("/dashboard") || url.pathname.includes("/consent"), {
    timeout: 30_000,
  });

  if (page.url().includes("/consent")) {
    const checkboxes = page.locator("input[type='checkbox']");
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check().catch(() => {});
    }
    await page.getByRole("button", { name: /continue|accept|agree|confirm/i }).click();
    await page.waitForURL(/dashboard/, { timeout: 15_000 });
  }

  await context.storageState({ path: AUTH_FILE });
  await browser.close();
});
