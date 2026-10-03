import type { Topic } from "@/entities/course/model/types";
import topic01 from "./double-integral";
import topic02 from "./triple-integral";

const chapterTopics = [
  topic01,
  topic02,
];

export const multipleIntegralsTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
