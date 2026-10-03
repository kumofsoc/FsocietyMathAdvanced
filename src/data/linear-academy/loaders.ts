import type { ContentBlock } from "@/entities/course/model/types";

type AcademyLoader = () => Promise<ContentBlock[]>;

const academyLoaders: Record<string, AcademyLoader> = {
  "matrices": () => import("./topics/matrices").then((module) => module.blocks),
  "determinants": () => import("./topics/determinants").then((module) => module.blocks),
  "inverse-rank": () => import("./topics/inverse-rank").then((module) => module.blocks),
  "linear-systems": () => import("./topics/linear-systems").then((module) => module.blocks),
  "vectors": () => import("./topics/vectors").then((module) => module.blocks),
  "dot-product": () => import("./topics/dot-product").then((module) => module.blocks),
  "cross-product": () => import("./topics/cross-product").then((module) => module.blocks),
  "mixed-product": () => import("./topics/mixed-product").then((module) => module.blocks),
  "plane-coordinates": () => import("./topics/plane-coordinates").then((module) => module.blocks),
  "plane-lines": () => import("./topics/plane-lines").then((module) => module.blocks),
  "conics": () => import("./topics/conics").then((module) => module.blocks),
  "space-lines-planes": () => import("./topics/space-lines-planes").then((module) => module.blocks),
  "quadrics": () => import("./topics/quadrics").then((module) => module.blocks),
  "mappings-transformations": () => import("./topics/mappings-transformations").then((module) => module.blocks),
  "linear-transformations": () => import("./topics/linear-transformations").then((module) => module.blocks),
  "affine-transformations": () => import("./topics/affine-transformations").then((module) => module.blocks),
  "linear-spaces": () => import("./topics/linear-spaces").then((module) => module.blocks),
  "subspaces": () => import("./topics/subspaces").then((module) => module.blocks),
  "linear-maps": () => import("./topics/linear-maps").then((module) => module.blocks),
  "eigenproblem": () => import("./topics/eigenproblem").then((module) => module.blocks),
  "linear-functionals": () => import("./topics/linear-functionals").then((module) => module.blocks),
  "quadratic-forms": () => import("./topics/quadratic-forms").then((module) => module.blocks),
  "jordan-form": () => import("./topics/jordan-form").then((module) => module.blocks),
  "euclidean-spaces": () => import("./topics/euclidean-spaces").then((module) => module.blocks),
  "euclidean-operators": () => import("./topics/euclidean-operators").then((module) => module.blocks),
  "euclidean-functions": () => import("./topics/euclidean-functions").then((module) => module.blocks),
  "unitary-spaces": () => import("./topics/unitary-spaces").then((module) => module.blocks),
  "affine-spaces": () => import("./topics/affine-spaces").then((module) => module.blocks),
  "quadric-invariants": () => import("./topics/quadric-invariants").then((module) => module.blocks),
  "tensor-linear": () => import("./topics/tensor-linear").then((module) => module.blocks),
  "tensor-euclidean": () => import("./topics/tensor-euclidean").then((module) => module.blocks),
  "exterior-algebra": () => import("./topics/exterior-algebra").then((module) => module.blocks),
};

export async function loadLinearAcademyBlocks(topicId: string): Promise<ContentBlock[]> {
  const loader = academyLoaders[topicId];
  return loader ? loader() : [];
}

export function hasLinearAcademyBlocks(topicId: string) {
  return Boolean(academyLoaders[topicId]);
}
