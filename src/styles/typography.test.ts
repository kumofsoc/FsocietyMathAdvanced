import { describe, expect, it } from "vitest";
import navigationCss from "./navigation-shell.css?raw";
import topicOutlineCss from "./topic-outline.css?raw";
import reviewCss from "./review-hub.css?raw";
import courseMapCss from "./course-map.css?raw";
import typographyCss from "./typography.css?raw";

const guardedStyleFiles = [
  ["navigation-shell.css", navigationCss],
  ["topic-outline.css", topicOutlineCss],
  ["review-hub.css", reviewCss],
  ["course-map.css", courseMapCss],
] as const;

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
  it.each(guardedStyleFiles)("%s does not introduce microscopic raw font sizes", (_name, css) => {
    const microscopic = rawPixelFontSizes(css).filter((size) => size <= 12);
    expect(microscopic).toEqual([]);
  });

  it("keeps the canonical readable scale at or above 14px", () => {
    expect(typographyCss).toContain("--font-xs:14px");
    expect(typographyCss).toContain("--font-sm:15px");
    expect(typographyCss).toContain("--font-body:17px");
    expect(typographyCss).toContain("--font-copy:18px");
  });
});
