import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./euclidean-spaces";
import tasks02 from "./euclidean-operators";
import tasks03 from "./euclidean-functions";
import tasks04 from "./unitary-spaces";

export const euclideanPractice: Record<string, PracticeTask[]> = {
  "euclidean-spaces": tasks01,
  "euclidean-operators": tasks02,
  "euclidean-functions": tasks03,
  "unitary-spaces": tasks04,
};
