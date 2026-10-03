import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./laplace";
import tasks02 from "./inverse-laplace";
import tasks03 from "./laplace-ode";

export const operationalPractice: Record<string, PracticeTask[]> = {
  "laplace": tasks01,
  "inverse-laplace": tasks02,
  "laplace-ode": tasks03,
};
