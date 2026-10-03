import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./fourier-series";
import tasks02 from "./fourier-expansion";
import tasks03 from "./fourier-integral";

export const fourierPractice: Record<string, PracticeTask[]> = {
  "fourier-series": tasks01,
  "fourier-expansion": tasks02,
  "fourier-integral": tasks03,
};
