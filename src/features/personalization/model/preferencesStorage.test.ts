import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_DIRTY_KEY,
  hydrateLocalPreferences,
  loadLocalPreferences,
  localPreferencesAreDirty,
  emitPreferencesChange,
} from "./preferencesStorage";

describe("preferences storage", () => {
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

  it("returns backend-compatible defaults", () => {
    expect(loadLocalPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("marks local changes as dirty", () => {
    emitPreferencesChange();
    expect(localStorage.getItem(PREFERENCES_DIRTY_KEY)).toBe("1");
    expect(localPreferencesAreDirty()).toBe(true);
  });

  it("hydrates canonical preferences and clears dirty state", () => {
    emitPreferencesChange();
    const next = {
      ...DEFAULT_PREFERENCES,
      themeName: "Nord" as const,
      cursorMode: "minimal" as const,
      motionProfile: "eco" as const,
      sidebarCollapsed: true,
    };

    expect(hydrateLocalPreferences(next)).toBe(true);
    expect(loadLocalPreferences()).toEqual(next);
    expect(localPreferencesAreDirty()).toBe(false);
  });
});
