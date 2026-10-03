import { describe, expect, it } from "vitest";
import type { PracticeTask } from "@/entities/course/model/types";
import { practiceAnswersMatch } from "./practiceAnswer";

function task(overrides: Partial<PracticeTask>): PracticeTask {
  return {
    id: "test",
    title: "Test",
    prompt: "Test",
    type: "text",
    answer: "answer",
    ...overrides,
  };
}

describe("practiceAnswersMatch", () => {
  it("keeps mathematical identifiers case-sensitive in choice tasks", () => {
    const item = task({
      type: "choice",
      answer: "F(b)−F(a)",
      options: ["F(b)−F(a)", "f(b)−f(a)"],
    });

    expect(practiceAnswersMatch(item, "F(b)−F(a)")).toBe(true);
    expect(practiceAnswersMatch(item, "f(b)−f(a)")).toBe(false);
  });

  it("accepts equivalent simple numeric input", () => {
    const item = task({ type: "number", answer: "1/2" });

    expect(practiceAnswersMatch(item, "0,5")).toBe(true);
    expect(practiceAnswersMatch(item, " 0.500 ")).toBe(true);
    expect(practiceAnswersMatch(item, "0.6")).toBe(false);
  });

  it("normalizes typography for free-text answers", () => {
    const item = task({ type: "text", answer: "A − B" });

    expect(practiceAnswersMatch(item, "a - b")).toBe(true);
  });
});
