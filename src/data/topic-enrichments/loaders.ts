import type { TopicPatches } from "./model";

type PatchLoader = () => Promise<TopicPatches>;

const patchLoaders: Record<string, PatchLoader> = {
  "matrices": () => import("./topics/matrices").then((module) => module.default),
  "determinants": () => import("./topics/determinants").then((module) => module.default),
  "inverse-rank": () => import("./topics/inverse-rank").then((module) => module.default),
  "linear-systems": () => import("./topics/linear-systems").then((module) => module.default),
  "vectors": () => import("./topics/vectors").then((module) => module.default),
  "dot-product": () => import("./topics/dot-product").then((module) => module.default),
  "cross-product": () => import("./topics/cross-product").then((module) => module.default),
  "mixed-product": () => import("./topics/mixed-product").then((module) => module.default),
  "linear-spaces": () => import("./topics/linear-spaces").then((module) => module.default),
  "subspaces": () => import("./topics/subspaces").then((module) => module.default),
  "linear-maps": () => import("./topics/linear-maps").then((module) => module.default),
  "eigenproblem": () => import("./topics/eigenproblem").then((module) => module.default),
  "linear-functionals": () => import("./topics/linear-functionals").then((module) => module.default),
  "jordan-form": () => import("./topics/jordan-form").then((module) => module.default),
  "quadratic-forms": () => import("./topics/quadratic-forms").then((module) => module.default),
};

export async function loadTopicPatches(topicId: string): Promise<TopicPatches | undefined> {
  const loader = patchLoaders[topicId];
  return loader ? loader() : undefined;
}
