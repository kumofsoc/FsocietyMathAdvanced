import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./riemann-integral";
import tasks02 from "./newton-leibniz";
import tasks03 from "./improper-integrals";
import tasks04 from "./integral-applications";

export const defIntegralPractice: Record<string, PracticeTask[]> = {
  "riemann-integral": tasks01,
  "newton-leibniz": tasks02,
  "improper-integrals": tasks03,
  "integral-applications": tasks04,
};
