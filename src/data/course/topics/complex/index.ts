import type { Topic } from "@/entities/course/model/types";
import topic01 from "./complex-numbers";
import topic02 from "./complex-operations";

const chapterTopics = [
  topic01,
  topic02,
];

export const complexTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
