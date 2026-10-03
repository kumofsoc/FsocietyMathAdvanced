import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./numeric-series";
import tasks02 from "./positive-series";
import tasks03 from "./alternating-series";

export const seriesPractice: Record<string, PracticeTask[]> = {
  "numeric-series": tasks01,
  "positive-series": tasks02,
  "alternating-series": tasks03,
};
