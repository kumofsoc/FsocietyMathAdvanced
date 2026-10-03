export type HomeMotionTier = "cinematic" | "reduced" | "static";

export type MotionProfile = "full" | "balanced" | "eco" | "off";

export const MOTION_PROFILE_KEY = "fsociety-motion-profile-v1";
export const MOTION_CHANGE_EVENT = "fsociety-motion-change";

export interface HomeMotionEnvironment {
  profile: MotionProfile;
  reducedMotion: boolean;
  mobile: boolean;
  coarsePointer: boolean;
}

export function parseMotionProfile(value: string | null): MotionProfile {
  return value === "full" || value === "balanced" || value === "eco" || value === "off"
    ? value
    : "balanced";
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
