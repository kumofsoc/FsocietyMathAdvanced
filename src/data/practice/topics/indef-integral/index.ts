import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./antiderivative";
import tasks02 from "./integration-methods";
import tasks03 from "./rational-integration";
import tasks04 from "./trig-integration";
import tasks05 from "./irrational-integration";

export const indefIntegralPractice: Record<string, PracticeTask[]> = {
  "antiderivative": tasks01,
  "integration-methods": tasks02,
  "rational-integration": tasks03,
  "trig-integration": tasks04,
  "irrational-integration": tasks05,
};
