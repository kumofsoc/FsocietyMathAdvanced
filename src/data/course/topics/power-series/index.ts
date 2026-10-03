import type { Topic } from "@/entities/course/model/types";
import topic01 from "./functional-series";
import topic02 from "./power-convergence";
import topic03 from "./taylor-series";
import topic04 from "./series-applications";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
];

export const powerSeriesTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
