import type { Topic } from "@/entities/course/model/types";
import topic01 from "./matrices";
import topic02 from "./determinants";
import topic03 from "./inverse-rank";
import topic04 from "./linear-systems";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
];

export const linearTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
