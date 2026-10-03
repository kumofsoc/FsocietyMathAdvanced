import type { PracticeTask } from "@/entities/course/model/types";

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, " ");
}

function parseSimpleNumber(value: string) {
  const normalized = normalizeText(value).replace(/\s/g, "");

  if (/^[+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:e[+-]?\d+)?$/.test(normalized)) {
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const fraction = normalized.match(
    /^([+-]?(?:\d+(?:\.\d+)?|\.\d+))\/([+-]?(?:\d+(?:\.\d+)?|\.\d+))$/,
  );
  if (!fraction) return null;

  const numerator = Number(fraction[1]);
  const denominator = Number(fraction[2]);
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

export function practiceAnswersMatch(task: PracticeTask, value: string) {
  if (task.type === "choice") {
    // The value is selected directly from task.options. Exact comparison keeps
    // mathematically meaningful case distinctions such as F versus f.
    return value === task.answer;
  }

  if (task.type !== "number") {
    return normalizeText(value) === normalizeText(task.answer);
  }

  const actual = parseSimpleNumber(value);
  const expected = parseSimpleNumber(task.answer);
  if (actual === null || expected === null) {
    return normalizeText(value) === normalizeText(task.answer);
  }

  const scale = Math.max(1, Math.abs(expected));
  return Math.abs(actual - expected) <= 1e-9 * scale;
}
