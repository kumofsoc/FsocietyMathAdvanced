import { describe, expect, it } from "vitest";
import type { Topic } from "@/entities/course/model/types";
import { normalizeTopicSearchText, searchTopicBlocks } from "./topicSearch";

const topic: Topic = {
  id: "test",
  number: "1.0",
  title: "Тест",
  chapterId: "linear",
  summary: "Тестовая тема",
  prerequisites: [],
  blocks: [
    {
      kind: "definition",
      title: "Определение ранга",
      body: "Ранг матрицы — максимальный порядок ненулевого минора.",
    },
    {
      kind: "theorem",
      title: "Теорема о ранге",
      body: "Ранг равен размерности пространства строк.",
      formula: "\\operatorname{rank} A = r",
      proofs: [
        {
          label: "Доказательство",
          body: "Используем линейную независимость строк.",
        },
      ],
    },
    {
      kind: "example",
      title: "Пример",
      body: "Найдём ранг конкретной матрицы.",
      items: ["Вычисляем миноры второго порядка"],
    },
  ],
};

describe("topic local search", () => {
  it("normalizes Russian text and lightweight LaTeX syntax", () => {
    expect(normalizeTopicSearchText("Ёж \\operatorname{rank}_{A}")).toContain("еж");
    expect(normalizeTopicSearchText("Ёж \\operatorname{rank}_{A}")).toContain("rank");
  });

  it("prioritizes title matches", () => {
    const results = searchTopicBlocks(topic, "ранга");
    expect(results[0]?.title).toBe("Определение ранга");
  });

  it("finds nested proof and item text", () => {
    expect(searchTopicBlocks(topic, "независимость")[0]?.kind).toBe("theorem");
    expect(searchTopicBlocks(topic, "миноры")[0]?.kind).toBe("example");
  });

  it("does not search one-character noise", () => {
    expect(searchTopicBlocks(topic, "р")).toEqual([]);
  });
});
