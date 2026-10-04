import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getReadingCoverageFromBlocks,
  loadSavedTheorems,
  SAVED_THEOREMS_KEY,
} from "./learning";

afterEach(() => vi.unstubAllGlobals());

describe("saved theorem persistence", () => {
  it("rejects valid JSON with the wrong container shape", () => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) =>
        key === SAVED_THEOREMS_KEY ? JSON.stringify({ id: "bad" }) : null,
    });

    expect(loadSavedTheorems()).toEqual([]);
  });

  it("filters malformed theorem entries instead of poisoning consumers", () => {
    const valid = {
      id: "matrices::12",
      topicId: "matrices",
      topicTitle: "Матрицы",
      title: "Теорема",
      body: "Текст",
    };
    vi.stubGlobal("localStorage", {
      getItem: (key: string) =>
        key === SAVED_THEOREMS_KEY
          ? JSON.stringify([null, "bad", valid, { ...valid, id: "" }])
          : null,
    });

    expect(loadSavedTheorems()).toEqual([valid]);
  });
});

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
