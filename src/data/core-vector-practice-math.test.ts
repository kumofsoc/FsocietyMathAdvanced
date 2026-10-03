import { describe, expect, it } from "vitest";
import { practiceByTopic } from "@/data/practice";

type Vector = number[];

function normalized(value: string) {
  return value.replace(/[−–—]/g, "-").replace(/,/g, ".").trim();
}

function numericVectors(text: string): Vector[] {
  return [...text.matchAll(/\(([^()]*)\)/g)]
    .map((match) => {
      const raw = match[1].replace(/[−–—]/g, "-").trim();
      if (!/^[+\-\d.,\s]+$/.test(raw)) return null;
      const values = raw.split(",").map((item) => Number(item.trim()));
      return values.length > 0 && values.every(Number.isFinite) ? values : null;
    })
    .filter((vector): vector is Vector => vector !== null);
}

function vectorAnswer(answer: string) {
  return numericVectors(answer)[0] ?? null;
}

function dot(left: Vector, right: Vector) {
  return left.reduce((sum, value, index) => sum + value * right[index], 0);
}

function cross(left: Vector, right: Vector): Vector {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0],
  ];
}

function mixed(a: Vector, b: Vector, c: Vector) {
  return dot(a, cross(b, c));
}

describe("core vector practice math", () => {
  it("checks explicit vector addition and scalar multiplication", () => {
    const issues: string[] = [];

    for (const task of practiceByTopic.vectors ?? []) {
      const vectors = numericVectors(task.prompt);
      const answer = vectorAnswer(task.answer);
      if (!answer) continue;

      if (task.prompt.includes("a+b") && vectors.length >= 2) {
        const expected = vectors[0].map((value, index) => value + vectors[1][index]);
        if (JSON.stringify(answer) !== JSON.stringify(expected)) {
          issues.push(task.id + ": incorrect vector sum");
        }
      }

      const scalarMatch = normalized(task.prompt).match(/вычисли\s*([+-]?\d+(?:\.\d+)?)a/i);
      if (scalarMatch && vectors.length >= 1) {
        const scalar = Number(scalarMatch[1]);
        const expected = vectors[0].map((value) => scalar * value);
        if (JSON.stringify(answer) !== JSON.stringify(expected)) {
          issues.push(task.id + ": incorrect scalar multiple");
        }
      }
    }

    expect(issues).toEqual([]);
  });

  it("checks explicit dot products", () => {
    const issues: string[] = [];

    for (const task of practiceByTopic["dot-product"] ?? []) {
      if (task.type !== "number" || !task.prompt.includes("·")) continue;
      const vectors = numericVectors(task.prompt);
      if (vectors.length < 2) continue;

      const expected = dot(vectors[0], vectors[1]);
      const actual = Number(normalized(task.answer));
      if (!Number.isFinite(actual) || actual !== expected) {
        issues.push(task.id + ": expected " + expected + ", got " + task.answer);
      }
    }

    expect(issues).toEqual([]);
  });

  it("checks explicit cross products", () => {
    const issues: string[] = [];

    for (const task of practiceByTopic["cross-product"] ?? []) {
      if (!task.prompt.includes("×")) continue;
      const vectors = numericVectors(task.prompt);
      const answer = vectorAnswer(task.answer);
      if (vectors.length < 2 || !answer) continue;

      const expected = cross(vectors[0], vectors[1]);
      if (JSON.stringify(answer) !== JSON.stringify(expected)) {
        issues.push(task.id + ": expected " + JSON.stringify(expected) + ", got " + task.answer);
      }
    }

    expect(issues).toEqual([]);
  });

  it("checks explicit mixed products", () => {
    const issues: string[] = [];

    for (const task of practiceByTopic["mixed-product"] ?? []) {
      if (task.type !== "number" || !/вычисли/i.test(task.prompt)) continue;
      const vectors = numericVectors(task.prompt);
      if (vectors.length < 3) continue;

      const expected = mixed(vectors[0], vectors[1], vectors[2]);
      const actual = Number(normalized(task.answer));
      if (!Number.isFinite(actual) || actual !== expected) {
        issues.push(task.id + ": expected " + expected + ", got " + task.answer);
      }
    }

    expect(issues).toEqual([]);
  });
});
