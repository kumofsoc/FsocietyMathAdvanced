export const THEORY_KEY = "fsociety-theory-read-v2";
export const SOLVED_KEY = "fsociety-solved-tasks-v2";
export const SAVED_THEOREMS_KEY = "fsociety-saved-theorems-v1";
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
