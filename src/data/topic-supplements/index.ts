import type { Topic } from "@/entities/course/model/types";
import { vectorFoundationSupplement } from "./vectors";
import { linearSpacesSupplement } from "./linear-spaces";
import { enrichRigorousTopic } from "@/data/topic-enrichments";
import { promoteLegacyRigor } from "@/entities/course/model/learning-architecture/rigor";

const topicSupplements = {
  vectors: vectorFoundationSupplement.map((block) => ({ ...block, source: "supplement" as const })),
  "linear-spaces": linearSpacesSupplement.map((block) => ({ ...block, source: "supplement" as const })),
} as const;

export function getTopicSupplement(topicId: string) {
  return topicSupplements[topicId as keyof typeof topicSupplements] ?? [];
}

export function composeTopicWithSupplements(topic: Topic): Topic {
  const enriched = enrichRigorousTopic(topic);
  const supplement = getTopicSupplement(topic.id);
  const blocks = promoteLegacyRigor(
    supplement.length ? [...enriched.blocks, ...supplement] : enriched.blocks,
  );

  return {
    ...enriched,
    blocks,
  };
}
