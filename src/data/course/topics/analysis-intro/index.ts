import type { Topic } from "@/entities/course/model/types";
import topic01 from "./sets-reals";
import topic02 from "./functions";
import topic03 from "./sequences";
import topic04 from "./limits";
import topic05 from "./infinitesimals";
import topic06 from "./continuity";
import topic07 from "./derivative";
import topic08 from "./differential";
import topic09 from "./function-study";
import topic10 from "./taylor";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
  topic05,
  topic06,
  topic07,
  topic08,
  topic09,
  topic10,
];

export const analysisIntroTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
