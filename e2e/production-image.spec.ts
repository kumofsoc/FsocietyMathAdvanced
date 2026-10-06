import { expect, test } from "@playwright/test";

test("production image renders under its Content-Security-Policy", async ({ page }) => {
  const cspViolations: string[] = [];
  const runtimeErrors: string[] = [];

  page.on("pageerror", (error) => {
    runtimeErrors.push(error.stack ?? error.message);
  });
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (
      /content security policy|refused to (load|execute|apply|connect)/i.test(
        text,
      )
    ) {
      cspViolations.push(text);
      return;
    }
    if (/Failed to load resource: net::ERR_/i.test(text)) return;
    runtimeErrors.push(text);
  });

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  expect(response?.headers()["content-security-policy"]).toContain(
    "default-src 'self'",
  );
  const csp = response?.headers()["content-security-policy"] ?? "";
  expect(csp).toContain("connect-src 'self' https://visualmath.invalid");
  expect(csp).not.toContain("connect-src 'self' https:;");
  expect(csp).toContain("img-src 'self' data: blob:");
  expect(csp).not.toContain("img-src 'self' data: blob: https:");
  expect(csp).toContain(
    "media-src 'self' blob: https://visualmath.invalid",
  );
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator("body")).toContainText("VisualMath");

  await page.goto("/#map");
  await expect(page.locator(".knowledge-map-page")).toBeVisible();

  expect(runtimeErrors).toEqual([]);
  expect(cspViolations).toEqual([]);
});
