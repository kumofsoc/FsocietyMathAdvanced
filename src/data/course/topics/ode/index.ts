import type { Topic } from "@/entities/course/model/types";
import topic01 from "./ode-basics";
import topic02 from "./first-order-ode";
import topic03 from "./higher-order-ode";
import topic04 from "./linear-ode";
import topic05 from "./ode-systems";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
  topic05,
];

export const odeTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
