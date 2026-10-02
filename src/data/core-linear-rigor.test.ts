import { describe, expect, it } from "vitest";
import { topics } from "@/data/course";
import { composeTopicWithSupplements } from "@/data/topic-supplements";
import { auditRigorousBlocks } from "@/entities/course/model/learning-architecture/rigor";

const coreTopics = [
  "inverse-rank",
  "linear-systems",
  "vectors",
  "dot-product",
  "cross-product",
  "mixed-product",
  "linear-spaces",
  "subspaces",
  "linear-maps",
  "eigenproblem",
  "linear-functionals",
  "quadratic-forms",
] as const;

describe("core linear mathematics rigor", () => {
  it.each(coreTopics)("%s has no unproved property/theorem blocks after composition", (topicId) => {
    const topic = composeTopicWithSupplements(topics[topicId]);
    const issues = auditRigorousBlocks(topic.blocks);
    expect(issues).toEqual([]);
  });
});
