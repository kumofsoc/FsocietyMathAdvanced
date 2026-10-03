import type { PracticeTask } from "@/entities/course/model/types";

type PracticeLoader = () => Promise<PracticeTask[]>;

const basePracticeLoaders: Record<string, PracticeLoader> = {
  "matrices": () => import("./topics/linear/matrices").then((module) => module.default),
  "determinants": () => import("./topics/linear/determinants").then((module) => module.default),
  "inverse-rank": () => import("./topics/linear/inverse-rank").then((module) => module.default),
  "linear-systems": () => import("./topics/linear/linear-systems").then((module) => module.default),
  "vectors": () => import("./topics/vectors/vectors").then((module) => module.default),
  "dot-product": () => import("./topics/vectors/dot-product").then((module) => module.default),
  "cross-product": () => import("./topics/vectors/cross-product").then((module) => module.default),
  "mixed-product": () => import("./topics/vectors/mixed-product").then((module) => module.default),
  "plane-coordinates": () => import("./topics/plane-geometry/plane-coordinates").then((module) => module.default),
  "plane-lines": () => import("./topics/plane-geometry/plane-lines").then((module) => module.default),
  "conics": () => import("./topics/plane-geometry/conics").then((module) => module.default),
  "space-lines-planes": () => import("./topics/space-geometry/space-lines-planes").then((module) => module.default),
  "quadrics": () => import("./topics/space-geometry/quadrics").then((module) => module.default),
  "mappings-transformations": () => import("./topics/plane-transformations/mappings-transformations").then((module) => module.default),
  "linear-transformations": () => import("./topics/plane-transformations/linear-transformations").then((module) => module.default),
  "affine-transformations": () => import("./topics/plane-transformations/affine-transformations").then((module) => module.default),
  "linear-spaces": () => import("./topics/abstract-linear/linear-spaces").then((module) => module.default),
  "subspaces": () => import("./topics/abstract-linear/subspaces").then((module) => module.default),
  "linear-maps": () => import("./topics/abstract-linear/linear-maps").then((module) => module.default),
  "eigenproblem": () => import("./topics/abstract-linear/eigenproblem").then((module) => module.default),
  "linear-functionals": () => import("./topics/abstract-linear/linear-functionals").then((module) => module.default),
  "quadratic-forms": () => import("./topics/abstract-linear/quadratic-forms").then((module) => module.default),
  "jordan-form": () => import("./topics/abstract-linear/jordan-form").then((module) => module.default),
  "euclidean-spaces": () => import("./topics/euclidean/euclidean-spaces").then((module) => module.default),
  "euclidean-operators": () => import("./topics/euclidean/euclidean-operators").then((module) => module.default),
  "euclidean-functions": () => import("./topics/euclidean/euclidean-functions").then((module) => module.default),
  "unitary-spaces": () => import("./topics/euclidean/unitary-spaces").then((module) => module.default),
  "affine-spaces": () => import("./topics/affine-general/affine-spaces").then((module) => module.default),
  "quadric-invariants": () => import("./topics/affine-general/quadric-invariants").then((module) => module.default),
  "tensor-linear": () => import("./topics/tensor-algebra/tensor-linear").then((module) => module.default),
  "tensor-euclidean": () => import("./topics/tensor-algebra/tensor-euclidean").then((module) => module.default),
  "exterior-algebra": () => import("./topics/tensor-algebra/exterior-algebra").then((module) => module.default),
  "sets-reals": () => import("./topics/analysis-intro/sets-reals").then((module) => module.default),
  "functions": () => import("./topics/analysis-intro/functions").then((module) => module.default),
  "sequences": () => import("./topics/analysis-intro/sequences").then((module) => module.default),
  "limits": () => import("./topics/analysis-intro/limits").then((module) => module.default),
  "infinitesimals": () => import("./topics/analysis-intro/infinitesimals").then((module) => module.default),
  "continuity": () => import("./topics/analysis-intro/continuity").then((module) => module.default),
  "derivative": () => import("./topics/analysis-intro/derivative").then((module) => module.default),
  "differential": () => import("./topics/analysis-intro/differential").then((module) => module.default),
  "function-study": () => import("./topics/analysis-intro/function-study").then((module) => module.default),
  "taylor": () => import("./topics/analysis-intro/taylor").then((module) => module.default),
  "complex-numbers": () => import("./topics/complex/complex-numbers").then((module) => module.default),
  "complex-operations": () => import("./topics/complex/complex-operations").then((module) => module.default),
  "antiderivative": () => import("./topics/indef-integral/antiderivative").then((module) => module.default),
  "integration-methods": () => import("./topics/indef-integral/integration-methods").then((module) => module.default),
  "rational-integration": () => import("./topics/indef-integral/rational-integration").then((module) => module.default),
  "trig-integration": () => import("./topics/indef-integral/trig-integration").then((module) => module.default),
  "irrational-integration": () => import("./topics/indef-integral/irrational-integration").then((module) => module.default),
  "riemann-integral": () => import("./topics/def-integral/riemann-integral").then((module) => module.default),
  "newton-leibniz": () => import("./topics/def-integral/newton-leibniz").then((module) => module.default),
  "improper-integrals": () => import("./topics/def-integral/improper-integrals").then((module) => module.default),
  "integral-applications": () => import("./topics/def-integral/integral-applications").then((module) => module.default),
  "multivariable-functions": () => import("./topics/multivariable/multivariable-functions").then((module) => module.default),
  "partial-derivatives": () => import("./topics/multivariable/partial-derivatives").then((module) => module.default),
  "tangent-plane": () => import("./topics/multivariable/tangent-plane").then((module) => module.default),
  "multivariable-extrema": () => import("./topics/multivariable/multivariable-extrema").then((module) => module.default),
  "ode-basics": () => import("./topics/ode/ode-basics").then((module) => module.default),
  "first-order-ode": () => import("./topics/ode/first-order-ode").then((module) => module.default),
  "higher-order-ode": () => import("./topics/ode/higher-order-ode").then((module) => module.default),
  "linear-ode": () => import("./topics/ode/linear-ode").then((module) => module.default),
  "ode-systems": () => import("./topics/ode/ode-systems").then((module) => module.default),
  "double-integral": () => import("./topics/multiple-integrals/double-integral").then((module) => module.default),
  "triple-integral": () => import("./topics/multiple-integrals/triple-integral").then((module) => module.default),
  "line-integrals": () => import("./topics/line-surface-integrals/line-integrals").then((module) => module.default),
  "surface-integrals": () => import("./topics/line-surface-integrals/surface-integrals").then((module) => module.default),
  "field-basics": () => import("./topics/field-theory/field-basics").then((module) => module.default),
  "scalar-field": () => import("./topics/field-theory/scalar-field").then((module) => module.default),
  "vector-field": () => import("./topics/field-theory/vector-field").then((module) => module.default),
  "hamilton-operator": () => import("./topics/field-theory/hamilton-operator").then((module) => module.default),
  "numeric-series": () => import("./topics/series/numeric-series").then((module) => module.default),
  "positive-series": () => import("./topics/series/positive-series").then((module) => module.default),
  "alternating-series": () => import("./topics/series/alternating-series").then((module) => module.default),
  "functional-series": () => import("./topics/power-series/functional-series").then((module) => module.default),
  "power-convergence": () => import("./topics/power-series/power-convergence").then((module) => module.default),
  "taylor-series": () => import("./topics/power-series/taylor-series").then((module) => module.default),
  "series-applications": () => import("./topics/power-series/series-applications").then((module) => module.default),
  "fourier-series": () => import("./topics/fourier/fourier-series").then((module) => module.default),
  "fourier-expansion": () => import("./topics/fourier/fourier-expansion").then((module) => module.default),
  "fourier-integral": () => import("./topics/fourier/fourier-integral").then((module) => module.default),
  "complex-functions": () => import("./topics/complex-analysis/complex-functions").then((module) => module.default),
  "complex-integration": () => import("./topics/complex-analysis/complex-integration").then((module) => module.default),
  "laurent-series": () => import("./topics/complex-analysis/laurent-series").then((module) => module.default),
  "residues": () => import("./topics/complex-analysis/residues").then((module) => module.default),
  "laplace": () => import("./topics/operational/laplace").then((module) => module.default),
  "inverse-laplace": () => import("./topics/operational/inverse-laplace").then((module) => module.default),
  "laplace-ode": () => import("./topics/operational/laplace-ode").then((module) => module.default),
};

const topicsWithAcademyPractice = new Set<string>([
  "affine-spaces",
  "affine-transformations",
  "conics",
  "cross-product",
  "determinants",
  "dot-product",
  "eigenproblem",
  "euclidean-functions",
  "euclidean-operators",
  "euclidean-spaces",
  "exterior-algebra",
  "inverse-rank",
  "jordan-form",
  "linear-functionals",
  "linear-maps",
  "linear-spaces",
  "linear-systems",
  "linear-transformations",
  "mappings-transformations",
  "matrices",
  "mixed-product",
  "plane-coordinates",
  "plane-lines",
  "quadratic-forms",
  "quadric-invariants",
  "quadrics",
  "space-lines-planes",
  "subspaces",
  "tensor-euclidean",
  "tensor-linear",
  "unitary-spaces",
  "vectors",
]);

async function loadAcademyPractice(topicId: string): Promise<PracticeTask[]> {
  if (!topicsWithAcademyPractice.has(topicId)) return [];

  const [academy, exam, proof] = await Promise.all([
    import("@/data/linearAcademyPractice"),
    import("@/data/linearAcademyExamPractice"),
    import("@/data/linearAcademyProofPractice"),
  ]);

  return [
    ...(academy.linearAcademyPracticeByTopic[topicId] ?? []),
    ...(exam.linearAcademyExamPracticeByTopic[topicId] ?? []),
    ...(proof.linearAcademyProofPracticeByTopic[topicId] ?? []),
  ];
}

export const practiceLoaders = basePracticeLoaders;

export async function loadPracticeForTopic(topicId: string): Promise<PracticeTask[]> {
  const loader = basePracticeLoaders[topicId];
  if (!loader) return [];

  const [baseTasks, academyTasks] = await Promise.all([
    loader(),
    loadAcademyPractice(topicId),
  ]);

  return [...baseTasks, ...academyTasks];
}
