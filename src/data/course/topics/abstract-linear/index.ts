import type { Topic } from "@/entities/course/model/types";
import topic01 from "./linear-spaces";
import topic02 from "./subspaces";
import topic03 from "./linear-maps";
import topic04 from "./eigenproblem";
import topic05 from "./linear-functionals";
import topic06 from "./quadratic-forms";
import topic07 from "./jordan-form";

const chapterTopics = [
  topic01,
  topic02,
  topic03,
  topic04,
  topic05,
  topic06,
  topic07,
];

export const abstractLinearTopics: Record<string, Topic> = Object.fromEntries(
  chapterTopics.map((topic) => [topic.id, topic]),
);
