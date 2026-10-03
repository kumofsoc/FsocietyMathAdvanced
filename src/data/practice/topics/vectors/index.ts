import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./vectors";
import tasks02 from "./dot-product";
import tasks03 from "./cross-product";
import tasks04 from "./mixed-product";

export const vectorsPractice: Record<string, PracticeTask[]> = {
  "vectors": tasks01,
  "dot-product": tasks02,
  "cross-product": tasks03,
  "mixed-product": tasks04,
};
