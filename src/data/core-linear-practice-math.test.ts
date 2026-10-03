import { describe, expect, it } from "vitest";
import { practiceByTopic } from "@/data/practice";

type Matrix = number[][];

function normalizeMathText(value: string) {
  return value.replace(/[−–—]/g, "-").replace(/\s+/g, " ");
}

function numericMatrices(text: string): Matrix[] {
  return [...normalizeMathText(text).matchAll(/\[\[[\s\S]*?\]\]/g)]
    .map((match) => {
      try {
        const parsed = JSON.parse(match[0]) as unknown;
        if (
          !Array.isArray(parsed) ||
          !parsed.length ||
          !parsed.every(
            (row) =>
              Array.isArray(row) &&
              row.length > 0 &&
              row.every((value) => typeof value === "number" && Number.isFinite(value)),
          )
        ) {
          return null;
        }
        return parsed as Matrix;
      } catch {
        return null;
      }
    })
    .filter((matrix): matrix is Matrix => matrix !== null);
}

function multiply(left: Matrix, right: Matrix): Matrix {
  const rows = left.length;
  const inner = left[0]?.length ?? 0;
  const columns = right[0]?.length ?? 0;
  if (!rows || !inner || right.length !== inner || !columns) {
    throw new Error("incompatible matrices");
  }

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: columns }, (_, column) =>
      Array.from({ length: inner }, (__, index) => left[row][index] * right[index][column])
        .reduce((sum, value) => sum + value, 0),
    ),
  );
}

function determinant(matrix: Matrix): number {
  if (!matrix.length || matrix.some((row) => row.length !== matrix.length)) {
    throw new Error("determinant requires a square matrix");
  }

  const data = matrix.map((row) => [...row]);
  let sign = 1;
  let det = 1;

  for (let column = 0; column < data.length; column += 1) {
    let pivot = column;
    for (let row = column + 1; row < data.length; row += 1) {
      if (Math.abs(data[row][column]) > Math.abs(data[pivot][column])) pivot = row;
    }

    if (Math.abs(data[pivot][column]) < 1e-12) return 0;
    if (pivot !== column) {
      [data[pivot], data[column]] = [data[column], data[pivot]];
      sign *= -1;
    }

    const pivotValue = data[column][column];
    det *= pivotValue;

    for (let row = column + 1; row < data.length; row += 1) {
      const factor = data[row][column] / pivotValue;
      for (let index = column + 1; index < data.length; index += 1) {
        data[row][index] -= factor * data[column][index];
      }
    }
  }

  return Math.round(det * sign * 1e9) / 1e9;
}

function rank(matrix: Matrix): number {
  const data = matrix.map((row) => [...row]);
  if (!data.length) return 0;

  let pivotRow = 0;
  for (let column = 0; column < data[0].length && pivotRow < data.length; column += 1) {
    let pivot = pivotRow;
    for (let row = pivotRow + 1; row < data.length; row += 1) {
      if (Math.abs(data[row][column]) > Math.abs(data[pivot][column])) pivot = row;
    }

    if (Math.abs(data[pivot][column]) < 1e-10) continue;
    [data[pivot], data[pivotRow]] = [data[pivotRow], data[pivot]];

    const pivotValue = data[pivotRow][column];
    for (let index = column; index < data[pivotRow].length; index += 1) {
      data[pivotRow][index] /= pivotValue;
    }

    for (let row = 0; row < data.length; row += 1) {
      if (row === pivotRow) continue;
      const factor = data[row][column];
      for (let index = column; index < data[row].length; index += 1) {
        data[row][index] -= factor * data[pivotRow][index];
      }
    }

    pivotRow += 1;
  }

  return pivotRow;
}

function parseAnswerMatrix(answer: string) {
  return numericMatrices(answer)[0] ?? null;
}

describe("core linear practice math", () => {
  it("checks directly stated matrix products", () => {
    const issues: string[] = [];

    for (const task of practiceByTopic.matrices ?? []) {
      if (task.type !== "choice" || !task.prompt.includes("·")) continue;
      const matrices = numericMatrices(task.prompt);
      const answer = parseAnswerMatrix(task.answer);
      if (matrices.length !== 2 || !answer) continue;

      const expected = multiply(matrices[0], matrices[1]);
      if (JSON.stringify(answer) !== JSON.stringify(expected)) {
        issues.push(task.id + ": expected " + JSON.stringify(expected) + ", got " + task.answer);
      }
    }

    expect(issues).toEqual([]);
  });

  it("checks directly stated numeric determinants", () => {
    const issues: string[] = [];

    for (const task of practiceByTopic.determinants ?? []) {
      if (task.type !== "number" || !/\bdet\b/i.test(task.prompt)) continue;
      const matrix = numericMatrices(task.prompt)[0];
      if (!matrix) continue;

      const expected = determinant(matrix);
      const actual = Number(normalizeMathText(task.answer));
      if (!Number.isFinite(actual) || Math.abs(actual - expected) > 1e-9) {
        issues.push(task.id + ": expected " + expected + ", got " + task.answer);
      }
    }

    expect(issues).toEqual([]);
  });

  it("checks directly stated rank exercises", () => {
    const issues: string[] = [];

    for (const task of practiceByTopic["inverse-rank"] ?? []) {
      if (task.type !== "number" || !/ранг/i.test(task.prompt + " " + task.title)) continue;
      const matrix = numericMatrices(task.prompt)[0];
      if (!matrix) continue;

      const expected = rank(matrix);
      const actual = Number(normalizeMathText(task.answer));
      if (!Number.isFinite(actual) || actual !== expected) {
        issues.push(task.id + ": expected " + expected + ", got " + task.answer);
      }
    }

    expect(issues).toEqual([]);
  });
});
