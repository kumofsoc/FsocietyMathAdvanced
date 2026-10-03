import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./field-basics";
import tasks02 from "./scalar-field";
import tasks03 from "./vector-field";
import tasks04 from "./hamilton-operator";

export const fieldTheoryPractice: Record<string, PracticeTask[]> = {
  "field-basics": tasks01,
  "scalar-field": tasks02,
  "vector-field": tasks03,
  "hamilton-operator": tasks04,
};
