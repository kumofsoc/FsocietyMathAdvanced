import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readPositions, writePositions } from "./useAppNavigationLifecycle";

const STORAGE_KEY = "fsociety-route-scroll-v1";

describe("route scroll restoration", () => {
  let data: Map<string, string>;

  beforeEach(() => {
    data = new Map();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  it("keeps saved scroll positions in the original JSON format", () => {
    data.set(STORAGE_KEY, JSON.stringify({ home: 120, matrices: 400 }));
    const positions = readPositions();
    expect(positions.get("matrices")).toBe(400);
    positions.set("home", 0);
    writePositions(positions);
    expect(JSON.parse(data.get(STORAGE_KEY) ?? "{}")).toEqual({ home: 0, matrices: 400 });
  });

  it("does not allow URL-controlled route names to poison object prototypes", () => {
    const positions = readPositions();
    positions.set("__proto__", 77);
    positions.set("constructor", 12);
    positions.set("toString", 25);
    writePositions(positions);
    const persisted = JSON.parse(data.get(STORAGE_KEY) || "{}");
    expect(Object.getPrototypeOf(persisted)).toBe(Object.prototype);
    expect(Object.hasOwn(persisted, "__proto__")).toBe(true);
    expect(persisted["__proto__"]).toBe(77);
    expect(readPositions().get("constructor")).toBe(12);
    expect(readPositions().get("toString")).toBe(25);
    expect(({} as { polluted?: number }).polluted).toBeUndefined();
  });

  it("ignores corrupt and non-finite stored scroll values", () => {
    data.set(STORAGE_KEY, "not-json");
    expect(readPositions().size).toBe(0);
    data.set(STORAGE_KEY, JSON.stringify({ home: "oops", matrices: -2, map: 5 }));
    expect([...readPositions()]).toEqual([["map", 5]]);
  });
});
