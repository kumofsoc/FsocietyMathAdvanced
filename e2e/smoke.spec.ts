import { expect, test } from "@playwright/test";

test.describe("MathMaMath production smoke", () => {
  test("home shell renders without a backend", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".app-shell")).toBeVisible();
    await expect(page.locator("body")).toContainText("MathMaMath");
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

test.describe("mobile and tablet layout", () => {
  for (const width of [375, 768]) {
    test(`drawer, main routes and typography work at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 812 });
      await page.goto("/");
      const menu = page.locator(".mobile-menu");
      await expect(menu).toBeVisible();
      await expect(menu).toHaveAttribute("aria-label", "Открыть меню курса");
      await menu.click();
      await expect(page.locator("#mathmamath-course-sidebar")).toBeVisible();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await expect(menu).toHaveAttribute("aria-label", "Закрыть меню курса");
      await page.keyboard.press("Escape");
      await expect(page.locator("#mathmamath-course-sidebar")).toBeHidden();
      await expect(menu).toHaveAttribute("aria-expanded", "false");

      const routes = [
        { url: "/", content: ".future-home" },
        { url: "/#matrices", content: ".topic-page" },
        { url: "/#map", content: ".knowledge-map-page" },
        { url: "/#review", content: ".review-hub" },
        { url: "/#account", content: ".account-page" },
      ];
      for (const route of routes) {
        await page.goto(route.url);
        await expect(page.locator(route.content)).toBeVisible();
        await expect.poll(async () => {
          const result = await page.evaluate(() => {
            const width = window.innerWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            if (scrollWidth <= width + 2) return "ok";
            const offenders = [...document.querySelectorAll<HTMLElement>("body *")]
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                return style.position !== "fixed" &&
                  rect.width > 0 && rect.height > 0 &&
                  (rect.right > width + 3 || rect.left < -3) &&
                  style.visibility !== "hidden";
              })
              .slice(0, 7)
              .map((el) => el.tagName.toLowerCase() + "." + el.className.toString().slice(0, 75));
            return `route=${location.hash || "/"} scrollWidth=${scrollWidth} viewport=${width} offenders=${offenders.join("|")}`;
          });
          return result;
        }).toBe("ok");
      }
    });
  }
});
