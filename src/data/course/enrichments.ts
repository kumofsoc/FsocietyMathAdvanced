import type { Topic } from "@/entities/course/model/types";
import { linearAcademyBlocks } from "@/data/linearAcademy";
import { linearAcademyPitfallBlocks } from "@/data/linearAcademyPitfalls";

type TopicRegistry = Record<string, Topic>;
export function enrichTopic(topic: Topic): Topic {
  return {
    ...topic,
    blocks: [
      ...topic.blocks,
      ...(linearAcademyBlocks[topic.id] ?? []),
      ...(linearAcademyPitfallBlocks[topic.id] ?? []),
    ],
  };
}

export function enrichCourseTopics(baseTopics: TopicRegistry): TopicRegistry {
  const topics = Object.fromEntries(
    Object.entries(baseTopics).map(([topicId, topic]) => [
      topicId,
      enrichTopic(topic),
    ]),
  ) as TopicRegistry;

  return topics;
}
