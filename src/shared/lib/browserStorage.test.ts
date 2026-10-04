import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readLocalStorageJson } from "./browserStorage";

describe("browserStorage JSON boundary", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("returns parsed JSON when its coarse shape matches the fallback", () => {
    localStorage.setItem("record", JSON.stringify({ pending: true }));
    localStorage.setItem("list", JSON.stringify(["rank"]));

    expect(readLocalStorageJson("record", {})).toEqual({ pending: true });
    expect(readLocalStorageJson("list", [] as string[])).toEqual(["rank"]);
  });

  it("falls back when valid JSON has the wrong container shape", () => {
    localStorage.setItem("record", "null");
    localStorage.setItem("list", JSON.stringify({ unexpected: true }));

    expect(readLocalStorageJson("record", {})).toEqual({});
    expect(readLocalStorageJson("list", [] as string[])).toEqual([]);
  });

  it("falls back when scalar JSON has the wrong type", () => {
    localStorage.setItem("count", JSON.stringify("12"));
    expect(readLocalStorageJson("count", 0)).toBe(0);
  });

  it("supports an explicit validator for nullable structured payloads", () => {
    const isStage = (value: unknown): value is { version: number } | null =>
      value === null ||
      (typeof value === "object" &&
        value !== null &&
        "version" in value &&
        typeof (value as { version?: unknown }).version === "number");

    localStorage.setItem("stage", JSON.stringify({ version: 2 }));
    expect(
      readLocalStorageJson<{ version: number } | null>("stage", null, isStage),
    ).toEqual({ version: 2 });

    localStorage.setItem("stage", JSON.stringify("corrupted"));
    expect(
      readLocalStorageJson<{ version: number } | null>("stage", null, isStage),
    ).toBeNull();
  });
});
