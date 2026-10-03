import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./ode-basics";
import tasks02 from "./first-order-ode";
import tasks03 from "./higher-order-ode";
import tasks04 from "./linear-ode";
import tasks05 from "./ode-systems";

export const odePractice: Record<string, PracticeTask[]> = {
  "ode-basics": tasks01,
  "first-order-ode": tasks02,
  "higher-order-ode": tasks03,
  "linear-ode": tasks04,
  "ode-systems": tasks05,
};
