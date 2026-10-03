import type { Topic } from "@/entities/course/model/types";
import { linearAcademyBlocks } from "@/data/linearAcademy";
import { linearAcademyPitfallBlocks } from "@/data/linearAcademyPitfalls";

type TopicRegistry = Record<string, Topic>;
type TopicBlockRegistry = Record<string, Topic["blocks"]>;

function appendBlocks(target: TopicRegistry, source: TopicBlockRegistry) {
  Object.entries(source).forEach(([topicId, blocks]) => {
    const topic = target[topicId];
    if (!topic) return;
    topic.blocks.push(...blocks);
  });
}

export function enrichCourseTopics(baseTopics: TopicRegistry): TopicRegistry {
  const topics = Object.fromEntries(
    Object.entries(baseTopics).map(([topicId, topic]) => [
      topicId,
      { ...topic, blocks: [...topic.blocks] },
    ]),
  ) as TopicRegistry;

  appendBlocks(topics, linearAcademyBlocks);
  appendBlocks(topics, linearAcademyPitfallBlocks);

  return topics;
}
