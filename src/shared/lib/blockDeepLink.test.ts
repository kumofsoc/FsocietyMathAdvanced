import { describe, expect, it } from "vitest";
import {
  buildBlockDeepLink,
  buildBlockHash,
  parseVisualMathHash,
} from "./blockDeepLink";

describe("block deep links", () => {
  it("keeps ordinary routes unchanged", () => {
    expect(parseVisualMathHash("#matrices")).toEqual({
      route: "matrices",
      topicId: null,
      blockIndex: null,
    });
  });

  it("extracts topic route and block target from deep links", () => {
    expect(parseVisualMathHash("#matrices/block/7")).toEqual({
      route: "matrices",
      topicId: "matrices",
      blockIndex: 7,
    });
  });

  it("builds a stable shareable block hash", () => {
    expect(buildBlockHash("abstract-linear", 12)).toBe(
      "#abstract-linear/block/12",
    );
  });

  it("preserves the current origin and path in copied links", () => {
    expect(
      buildBlockDeepLink(
        "https://example.com/course/?lang=ru#matrices",
        "rank",
        3,
      ),
    ).toBe("https://example.com/course/?lang=ru#rank/block/3");
  });
});
