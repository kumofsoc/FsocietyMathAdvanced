import { describe, expect, it } from "vitest";
import { practiceTaskIdsByTopic } from "@/data/practiceMeta";
import { loadPracticeForTopic, practiceLoaders } from "./loaders";

describe("practice loaders", () => {
  it("covers the same topics as practice metadata", () => {
    expect(Object.keys(practiceLoaders).sort()).toEqual(
      Object.keys(practiceTaskIdsByTopic).sort(),
    );
  });

  it("loads the exact task ids recorded by practice metadata", async () => {
    for (const topicId of Object.keys(practiceLoaders)) {
      const tasks = await loadPracticeForTopic(topicId);
      expect(tasks.map((task) => task.id)).toEqual(practiceTaskIdsByTopic[topicId]);
    }
  });
});
