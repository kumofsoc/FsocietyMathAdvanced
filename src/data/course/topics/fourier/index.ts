import type { Topic } from "@/entities/course/model/types";
import topic01 from "./fourier-series";
import topic02 from "./fourier-expansion";
import topic03 from "./fourier-integral";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
];

export const fourierTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
