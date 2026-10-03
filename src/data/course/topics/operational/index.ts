import type { Topic } from "@/entities/course/model/types";
import topic01 from "./laplace";
import topic02 from "./inverse-laplace";
import topic03 from "./laplace-ode";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
];

export const operationalTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
