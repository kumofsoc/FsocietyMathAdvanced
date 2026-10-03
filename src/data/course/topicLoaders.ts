import type { Topic } from "@/entities/course/model/types";
import { loadLinearAcademyBlocks } from "@/data/linear-academy/loaders";

export type TopicLoader = () => Promise<Topic>;

export const topicLoaders: Record<string, TopicLoader> = {
  "eigenproblem": () => import("./topics/abstract-linear/eigenproblem").then((module) => enrichTopic(module.default)),
  "jordan-form": () => import("./topics/abstract-linear/jordan-form").then((module) => enrichTopic(module.default)),
  "linear-functionals": () => import("./topics/abstract-linear/linear-functionals").then((module) => enrichTopic(module.default)),
  "linear-maps": () => import("./topics/abstract-linear/linear-maps").then((module) => enrichTopic(module.default)),
  "linear-spaces": () => import("./topics/abstract-linear/linear-spaces").then((module) => enrichTopic(module.default)),
  "quadratic-forms": () => import("./topics/abstract-linear/quadratic-forms").then((module) => enrichTopic(module.default)),
  "subspaces": () => import("./topics/abstract-linear/subspaces").then((module) => enrichTopic(module.default)),
  "affine-spaces": () => import("./topics/affine-general/affine-spaces").then((module) => enrichTopic(module.default)),
  "quadric-invariants": () => import("./topics/affine-general/quadric-invariants").then((module) => enrichTopic(module.default)),
  "continuity": () => import("./topics/analysis-intro/continuity").then((module) => enrichTopic(module.default)),
  "derivative": () => import("./topics/analysis-intro/derivative").then((module) => enrichTopic(module.default)),
  "differential": () => import("./topics/analysis-intro/differential").then((module) => enrichTopic(module.default)),
  "function-study": () => import("./topics/analysis-intro/function-study").then((module) => enrichTopic(module.default)),
  "functions": () => import("./topics/analysis-intro/functions").then((module) => enrichTopic(module.default)),
  "infinitesimals": () => import("./topics/analysis-intro/infinitesimals").then((module) => enrichTopic(module.default)),
  "limits": () => import("./topics/analysis-intro/limits").then((module) => enrichTopic(module.default)),
  "sequences": () => import("./topics/analysis-intro/sequences").then((module) => enrichTopic(module.default)),
  "sets-reals": () => import("./topics/analysis-intro/sets-reals").then((module) => enrichTopic(module.default)),
  "taylor": () => import("./topics/analysis-intro/taylor").then((module) => enrichTopic(module.default)),
  "complex-functions": () => import("./topics/complex-analysis/complex-functions").then((module) => enrichTopic(module.default)),
  "complex-integration": () => import("./topics/complex-analysis/complex-integration").then((module) => enrichTopic(module.default)),
  "laurent-series": () => import("./topics/complex-analysis/laurent-series").then((module) => enrichTopic(module.default)),
  "residues": () => import("./topics/complex-analysis/residues").then((module) => enrichTopic(module.default)),
  "complex-numbers": () => import("./topics/complex/complex-numbers").then((module) => enrichTopic(module.default)),
  "complex-operations": () => import("./topics/complex/complex-operations").then((module) => enrichTopic(module.default)),
  "improper-integrals": () => import("./topics/def-integral/improper-integrals").then((module) => enrichTopic(module.default)),
  "integral-applications": () => import("./topics/def-integral/integral-applications").then((module) => enrichTopic(module.default)),
  "newton-leibniz": () => import("./topics/def-integral/newton-leibniz").then((module) => enrichTopic(module.default)),
  "riemann-integral": () => import("./topics/def-integral/riemann-integral").then((module) => enrichTopic(module.default)),
  "euclidean-functions": () => import("./topics/euclidean/euclidean-functions").then((module) => enrichTopic(module.default)),
  "euclidean-operators": () => import("./topics/euclidean/euclidean-operators").then((module) => enrichTopic(module.default)),
  "euclidean-spaces": () => import("./topics/euclidean/euclidean-spaces").then((module) => enrichTopic(module.default)),
  "unitary-spaces": () => import("./topics/euclidean/unitary-spaces").then((module) => enrichTopic(module.default)),
  "field-basics": () => import("./topics/field-theory/field-basics").then((module) => enrichTopic(module.default)),
  "hamilton-operator": () => import("./topics/field-theory/hamilton-operator").then((module) => enrichTopic(module.default)),
  "scalar-field": () => import("./topics/field-theory/scalar-field").then((module) => enrichTopic(module.default)),
  "vector-field": () => import("./topics/field-theory/vector-field").then((module) => enrichTopic(module.default)),
  "fourier-expansion": () => import("./topics/fourier/fourier-expansion").then((module) => enrichTopic(module.default)),
  "fourier-integral": () => import("./topics/fourier/fourier-integral").then((module) => enrichTopic(module.default)),
  "fourier-series": () => import("./topics/fourier/fourier-series").then((module) => enrichTopic(module.default)),
  "antiderivative": () => import("./topics/indef-integral/antiderivative").then((module) => enrichTopic(module.default)),
  "integration-methods": () => import("./topics/indef-integral/integration-methods").then((module) => enrichTopic(module.default)),
  "irrational-integration": () => import("./topics/indef-integral/irrational-integration").then((module) => enrichTopic(module.default)),
  "rational-integration": () => import("./topics/indef-integral/rational-integration").then((module) => enrichTopic(module.default)),
  "trig-integration": () => import("./topics/indef-integral/trig-integration").then((module) => enrichTopic(module.default)),
  "line-integrals": () => import("./topics/line-surface-integrals/line-integrals").then((module) => enrichTopic(module.default)),
  "surface-integrals": () => import("./topics/line-surface-integrals/surface-integrals").then((module) => enrichTopic(module.default)),
  "determinants": () => import("./topics/linear/determinants").then((module) => enrichTopic(module.default)),
  "inverse-rank": () => import("./topics/linear/inverse-rank").then((module) => enrichTopic(module.default)),
  "linear-systems": () => import("./topics/linear/linear-systems").then((module) => enrichTopic(module.default)),
  "matrices": () => import("./topics/linear/matrices").then((module) => enrichTopic(module.default)),
  "double-integral": () => import("./topics/multiple-integrals/double-integral").then((module) => enrichTopic(module.default)),
  "triple-integral": () => import("./topics/multiple-integrals/triple-integral").then((module) => enrichTopic(module.default)),
  "multivariable-extrema": () => import("./topics/multivariable/multivariable-extrema").then((module) => enrichTopic(module.default)),
  "multivariable-functions": () => import("./topics/multivariable/multivariable-functions").then((module) => enrichTopic(module.default)),
  "partial-derivatives": () => import("./topics/multivariable/partial-derivatives").then((module) => enrichTopic(module.default)),
  "tangent-plane": () => import("./topics/multivariable/tangent-plane").then((module) => enrichTopic(module.default)),
  "first-order-ode": () => import("./topics/ode/first-order-ode").then((module) => enrichTopic(module.default)),
  "higher-order-ode": () => import("./topics/ode/higher-order-ode").then((module) => enrichTopic(module.default)),
  "linear-ode": () => import("./topics/ode/linear-ode").then((module) => enrichTopic(module.default)),
  "ode-basics": () => import("./topics/ode/ode-basics").then((module) => enrichTopic(module.default)),
  "ode-systems": () => import("./topics/ode/ode-systems").then((module) => enrichTopic(module.default)),
  "inverse-laplace": () => import("./topics/operational/inverse-laplace").then((module) => enrichTopic(module.default)),
  "laplace-ode": () => import("./topics/operational/laplace-ode").then((module) => enrichTopic(module.default)),
  "laplace": () => import("./topics/operational/laplace").then((module) => enrichTopic(module.default)),
  "conics": () => import("./topics/plane-geometry/conics").then((module) => enrichTopic(module.default)),
  "plane-coordinates": () => import("./topics/plane-geometry/plane-coordinates").then((module) => enrichTopic(module.default)),
  "plane-lines": () => import("./topics/plane-geometry/plane-lines").then((module) => enrichTopic(module.default)),
  "affine-transformations": () => import("./topics/plane-transformations/affine-transformations").then((module) => enrichTopic(module.default)),
  "linear-transformations": () => import("./topics/plane-transformations/linear-transformations").then((module) => enrichTopic(module.default)),
  "mappings-transformations": () => import("./topics/plane-transformations/mappings-transformations").then((module) => enrichTopic(module.default)),
  "functional-series": () => import("./topics/power-series/functional-series").then((module) => enrichTopic(module.default)),
  "power-convergence": () => import("./topics/power-series/power-convergence").then((module) => enrichTopic(module.default)),
  "series-applications": () => import("./topics/power-series/series-applications").then((module) => enrichTopic(module.default)),
  "taylor-series": () => import("./topics/power-series/taylor-series").then((module) => enrichTopic(module.default)),
  "alternating-series": () => import("./topics/series/alternating-series").then((module) => enrichTopic(module.default)),
  "numeric-series": () => import("./topics/series/numeric-series").then((module) => enrichTopic(module.default)),
  "positive-series": () => import("./topics/series/positive-series").then((module) => enrichTopic(module.default)),
  "quadrics": () => import("./topics/space-geometry/quadrics").then((module) => enrichTopic(module.default)),
  "space-lines-planes": () => import("./topics/space-geometry/space-lines-planes").then((module) => enrichTopic(module.default)),
  "exterior-algebra": () => import("./topics/tensor-algebra/exterior-algebra").then((module) => enrichTopic(module.default)),
  "tensor-euclidean": () => import("./topics/tensor-algebra/tensor-euclidean").then((module) => enrichTopic(module.default)),
  "tensor-linear": () => import("./topics/tensor-algebra/tensor-linear").then((module) => enrichTopic(module.default)),
  "cross-product": () => import("./topics/vectors/cross-product").then((module) => enrichTopic(module.default)),
  "dot-product": () => import("./topics/vectors/dot-product").then((module) => enrichTopic(module.default)),
  "mixed-product": () => import("./topics/vectors/mixed-product").then((module) => enrichTopic(module.default)),
  "vectors": () => import("./topics/vectors/vectors").then((module) => enrichTopic(module.default)),
};

export function hasCourseTopic(topicId: string) {
  return Boolean(topicLoaders[topicId]);
}

export async function loadCourseTopic(topicId: string): Promise<Topic | null> {
  const loader = topicLoaders[topicId];
  if (!loader) return null;

  const [topic, academyBlocks] = await Promise.all([
    loader(),
    loadLinearAcademyBlocks(topicId),
  ]);

  return {
    ...topic,
    blocks: [...topic.blocks, ...academyBlocks],
  };
}
