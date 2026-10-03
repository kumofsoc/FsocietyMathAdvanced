import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./complex-functions";
import tasks02 from "./complex-integration";
import tasks03 from "./laurent-series";
import tasks04 from "./residues";

export const complexAnalysisPractice: Record<string, PracticeTask[]> = {
  "complex-functions": tasks01,
  "complex-integration": tasks02,
  "laurent-series": tasks03,
  "residues": tasks04,
};
