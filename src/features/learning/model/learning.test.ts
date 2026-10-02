import { describe, expect, it } from "vitest";
import { getReadingCoverageFromBlocks } from "./learning";

describe("reading coverage", () => {
  it("counts only unique blocks for the current topic", () => {
    const seen = new Set([
      "matrices::0",
      "matrices::1",
      "matrices::1",
      "determinants::0",
    ]);

    expect(getReadingCoverageFromBlocks("matrices", 4, seen)).toBe(0.5);
  });

  it("clamps coverage and handles topics without blocks", () => {
    expect(getReadingCoverageFromBlocks("matrices", 0, new Set())).toBe(0);
    expect(
      getReadingCoverageFromBlocks(
        "matrices",
        2,
        new Set(["matrices::0", "matrices::1", "matrices::2"]),
      ),
    ).toBe(1);
  });
});
