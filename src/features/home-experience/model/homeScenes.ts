export const HOME_SCENES = [
  { id: "arrival", code: "00", label: "ARRIVAL" },
  { id: "status", code: "01", label: "SYSTEM STATUS" },
  { id: "universe", code: "02", label: "COURSE UNIVERSE" },
  { id: "growth", code: "03", label: "SIGNAL EXPANSION" },
  { id: "dna", code: "04", label: "INTERFACE DNA" },
  { id: "motion", code: "05", label: "MOTION LAB" },
  { id: "archive", code: "06", label: "ARCHIVE 3026" },
  { id: "personal", code: "07", label: "PERSONAL SYSTEM" },
  { id: "portal", code: "08", label: "PORTAL" },
] as const;

export type HomeSceneId = (typeof HOME_SCENES)[number]["id"];
