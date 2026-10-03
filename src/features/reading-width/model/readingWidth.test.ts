import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadReadingWidth,
  READING_WIDTH_KEY,
  saveReadingWidth,
} from "./readingWidth";

describe("reading width preference", () => {
  afterEach(() => vi.unstubAllGlobals());

  beforeEach(() => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
  });

  it("defaults to normal", () => {
    expect(loadReadingWidth()).toBe("normal");
  });

  it("persists valid width values", () => {
    expect(saveReadingWidth("wide")).toBe(true);
    expect(localStorage.getItem(READING_WIDTH_KEY)).toBe("wide");
    expect(loadReadingWidth()).toBe("wide");
  });

  it("ignores invalid stored values", () => {
    localStorage.setItem(READING_WIDTH_KEY, "giant");
    expect(loadReadingWidth()).toBe("normal");
  });
});
