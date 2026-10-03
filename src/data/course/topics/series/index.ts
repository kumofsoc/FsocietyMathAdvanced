import type { Topic } from "@/entities/course/model/types";
import topic01 from "./numeric-series";
import topic02 from "./positive-series";
import topic03 from "./alternating-series";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
];

export const seriesTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
