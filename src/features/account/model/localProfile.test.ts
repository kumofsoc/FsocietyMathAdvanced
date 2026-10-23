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
    expect(loadLocalProfile().displayName).toBe("MathMaMath User");
    expect(localStorage.getItem(LOCAL_PROFILE_KEY)).toBeTruthy();
  });

  it("migrates only the old generated profile name", () => {
    const legacy = {
      displayName: "VisualMath User",
      handle: "visual-learner",
      bio: "bio",
      joinedAt: "2026-10-03T00:00:00.000Z",
    };
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(legacy));
    expect(loadLocalProfile().displayName).toBe("MathMaMath User");
    expect(JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) || "{}").displayName).toBe("MathMaMath User");
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify({ ...legacy, displayName: "VisualMath User 2" }));
    expect(loadLocalProfile().displayName).toBe("VisualMath User 2");
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
