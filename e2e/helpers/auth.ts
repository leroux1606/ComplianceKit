import { Page } from "@playwright/test";

export const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "e2e@test.local";
export const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "E2eTest123!";

/** Sign in via the credentials form. Throws if the dashboard is not reached. */
export async function signIn(page: Page): Promise<void> {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}
