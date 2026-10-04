import { expect, test, type Browser, type Page } from "@playwright/test";

const apiBaseUrl =
  process.env.VISUALMATH_E2E_API_BASE_URL ??
  process.env.VITE_API_BASE_URL ??
  "";

const password = "VisualMath!2026#E2E";
const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const account = {
  email: `visualmath-e2e-${unique}@example.com`,
  handle: `vm-e2e-${unique.slice(-10)}`.replace(/[^a-z0-9-]/gi, "").slice(0, 28),
  displayName: "VisualMath E2E",
  password,
};

async function openRegistration(page: Page) {
  await page.goto("/#account");
  await expect(page.locator(".account-page, .account-auth-shell, .account-auth-state"))
    .toBeVisible();
  await expect(page.getByRole("button", { name: "Регистрация" })).toBeVisible();
  await page.getByRole("button", { name: "Регистрация" }).click();
}

async function register(page: Page) {
  await openRegistration(page);
  await page.getByLabel("Имя").fill(account.displayName);
  await page.getByLabel("Handle").fill(account.handle);
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Пароль").fill(account.password);
  const bootstrap = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/me/bootstrap") &&
      response.request().method() === "GET",
  );
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  expect((await bootstrap).status()).toBe(200);
  await expect(page.getByRole("button", { name: "Выйти" })).toBeVisible();
}

async function login(page: Page) {
  await page.goto("/#account");
  await expect(page.getByRole("button", { name: "Вход" })).toBeVisible();
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Пароль").fill(account.password);
  const bootstrap = page.waitForResponse(
    (response) =>
      response.url().endsWith("/api/v1/me/bootstrap") &&
      response.request().method() === "GET",
  );
  await page.getByRole("button", { name: "Войти" }).click();
  expect((await bootstrap).status()).toBe(200);
  await expect(page.getByRole("button", { name: "Выйти" })).toBeVisible();
}

async function openMatrices(page: Page) {
  await page.goto("/#matrices");
  await expect(page.locator(".topic-page")).toBeVisible();
  await expect(page.locator("#block-matrices-0")).toBeVisible();
}

async function createLocalMarks(page: Page) {
  await openMatrices(page);
  const firstBlock = page.locator("#block-matrices-0");
  await firstBlock.getByRole("button", { name: /Важно/ }).click();
  await firstBlock.getByRole("button", { name: /Заметка/ }).click();
  await firstBlock.locator("textarea").fill("E2E local note before auth");
  await page.locator(".topic-quick-actions").getByTitle("Сохранить тему").click();
}

async function setNordTheme(page: Page) {
  await page.getByRole("button", { name: /Настройки/ }).click();
  await page.getByRole("button", { name: "Темы" }).click();
  await page.getByRole("button", { name: "Nord" }).click();
  await page.getByRole("button", { name: "Закрыть настройки" }).click();
}

async function expectCanonicalMarks(page: Page) {
  await openMatrices(page);
  const firstBlock = page.locator("#block-matrices-0");
  await expect(firstBlock.locator(".block-important-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await firstBlock.getByRole("button", { name: /Заметка/ }).click();
  await expect(firstBlock.locator("textarea")).toHaveValue(
    "E2E local note before auth",
  );
  await expect(
    page.locator(".topic-quick-actions button.saved"),
  ).toContainText("Сохранено");
}

function makeWavFixture(name: string, frequency = 440) {
  const sampleRate = 8000;
  const durationSeconds = 0.2;
  const samples = Math.floor(sampleRate * durationSeconds);
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i += 1) {
    const value = Math.sin((2 * Math.PI * frequency * i) / sampleRate);
    buffer.writeInt16LE(Math.floor(value * 4000), 44 + i * 2);
  }
  return { name, mimeType: "audio/wav", buffer };
}

async function newLoggedInPage(browser: Browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page);
  return { context, page };
}

test.describe.serial("VisualMath real backend MVP", () => {
  test("anonymous migration -> bootstrap -> account state -> reload/logout/login/cross-device", async ({
    page,
    browser,
  }) => {
    await createLocalMarks(page);
    await register(page);

    await setNordTheme(page);
    await openMatrices(page);

    const block = page.locator("#block-matrices-2");
    await block.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1700);
    await page.locator("#block-matrices-4").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1300);

    await expectCanonicalMarks(page);

    await page.reload();
    await page.goto("/#account");
    await expect(page.getByRole("button", { name: "Выйти" })).toBeVisible();

    await page.getByRole("button", { name: "Выйти" }).click();
    await expect(page.getByRole("button", { name: "Вход" })).toBeVisible();
    await login(page);
    await expectCanonicalMarks(page);

    const second = await newLoggedInPage(browser);
    await second.page.waitForFunction(() => {
      try {
        const value = JSON.parse(
          localStorage.getItem("visualmath-topic-resume-v1") || "{}",
        );
        return (value.matrices?.blockIndex ?? 0) > 0;
      } catch {
        return false;
      }
    });
    await expectCanonicalMarks(second.page);
    await expect(second.page.locator(".topic-resume-card")).toBeVisible();
    await second.context.close();

    const isolated = await browser.newContext();
    const isolatedPage = await isolated.newPage();
    const otherUnique = Date.now().toString(36);
    await isolatedPage.goto("/#account");
    await isolatedPage.getByRole("button", { name: "Регистрация" }).click();
    await isolatedPage.getByLabel("Имя").fill("Other E2E");
    await isolatedPage.getByLabel("Handle").fill("other-" + otherUnique.slice(-8));
    await isolatedPage.getByLabel("Email").fill(`other-${otherUnique}@example.com`);
    await isolatedPage.getByLabel("Пароль").fill(password);
    await isolatedPage.getByRole("button", { name: "Создать аккаунт" }).click();
    await openMatrices(isolatedPage);
    await expect(
      isolatedPage.locator("#block-matrices-0 .block-important-button"),
    ).toHaveAttribute("aria-pressed", "false");
    await isolated.context.close();
  });

  test("one protected 401 performs one refresh and retries", async ({ page }) => {
    await login(page);
    await page.goto("/#matrices");

    let forced401 = false;
    let refreshCount = 0;

    page.on("request", (request) => {
      if (request.url().endsWith("/api/v1/auth/refresh")) refreshCount += 1;
    });

    await page.route("**/api/v1/me/activity/stats**", async (route) => {
      if (!forced401) {
        forced401 = true;
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({
            error: { code: "unauthorized", message: "forced e2e 401" },
          }),
        });
        return;
      }
      await route.continue();
    });

    await page.evaluate(() => {
      window.location.hash = "account";
    });
    await expect(page.getByRole("button", { name: "Выйти" })).toBeVisible();
    await expect.poll(() => refreshCount).toBe(1);
  });

  test("backend outage never blanks bundled course UI", async ({ page }) => {
    await page.route(apiBaseUrl + "/**", (route) => route.abort("failed"));
    await page.goto("/#matrices");
    await expect(page.locator(".app-shell")).toBeVisible();
    await expect(page.locator(".topic-page")).toBeVisible();
    await expect(page.locator("#block-matrices-0")).toBeVisible();
  });

  test("server media CRUD runs only when runtime capability is enabled", async ({
    page,
  }) => {
    await login(page);
    await page.getByRole("button", { name: /Настройки/ }).click();
    await page.getByRole("button", { name: "Музыка" }).click();

    const copy = page.locator(".settings-section-copy").filter({
      hasText: "Фоновая музыка",
    });
    await expect(copy).toBeVisible();

    if (!(await copy.textContent())?.includes("аккаунте VisualMath")) {
      test.skip(true, "bootstrap.capabilities.mediaAudio=false");
    }

    const input = page.locator('input[type="file"][accept="audio/*"]');
    await input.setInputFiles([
      makeWavFixture("e2e-a.wav", 440),
      makeWavFixture("e2e-b.wav", 660),
    ]);

    await expect(page.locator(".music-playlist article")).toHaveCount(2);

    const contentRequest = page.waitForRequest((request) =>
      /\/api\/v1\/me\/media\/audio\/.+\/content$/.test(request.url()),
    );
    await page.locator(".music-playlist article").first().locator(".music-track-select").click();
    await contentRequest;

    page.once("dialog", async (dialog) => {
      await dialog.accept("e2e-renamed.wav");
    });
    await page.locator(".music-playlist article").first().getByTitle("Переименовать").click();
    await expect(page.locator(".music-playlist")).toContainText("e2e-renamed.wav");

    await page.locator(".music-playlist article").first().getByTitle("Ниже").click();
    await expect(page.locator(".music-playlist article").nth(1)).toContainText(
      "e2e-renamed.wav",
    );

    const rows = page.locator(".music-playlist article");
    while ((await rows.count()) > 0) {
      const before = await rows.count();
      await rows.first().locator(".music-track-remove").click();
      await expect(rows).toHaveCount(before - 1);
    }
  });
});
