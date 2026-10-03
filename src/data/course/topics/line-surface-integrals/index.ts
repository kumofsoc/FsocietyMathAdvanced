import type { Topic } from "@/entities/course/model/types";
import topic01 from "./line-integrals";
import topic02 from "./surface-integrals";

const chapterTopics = [
  topic01,
  topic02,
];

export const lineSurfaceIntegralsTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
