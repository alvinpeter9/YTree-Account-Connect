import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "mvn spring-boot:run",
      cwd: "../backend",
      url: "http://127.0.0.1:8080/api/accounts",
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: "pnpm dev -- --strictPort",
      url: "http://127.0.0.1:5173",
      timeout: 60_000,
      reuseExistingServer: false,
    },
  ],
});
