import { expect, test } from "@playwright/test";

test.describe("VisualMath production smoke", () => {
  test("home shell renders without a backend", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".app-shell")).toBeVisible();
    await expect(page.locator("body")).toContainText("VisualMath");
  });

  test("command palette traps keyboard focus and restores it on close", async ({ page }) => {
    await page.goto("/");

    const trigger = page.getByRole("button", { name: /Поиск/i });
    await trigger.focus();
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Поиск по курсу" });
    const input = dialog.getByRole("textbox", { name: "Поиск по курсу" });
    await expect(input).toBeFocused();

    const footerButtons = dialog.locator(".command-footer button");
    await footerButtons.last().focus();
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("semantic topic deep link resolves to the requested block", async ({ page }) => {
    await page.goto("/#matrices/block/1");
    await expect(page.locator(".topic-page")).toBeVisible();
    await expect(page.locator("#block-matrices-1")).toBeVisible();
    await expect(page.locator(".topic-local-search input")).toBeVisible();
  });

  test("personal marks route is available in local-first mode", async ({ page }) => {
    await page.goto("/#marks");
    await expect(page.locator(".my-marks-page")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Важное и заметки/i })).toBeVisible();
  });

  test("account route is honest local mode when backend is not configured", async ({ page }) => {
    await page.goto("/#account");
    await expect(page.locator(".account-page")).toBeVisible();
    await expect(page.locator(".account-local-banner")).toContainText("Backend не настроен");
  });
});
