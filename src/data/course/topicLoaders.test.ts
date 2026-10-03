import { describe, expect, it } from "vitest";
import { topicMeta } from "@/data/courseMeta";
import { loadCourseTopic, topicLoaders } from "./topicLoaders";

describe("topic loaders", () => {
  it("covers the same topic ids as course metadata", () => {
    expect(Object.keys(topicLoaders).sort()).toEqual(Object.keys(topicMeta).sort());
  });

  it("loads every topic with the expected id", async () => {
    const loaded = await Promise.all(
      Object.keys(topicLoaders).map(async (topicId) => {
        const topic = await loadCourseTopic(topicId);
        return topic?.id;
      }),
    );

    expect(loaded.sort()).toEqual(Object.keys(topicLoaders).sort());
  });
});
