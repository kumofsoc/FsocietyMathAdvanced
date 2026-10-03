import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./double-integral";
import tasks02 from "./triple-integral";

export const multipleIntegralsPractice: Record<string, PracticeTask[]> = {
  "double-integral": tasks01,
  "triple-integral": tasks02,
};
