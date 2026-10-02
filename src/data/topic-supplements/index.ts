import type { Topic } from "@/entities/course/model/types";
import { vectorFoundationSupplement } from "./vectors";
import { linearSpacesSupplement } from "./linear-spaces";

const topicSupplements = {
  vectors: vectorFoundationSupplement,
  "linear-spaces": linearSpacesSupplement
} as const;

export function getTopicSupplement(topicId: string) {
  return topicSupplements[topicId as keyof typeof topicSupplements] ?? [];
}

export function composeTopicWithSupplements(topic: Topic): Topic {
  const supplement = getTopicSupplement(topic.id);
  if (!supplement.length) return topic;

  return {
    ...topic,
    blocks: [...topic.blocks, ...supplement]
  };
}
