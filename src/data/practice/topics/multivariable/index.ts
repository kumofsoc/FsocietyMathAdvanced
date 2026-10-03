import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./multivariable-functions";
import tasks02 from "./partial-derivatives";
import tasks03 from "./tangent-plane";
import tasks04 from "./multivariable-extrema";

export const multivariablePractice: Record<string, PracticeTask[]> = {
  "multivariable-functions": tasks01,
  "partial-derivatives": tasks02,
  "tangent-plane": tasks03,
  "multivariable-extrema": tasks04,
};
