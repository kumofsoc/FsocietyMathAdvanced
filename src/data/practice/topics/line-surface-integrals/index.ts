import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./line-integrals";
import tasks02 from "./surface-integrals";

export const lineSurfaceIntegralsPractice: Record<string, PracticeTask[]> = {
  "line-integrals": tasks01,
  "surface-integrals": tasks02,
};
