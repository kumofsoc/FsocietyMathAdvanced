import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const guardedStyleFiles = [
  "./navigation-shell.css",
  "./topic-outline.css",
  "./review-hub.css",
  "./course-map.css",
];

function rawPixelFontSizes(css: string) {
  const sizes: number[] = [];

  for (const match of css.matchAll(/font-size:\s*(\d+)px/gi)) {
    sizes.push(Number(match[1]));
  }

  for (const match of css.matchAll(
    /font:\s*(?:(?:[1-9]00|normal|bold)\s+)?(\d+)px(?:\/[^\s;]+)?\s+/gi,
  )) {
    sizes.push(Number(match[1]));
  }

  return sizes;
}

describe("VisualMath typography tokens", () => {
  it.each(guardedStyleFiles)("%s does not introduce microscopic raw font sizes", (relativePath) => {
    const path = fileURLToPath(new URL(relativePath, import.meta.url));
    const css = readFileSync(path, "utf8");
    const microscopic = rawPixelFontSizes(css).filter((size) => size <= 12);

    expect(microscopic).toEqual([]);
  });

  it("keeps the canonical readable scale at or above 14px", () => {
    const path = fileURLToPath(new URL("./typography.css", import.meta.url));
    const css = readFileSync(path, "utf8");

    expect(css).toContain("--font-xs:14px");
    expect(css).toContain("--font-sm:15px");
    expect(css).toContain("--font-body:17px");
    expect(css).toContain("--font-copy:18px");
  });
});
