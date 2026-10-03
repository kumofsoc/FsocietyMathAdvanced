// Vitest executes this file in Node; the app intentionally does not ship @types/node.
// @ts-expect-error test-only Node builtin
import { readFileSync } from "node:fs";
// @ts-expect-error test-only Node builtin
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const guardedStyleFiles = [
  "./navigation-shell.css",
  "./topic-outline.css",
  "./review-hub.css",
  "./course-map.css",
  "./topic-search.css",
  "./topic-copy.css",
  "./topic-proof-collapse.css",
  "./reading-width.css",
  "./reading-focus.css",
  "./sidebar-topic-toc.css",
  "./block-notes.css",
  "./important-blocks.css",
  "./my-marks.css",
  "../features/account-experience/styles/account-runtime.css",
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

function readStyle(relativePath: string) {
  return readFileSync(
    fileURLToPath(new URL(relativePath, import.meta.url)),
    "utf8",
  );
}

describe("VisualMath typography tokens", () => {
  it.each(guardedStyleFiles)("%s does not introduce microscopic raw font sizes", (relativePath) => {
    const microscopic = rawPixelFontSizes(readStyle(relativePath)).filter(
      (size) => size <= 12,
    );
    expect(microscopic).toEqual([]);
  });

  it("keeps the canonical readable scale at or above 14px", () => {
    const css = readStyle("./typography.css");

    expect(css).toContain("--font-xs:14px");
    expect(css).toContain("--font-sm:15px");
    expect(css).toContain("--font-body:17px");
    expect(css).toContain("--font-copy:18px");
  });
});
