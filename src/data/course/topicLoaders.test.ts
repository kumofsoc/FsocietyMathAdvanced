import { describe, expect, it } from "vitest";
import { topics } from "@/data/course";
import { topicMeta } from "@/data/courseMeta";
import { composeTopicWithSupplements } from "@/data/topic-supplements";
import { loadCourseTopic, topicLoaders } from "./topicLoaders";

describe("topic loaders", () => {
  it("covers the same topic ids as course metadata", () => {
    expect(Object.keys(topicLoaders).sort()).toEqual(Object.keys(topicMeta).sort());
  });

  it("loads every topic with the same enriched content as the full registry", async () => {
    for (const topicId of Object.keys(topicLoaders)) {
      const topic = await loadCourseTopic(topicId);
      expect(topic).toEqual(composeTopicWithSupplements(topics[topicId]));
    }
  });
});
