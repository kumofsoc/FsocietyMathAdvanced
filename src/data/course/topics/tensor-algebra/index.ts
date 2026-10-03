import type { Topic } from "@/entities/course/model/types";
import topic01 from "./tensor-linear";
import topic02 from "./tensor-euclidean";
import topic03 from "./exterior-algebra";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
];

export const tensorAlgebraTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
