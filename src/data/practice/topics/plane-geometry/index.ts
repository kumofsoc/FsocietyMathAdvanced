import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./plane-coordinates";
import tasks02 from "./plane-lines";
import tasks03 from "./conics";

export const planeGeometryPractice: Record<string, PracticeTask[]> = {
  "plane-coordinates": tasks01,
  "plane-lines": tasks02,
  "conics": tasks03,
};
