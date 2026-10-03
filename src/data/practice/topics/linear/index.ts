import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./matrices";
import tasks02 from "./determinants";
import tasks03 from "./inverse-rank";
import tasks04 from "./linear-systems";

export const linearPractice: Record<string, PracticeTask[]> = {
  "matrices": tasks01,
  "determinants": tasks02,
  "inverse-rank": tasks03,
  "linear-systems": tasks04,
};
