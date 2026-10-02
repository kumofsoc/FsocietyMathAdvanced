import { describe, expect, it } from "vitest";
import { getThemeTone } from "./themeTone";

describe("getThemeTone", () => {
  it("classifies bright themes as light", () => {
    expect(getThemeTone("#f6f6f3")).toBe("light");
    expect(getThemeTone("#eff1f5")).toBe("light");
  });

  it("classifies dark themes as dark", () => {
    expect(getThemeTone("#050507")).toBe("dark");
    expect(getThemeTone("#1e1e2e")).toBe("dark");
  });
});
