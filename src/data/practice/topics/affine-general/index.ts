import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./affine-spaces";
import tasks02 from "./quadric-invariants";

export const affineGeneralPractice: Record<string, PracticeTask[]> = {
  "affine-spaces": tasks01,
  "quadric-invariants": tasks02,
};
