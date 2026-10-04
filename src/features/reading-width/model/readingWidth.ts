import { readLocalStorage, writeLocalStorage } from "@/shared/lib/browserStorage";

export type ReadingWidth = "narrow" | "normal" | "wide";

export const READING_WIDTH_KEY = "visualmath-reading-width-v1";
export const READING_WIDTH_EVENT = "visualmath:reading-width-change";
export const READING_WIDTH_DIRTY_KEY = "visualmath-reading-width-dirty-v1";

export const readingWidthOptions: Array<{
  id: ReadingWidth;
  label: string;
  description: string;
}> = [
  { id: "narrow", label: "Узко", description: "Короткая строка для плотного чтения" },
  { id: "normal", label: "Нормально", description: "Стандартная ширина VisualMath" },
  { id: "wide", label: "Широко", description: "Больше текста в строке" },
];

export function loadReadingWidth(): ReadingWidth {
  const value = readLocalStorage(READING_WIDTH_KEY);
  return value === "narrow" || value === "wide" || value === "normal"
    ? value
    : "normal";
}

function persistReadingWidth(value: ReadingWidth, markDirty: boolean) {
  const saved = writeLocalStorage(READING_WIDTH_KEY, value);
  if (saved) {
    writeLocalStorage(READING_WIDTH_DIRTY_KEY, markDirty ? "1" : "0");
  }
  if (saved && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(READING_WIDTH_EVENT, { detail: value }));
  }
  return saved;
}

export function saveReadingWidth(value: ReadingWidth) {
  return persistReadingWidth(value, true);
}

export function hydrateReadingWidth(value: ReadingWidth) {
  return persistReadingWidth(value, false);
}

export function readingWidthIsDirty() {
  return readLocalStorage(READING_WIDTH_DIRTY_KEY) === "1";
}
