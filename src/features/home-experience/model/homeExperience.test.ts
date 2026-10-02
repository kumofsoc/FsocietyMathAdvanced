import { describe, expect, it } from "vitest";
import {
  getHomeMotionMode,
  shouldUsePointerDepth,
  type HomeMotionEnvironment,
} from "./homeExperience";

const base: HomeMotionEnvironment = {
  profile: "balanced",
  reducedMotion: false,
  mobile: false,
  coarsePointer: false,
};

describe("home experience capability model", () => {
  it("uses cinematic motion for full and balanced desktop profiles", () => {
    expect(getHomeMotionMode({ ...base, profile: "balanced" })).toBe("cinematic");
    expect(getHomeMotionMode({ ...base, profile: "full" })).toBe("cinematic");
  });

  it("reduces decorative motion for eco", () => {
    expect(getHomeMotionMode({ ...base, profile: "eco" })).toBe("reduced");
  });

  it("disables automatic cinematic motion for off and reduced-motion", () => {
    expect(getHomeMotionMode({ ...base, profile: "off" })).toBe("static");
    expect(getHomeMotionMode({ ...base, reducedMotion: true })).toBe("static");
  });

  it("does not use cinematic motion on mobile even when the profile is full", () => {
    expect(getHomeMotionMode({ ...base, profile: "full", mobile: true })).toBe("reduced");
  });

  it("enables pointer depth only on capable cinematic desktop pointers", () => {
    expect(shouldUsePointerDepth(base)).toBe(true);
    expect(shouldUsePointerDepth({ ...base, coarsePointer: true })).toBe(false);
    expect(shouldUsePointerDepth({ ...base, mobile: true })).toBe(false);
    expect(shouldUsePointerDepth({ ...base, profile: "eco" })).toBe(false);
    expect(shouldUsePointerDepth({ ...base, profile: "off" })).toBe(false);
    expect(shouldUsePointerDepth({ ...base, reducedMotion: true })).toBe(false);
  });
});
