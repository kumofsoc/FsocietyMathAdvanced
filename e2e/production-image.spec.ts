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
  expect(csp).toContain("img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com;");
  expect(csp).not.toContain("img-src 'self' data: blob: https:;");
  expect(csp).toContain("script-src 'self' https://www.googletagmanager.com;");
  expect(csp).toContain("connect-src 'self' https://visualmath.invalid https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com;");
  expect(csp).toContain(
    "media-src 'self' blob: https://visualmath.invalid",
  );
  await expect(page.locator(".app-shell")).toBeVisible();
  await expect(page.locator("body")).toContainText("MathMaMath");

  await page.goto("/#map");
  await expect(page.locator(".knowledge-map-page")).toBeVisible();

  expect(runtimeErrors).toEqual([]);
  expect(cspViolations).toEqual([]);
});


test("production image serves crawlable static math lessons", async ({ request }) => {
  const catalog = await request.get("/learn/");
  expect(catalog.status()).toBe(200);
  const catalogHtml = await catalog.text();
  expect(catalogHtml).toContain("<h1>Курс высшей математики</h1>");
  expect(catalogHtml).toContain('href="/learn/matrices/"');

  const chapter = await request.get("/subjects/linear/");
  expect(chapter.status()).toBe(200);
  expect(await chapter.text()).toContain("<h1>Линейная алгебра</h1>");

  const topic = await request.get("/learn/matrices/");
  expect(topic.status()).toBe(200);
  const html = await topic.text();
  expect(html).toContain("<h1>Матрицы</h1>");
  expect(html).toContain('type="application/ld+json"');
  expect(html).toContain('href="/#matrices"');

  const missingChapter = await request.get("/subjects/nonexistent-seo-page/");
  expect(missingChapter.status()).toBe(404);
  const missing = await request.get("/learn/nonexistent-seo-page/");
  expect(missing.status()).toBe(404);
});
