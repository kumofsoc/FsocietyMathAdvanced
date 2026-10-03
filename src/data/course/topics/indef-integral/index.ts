import type { Topic } from "@/entities/course/model/types";
import topic01 from "./antiderivative";
import topic02 from "./integration-methods";
import topic03 from "./rational-integration";
import topic04 from "./trig-integration";
import topic05 from "./irrational-integration";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
  topic05,
];

export const indefIntegralTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
