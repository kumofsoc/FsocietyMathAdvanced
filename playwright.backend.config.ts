import { defineConfig, devices } from "@playwright/test";

const apiBaseUrl = (
  process.env.VISUALMATH_E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  ""
).replace(/\/+$/, "");

if (!apiBaseUrl) {
  throw new Error(
    "Backend-integrated E2E requires VISUALMATH_E2E_API_BASE_URL or VITE_API_BASE_URL.",
  );
}

export default defineConfig({
  testDir: "./e2e-backend",
  timeout: 90_000,
  expect: {
    timeout: 12_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [["line"], ["html", { open: "never", outputFolder: "playwright-report-backend" }]]
    : "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "pnpm build && pnpm preview --host 127.0.0.1 --port 5173",
    url: "http://localhost:5173",
    reuseExistingServer: false,
    timeout: 90_000,
    env: {
      VITE_API_BASE_URL: apiBaseUrl,
      VITE_API_TIMEOUT_MS: "12000",
      VITE_APP_RELEASE: "backend-e2e",
      VITE_ERROR_REPORTING_URL: "",
    },
  },
  projects: [
    {
      name: "backend-chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
