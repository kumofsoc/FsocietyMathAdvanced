import type { Topic } from "@/entities/course/model/types";
import topic01 from "./vectors";
import topic02 from "./dot-product";
import topic03 from "./cross-product";
import topic04 from "./mixed-product";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
];

export const vectorsTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
