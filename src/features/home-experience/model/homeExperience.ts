export type HomeMotionTier = "cinematic" | "reduced" | "static";

export interface HomeMotionEnvironment {
  profile: "full" | "balanced" | "eco" | "off";
  reducedMotion: boolean;
  mobile: boolean;
  coarsePointer: boolean;
}

export function getHomeMotionMode(_env: HomeMotionEnvironment): HomeMotionTier {
  return "static";
}

export function shouldUsePointerDepth(_env: HomeMotionEnvironment): boolean {
  return false;
}
