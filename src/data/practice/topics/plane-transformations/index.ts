import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./mappings-transformations";
import tasks02 from "./linear-transformations";
import tasks03 from "./affine-transformations";

export const planeTransformationsPractice: Record<string, PracticeTask[]> = {
  "mappings-transformations": tasks01,
  "linear-transformations": tasks02,
  "affine-transformations": tasks03,
};
