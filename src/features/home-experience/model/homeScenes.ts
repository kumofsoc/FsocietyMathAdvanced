export const HOME_SCENES = [
  { id: "arrival", code: "00", label: "ГЛАВНАЯ" },
  { id: "status", code: "01", label: "ПРОГРЕСС" },
  { id: "universe", code: "02", label: "КАРТА КУРСА" },
  { id: "growth", code: "03", label: "ИСТОРИЯ ПРОЕКТА" },
  { id: "dna", code: "04", label: "ВОЗМОЖНОСТИ" },
  { id: "motion", code: "05", label: "ВИЗУАЛИЗАЦИИ" },
  { id: "archive", code: "06", label: "АРХИВ ИДЕЙ" },
  { id: "personal", code: "07", label: "ПРОФИЛЬ" },
  { id: "portal", code: "08", label: "ПРОДОЛЖИТЬ" },
] as const;

export type HomeSceneId = (typeof HOME_SCENES)[number]["id"];
