import type { Topic } from "@/entities/course/model/types";
import topic01 from "./multivariable-functions";
import topic02 from "./partial-derivatives";
import topic03 from "./tangent-plane";
import topic04 from "./multivariable-extrema";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
];

export const multivariableTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
