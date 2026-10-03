import type { PracticeTask } from "@/entities/course/model/types";
import tasks01 from "./sets-reals";
import tasks02 from "./functions";
import tasks03 from "./sequences";
import tasks04 from "./limits";
import tasks05 from "./infinitesimals";
import tasks06 from "./continuity";
import tasks07 from "./derivative";
import tasks08 from "./differential";
import tasks09 from "./function-study";
import tasks10 from "./taylor";

export const analysisIntroPractice: Record<string, PracticeTask[]> = {
  "sets-reals": tasks01,
  "functions": tasks02,
  "sequences": tasks03,
  "limits": tasks04,
  "infinitesimals": tasks05,
  "continuity": tasks06,
  "derivative": tasks07,
  "differential": tasks08,
  "function-study": tasks09,
  "taylor": tasks10,
};
