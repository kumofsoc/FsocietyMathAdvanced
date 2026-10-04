import { describe, expect, it } from "vitest";
import { selectBackgroundStorageMode } from "./backgroundAudio";

describe("background media capability switching", () => {
  it("keeps anonymous users on IndexedDB even if server supports media", () => {
    expect(selectBackgroundStorageMode(false, true)).toBe("local");
  });

  it("keeps authenticated users local when capability is disabled", () => {
    expect(selectBackgroundStorageMode(true, false)).toBe("local");
  });

  it("uses account media only when auth and runtime capability are both true", () => {
    expect(selectBackgroundStorageMode(true, true)).toBe("server");
  });
});
