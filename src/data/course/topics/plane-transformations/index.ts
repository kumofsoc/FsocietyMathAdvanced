import type { Topic } from "@/entities/course/model/types";
import topic01 from "./mappings-transformations";
import topic02 from "./linear-transformations";
import topic03 from "./affine-transformations";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
];

export const planeTransformationsTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
