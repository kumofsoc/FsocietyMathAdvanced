import { readLocalStorage, writeLocalStorage } from "@/shared/lib/browserStorage";

export type ReadingWidth = "narrow" | "normal" | "wide";

export const READING_WIDTH_KEY = "visualmath-reading-width-v1";

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

export function saveReadingWidth(value: ReadingWidth) {
  return writeLocalStorage(READING_WIDTH_KEY, value);
}
