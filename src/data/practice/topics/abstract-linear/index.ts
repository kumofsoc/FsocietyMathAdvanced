import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./linear-spaces";
import tasks02 from "./subspaces";
import tasks03 from "./linear-maps";
import tasks04 from "./eigenproblem";
import tasks05 from "./linear-functionals";
import tasks06 from "./quadratic-forms";
import tasks07 from "./jordan-form";

export const abstractLinearPractice: Record<string, PracticeTask[]> = {
  "linear-spaces": tasks01,
  "subspaces": tasks02,
  "linear-maps": tasks03,
  "eigenproblem": tasks04,
  "linear-functionals": tasks05,
  "quadratic-forms": tasks06,
  "jordan-form": tasks07,
};
