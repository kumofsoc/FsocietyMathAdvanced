import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./functional-series";
import tasks02 from "./power-convergence";
import tasks03 from "./taylor-series";
import tasks04 from "./series-applications";

export const powerSeriesPractice: Record<string, PracticeTask[]> = {
  "functional-series": tasks01,
  "power-convergence": tasks02,
  "taylor-series": tasks03,
  "series-applications": tasks04,
};
