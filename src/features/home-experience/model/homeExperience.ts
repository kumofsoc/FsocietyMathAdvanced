export type HomeMotionTier = "cinematic" | "reduced" | "static";

export interface HomeMotionEnvironment {
  profile: "full" | "balanced" | "eco" | "off";
  reducedMotion: boolean;
  mobile: boolean;
  coarsePointer: boolean;
}

export function getHomeMotionMode(env: HomeMotionEnvironment): HomeMotionTier {
  if (env.profile === "off" || env.reducedMotion) return "static";
  if (env.profile === "eco" || env.mobile) return "reduced";
  return "cinematic";
}

export function shouldUsePointerDepth(env: HomeMotionEnvironment): boolean {
  return (
    getHomeMotionMode(env) === "cinematic" &&
    !env.mobile &&
    !env.coarsePointer
  );
}
