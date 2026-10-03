import type { Topic } from "@/entities/course/model/types";
import topic01 from "./euclidean-spaces";
import topic02 from "./euclidean-operators";
import topic03 from "./euclidean-functions";
import topic04 from "./unitary-spaces";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
];

export const euclideanTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
