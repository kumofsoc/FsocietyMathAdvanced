import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./complex-numbers";
import tasks02 from "./complex-operations";

export const complexPractice: Record<string, PracticeTask[]> = {
  "complex-numbers": tasks01,
  "complex-operations": tasks02,
};
