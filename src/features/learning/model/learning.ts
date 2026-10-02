export const THEORY_KEY = "fsociety-theory-read-v2";
export const SOLVED_KEY = "fsociety-solved-tasks-v2";
export const SAVED_THEOREMS_KEY = "fsociety-saved-theorems-v1";
export const READING_PROGRESS_KEY = "visualmath-reading-progress-v1";
export const LEARNING_EVENT = "fsociety-learning-change";

export interface SavedTheorem {
  id: string;
  topicId: string;
  topicTitle: string;
  title: string;
  body: string;
  formula?: string;
}

export function loadSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

export function saveSet(key: string, value: Set<string>) {
  try {
    localStorage.setItem(key, JSON.stringify([...value]));
  } catch (error) {
    console.warn("[FsocietyMath] could not persist learning set", error);
  }
  window.dispatchEvent(new CustomEvent(LEARNING_EVENT));
}

export function loadSavedTheorems(): SavedTheorem[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_THEOREMS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveTheorems(value: SavedTheorem[]) {
  try {
    localStorage.setItem(SAVED_THEOREMS_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn("[FsocietyMath] could not persist saved theorems", error);
  }
  window.dispatchEvent(new CustomEvent(LEARNING_EVENT));
}


export function loadReadingProgress(): Record<string, number> {
  try {
    const parsed = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || "{}") as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => typeof value === "number" && Number.isFinite(value))
        .map(([topicId, value]) => [topicId, Math.min(1, Math.max(0, Number(value)))]),
    );
  } catch {
    return {};
  }
}

export function saveReadingProgress(topicId: string, ratio: number) {
  const nextRatio = Math.min(1, Math.max(0, ratio));
  const current = loadReadingProgress();
  const previous = current[topicId] ?? 0;
  if (nextRatio <= previous) return previous;

  const next = { ...current, [topicId]: nextRatio };
  try {
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("[VisualMath] could not persist reading progress", error);
  }
  window.dispatchEvent(new CustomEvent(LEARNING_EVENT));
  return nextRatio;
}
