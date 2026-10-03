import type { Topic } from "@/entities/course/model/types";
import topic01 from "./space-lines-planes";
import topic02 from "./quadrics";

const chapterTopics = [
  topic01,
  topic02,
];

export const spaceGeometryTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
