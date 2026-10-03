import type { Topic } from "@/entities/course/model/types";
import topic01 from "./plane-coordinates";
import topic02 from "./plane-lines";
import topic03 from "./conics";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
];

export const planeGeometryTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
