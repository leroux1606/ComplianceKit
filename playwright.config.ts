import { defineConfig, devices } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, "e2e/.auth/user.json");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // tests share a DB — run sequentially to avoid collisions
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["html", { open: "never" }], ["line"]],

  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  // Automatically start the dev server on port 3001 with test env
  webServer: {
    command: "npm run dev:test",
    url: "http://localhost:3001",
    reuseExistingServer: true,
    timeout: 120_000,
  },

  projects: [
    // Global setup — creates test user and saves auth state
    {
      name: "setup",
      testMatch: /global-setup\.ts/,
    },

    // All E2E tests run authenticated (except signup which sets up its own context)
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },
  ],

  timeout: 60_000,      // scans can take up to ~30s
  expect: { timeout: 10_000 },
});
