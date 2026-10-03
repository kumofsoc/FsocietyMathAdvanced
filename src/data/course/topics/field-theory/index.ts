import type { Topic } from "@/entities/course/model/types";
import topic01 from "./field-basics";
import topic02 from "./scalar-field";
import topic03 from "./vector-field";
import topic04 from "./hamilton-operator";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
];

export const fieldTheoryTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
