import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./tensor-linear";
import tasks02 from "./tensor-euclidean";
import tasks03 from "./exterior-algebra";

export const tensorAlgebraPractice: Record<string, PracticeTask[]> = {
  "tensor-linear": tasks01,
  "tensor-euclidean": tasks02,
  "exterior-algebra": tasks03,
};
