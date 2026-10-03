import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  LOCAL_PROFILE_KEY,
  loadLocalProfile,
  saveLocalProfile,
} from "./localProfile";

describe("local profile repository", () => {
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

  it("creates a valid local fallback", () => {
    expect(loadLocalProfile().displayName).toBe("VisualMath User");
    expect(localStorage.getItem(LOCAL_PROFILE_KEY)).toBeTruthy();
  });

  it("normalizes persisted profile fields", () => {
    const saved = saveLocalProfile({
      displayName: "  Ada  ",
      handle: "@ada",
      bio: "  linear algebra  ",
      joinedAt: "2026-10-03T00:00:00.000Z",
    });
    expect(saved).toMatchObject({
      displayName: "Ada",
      handle: "ada",
      bio: "linear algebra",
    });
    expect(loadLocalProfile().handle).toBe("ada");
  });
});
