import type { Topic } from "@/entities/course/model/types";
import topic01 from "./riemann-integral";
import topic02 from "./newton-leibniz";
import topic03 from "./improper-integrals";
import topic04 from "./integral-applications";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
];

export const defIntegralTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
