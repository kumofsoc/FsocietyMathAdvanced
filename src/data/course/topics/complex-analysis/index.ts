import type { Topic } from "@/entities/course/model/types";
import topic01 from "./complex-functions";
import topic02 from "./complex-integration";
import topic03 from "./laurent-series";
import topic04 from "./residues";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
];

export const complexAnalysisTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
