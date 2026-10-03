import type { Topic } from "@/entities/course/model/types";
import topic01 from "./affine-spaces";
import topic02 from "./quadric-invariants";

const chapterTopics = [
  topic01,
  topic02,
];

export const affineGeneralTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
