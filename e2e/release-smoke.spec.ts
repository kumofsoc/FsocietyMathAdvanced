import { expect, test } from "@playwright/test";

test("home and topic routes render from a production build", async ({ page }) => {
  await page.goto("/#home");
  await expect(page.getByRole("button", { name: /VisualMath/i }).first()).toBeVisible();

  await page.goto("/#matrices");
  await expect(page.locator(".topic-page")).toBeVisible();
  await expect(page.locator(".content-block").first()).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: /Поиск внутри темы/i }),
  ).toBeVisible();
});

test("important marks and notes survive reload and appear in My marks", async ({ page }) => {
  await page.goto("/#matrices");
  const firstBlock = page.locator(".content-block").first();
  await expect(firstBlock).toBeVisible();

  await firstBlock.locator(".block-important-button").click();
  await firstBlock.locator(".block-note-button").click();
  await firstBlock.locator(".block-note-panel textarea").fill("E2E: проверить определение");
  await expect(firstBlock).toHaveClass(/important-content-block/);

  await page.reload();
  const reloadedBlock = page.locator(".content-block").first();
  await expect(reloadedBlock).toHaveClass(/important-content-block/);
  await reloadedBlock.locator(".block-note-button").click();
  await expect(reloadedBlock.locator(".block-note-panel textarea")).toHaveValue(
    "E2E: проверить определение",
  );

  await page.goto("/#marks");
  await expect(page.getByText("E2E: проверить определение")).toBeVisible();
  await expect(page.getByText("ВАЖНО", { exact: false }).first()).toBeVisible();
});

test("deep link resolves directly to a topic block", async ({ page }) => {
  await page.goto("/#matrices/block/1");
  const target = page.locator("#block-matrices-1");
  await expect(target).toBeVisible();
  await expect(target).toBeInViewport();
});

test("account stays honest in local-only mode", async ({ page }) => {
  await page.goto("/#account");
  await expect(page.getByText("VisualMath User", { exact: true })).toBeVisible();
  await expect(page.getByText("NO MOCK DATA", { exact: true })).toBeVisible();
  await expect(page.getByText("Демонстрационные графики удалены.")).toBeVisible();
});
