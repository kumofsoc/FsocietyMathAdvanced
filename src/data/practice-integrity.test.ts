import { describe, expect, it } from "vitest";
import { practiceByTopic } from "@/data/practice";

function normalizedChoice(value: string) {
  return value
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, " ");
}

describe("practice bank integrity", () => {
  it("keeps every task renderable and answerable", () => {
    const issues: string[] = [];

    for (const [topicId, tasks] of Object.entries(practiceByTopic)) {
      for (const task of tasks) {
        const prefix = topicId + "/" + task.id;

        if (!task.id.trim()) issues.push(prefix + ": empty id");
        if (!task.title.trim()) issues.push(prefix + ": empty title");
        if (!task.prompt.trim()) issues.push(prefix + ": empty prompt");
        if (!task.answer.trim()) issues.push(prefix + ": empty answer");

        if (task.type === "choice") {
          const options = task.options ?? [];
          if (options.length < 2) {
            issues.push(prefix + ": choice task needs at least two options");
          }

          const normalizedOptions = options.map(normalizedChoice);
          if (new Set(normalizedOptions).size !== normalizedOptions.length) {
            issues.push(prefix + ": duplicate choice options");
          }

          if (!normalizedOptions.includes(normalizedChoice(task.answer))) {
            issues.push(prefix + ": correct answer is missing from options");
          }
        }

        if (
          task.type === "proof" &&
          !task.solution?.trim() &&
          !(task.rubric?.length)
        ) {
          issues.push(prefix + ": proof task has no solution or rubric for self-check");
        }
      }
    }

    expect(issues).toEqual([]);
  });
});
