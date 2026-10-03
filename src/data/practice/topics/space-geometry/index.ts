import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./space-lines-planes";
import tasks02 from "./quadrics";

export const spaceGeometryPractice: Record<string, PracticeTask[]> = {
  "space-lines-planes": tasks01,
  "quadrics": tasks02,
};
