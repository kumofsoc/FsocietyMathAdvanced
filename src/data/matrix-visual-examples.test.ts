import { describe, expect, it } from "vitest";
import { topics } from "@/data/course";

describe("visual math examples", () => {
  it("renders elementary row operations as before-operation-after scenes", () => {
    const titles = [
      "Пример 1.12 · Умножение строки",
      "Пример 1.13 · Прибавление кратной строки",
      "Пример 1.14 · Перестановка строк",
    ];

    for (const title of titles) {
      const block = topics.matrices.blocks.find((item) => item.title === title);
      expect(block?.matrixOperation, title).toBeDefined();
      expect(block?.matrixOperation?.before, title).toMatch(/^\[\[/);
      expect(block?.matrixOperation?.after, title).toMatch(/^\[\[/);
      expect(block?.matrixOperation?.operation, title).toBeTruthy();
      expect(block?.matrixOperation?.explanation, title).toBeTruthy();
    }
  });

  it("gives every numbered determinant property at least two worked examples", () => {
    const properties = topics.determinants.blocks.filter(
      (block) => block.kind === "property" && /Свойство [1-8]/.test(block.title),
    );

    expect(properties).toHaveLength(8);
    for (const property of properties) {
      expect(property.workedExamples?.length ?? 0, property.title).toBeGreaterThanOrEqual(2);
    }
  });
});
