import type { Topic } from "@/entities/course/model/types";
import { applyTopicPatches, type TopicPatches } from "./model";
import patches01 from "./topics/matrices";
import patches02 from "./topics/determinants";
import patches03 from "./topics/inverse-rank";
import patches04 from "./topics/linear-systems";
import patches05 from "./topics/vectors";
import patches06 from "./topics/dot-product";
import patches07 from "./topics/cross-product";
import patches08 from "./topics/mixed-product";
import patches09 from "./topics/linear-spaces";
import patches10 from "./topics/subspaces";
import patches11 from "./topics/linear-maps";
import patches12 from "./topics/eigenproblem";
import patches13 from "./topics/linear-functionals";
import patches14 from "./topics/jordan-form";
import patches15 from "./topics/quadratic-forms";

export const rigorousTopicPatches: Record<string, TopicPatches> = {
  "matrices": patches01,
  "determinants": patches02,
  "inverse-rank": patches03,
  "linear-systems": patches04,
  "vectors": patches05,
  "dot-product": patches06,
  "cross-product": patches07,
  "mixed-product": patches08,
  "linear-spaces": patches09,
  "subspaces": patches10,
  "linear-maps": patches11,
  "eigenproblem": patches12,
  "linear-functionals": patches13,
  "jordan-form": patches14,
  "quadratic-forms": patches15,
};

export function enrichRigorousTopic(topic: Topic): Topic {
  return applyTopicPatches(topic, rigorousTopicPatches[topic.id]);
}
