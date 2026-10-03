import type { ContentBlock, Topic } from "@/entities/course/model/types";

export type BlockPatch = Pick<
  ContentBlock,
  "proofs" | "workedExamples" | "statements" | "matrixOperation"
>;

export type TopicPatches = Record<string, BlockPatch>;

export function applyTopicPatches(topic: Topic, patches?: TopicPatches): Topic {
  if (!patches) return topic;

  return {
    ...topic,
    blocks: topic.blocks.map((block) => {
      const patch = patches[block.title];
      return patch ? { ...block, ...patch } : block;
    }),
  };
}
