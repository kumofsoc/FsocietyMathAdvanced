import {
  Component,
  lazy,
  Suspense,
  type ErrorInfo,
  type ReactNode,
} from "react";

interface InsertProps {
  topicId: string;
  index: number;
}

interface TopicVisualProps extends InsertProps {
  blockTitle: string;
}

const MatrixTypesGallery = lazy(() =>
  import("./MatrixTypesGallery").then((module) => ({
    default: module.MatrixTypesGallery,
  })),
);
const DeterminantVisual = lazy(() =>
  import("./DeterminantVisual").then((module) => ({
    default: module.DeterminantVisual,
  })),
);
const QuadricSurfaceLab = lazy(() =>
  import("./QuadricSurfaceLab").then((module) => ({
    default: module.QuadricSurfaceLab,
  })),
);
const MatrixLab = lazy(() =>
  import("./MatrixLab").then((module) => ({ default: module.MatrixLab })),
);

const VectorVisualInsert = lazy(() =>
  import("./VectorVisuals").then((module) => ({
    default: module.VectorVisualInsert,
  })),
);
const GeometryVisualInsert = lazy(() =>
  import("./GeometryVisuals").then((module) => ({
    default: module.GeometryVisualInsert,
  })),
);
const TransformationVisualInsert = lazy(() =>
  import("./TransformationVisuals").then((module) => ({
    default: module.TransformationVisualInsert,
  })),
);
const AbstractLinearVisualInsert = lazy(() =>
  import("./AbstractLinearVisuals").then((module) => ({
    default: module.AbstractLinearVisualInsert,
  })),
);
const AdvancedLinearVisualInsert = lazy(() =>
  import("./AdvancedLinearVisuals").then((module) => ({
    default: module.AdvancedLinearVisualInsert,
  })),
);
const AffineGeometryVisualInsert = lazy(() =>
  import("./AffineGeometryVisuals").then((module) => ({
    default: module.AffineGeometryVisualInsert,
  })),
);
const TensorVisualInsert = lazy(() =>
  import("./TensorVisuals").then((module) => ({
    default: module.TensorVisualInsert,
  })),
);
const AnalysisVisualInsert = lazy(() =>
  import("./AnalysisVisuals").then((module) => ({
    default: module.AnalysisVisualInsert,
  })),
);
const AnalysisAdvancedVisualInsert = lazy(() =>
  import("./AnalysisAdvancedVisuals").then((module) => ({
    default: module.AnalysisAdvancedVisualInsert,
  })),
);
const IntegralVisualInsert = lazy(() =>
  import("./IntegralVisuals").then((module) => ({
    default: module.IntegralVisualInsert,
  })),
);
const MultipleIntegralVisualInsert = lazy(() =>
  import("./MultipleIntegralVisuals").then((module) => ({
    default: module.MultipleIntegralVisualInsert,
  })),
);
const LineSurfaceIntegralVisualInsert = lazy(() =>
  import("./LineSurfaceIntegralVisuals").then((module) => ({
    default: module.LineSurfaceIntegralVisualInsert,
  })),
);
const ODEVisualInsert = lazy(() =>
  import("./ODEVisuals").then((module) => ({
    default: module.ODEVisualInsert,
  })),
);
const DefiniteIntegralVisualInsert = lazy(() =>
  import("./DefiniteIntegralVisuals").then((module) => ({
    default: module.DefiniteIntegralVisualInsert,
  })),
);
const MultivariableVisualInsert = lazy(() =>
  import("./MultivariableVisuals").then((module) => ({
    default: module.MultivariableVisualInsert,
  })),
);

const VECTOR_TOPICS = new Set([
  "vectors",
  "dot-product",
  "cross-product",
  "mixed-product",
]);
const GEOMETRY_TOPICS = new Set([
  "plane-coordinates",
  "plane-lines",
  "conics",
  "space-lines-planes",
]);
const TRANSFORMATION_TOPICS = new Set([
  "mappings-transformations",
  "linear-transformations",
  "affine-transformations",
]);
const ABSTRACT_LINEAR_TOPICS = new Set([
  "linear-spaces",
  "subspaces",
  "linear-maps",
  "eigenproblem",
  "linear-functionals",
  "quadratic-forms",
]);
const ADVANCED_LINEAR_TOPICS = new Set([
  "jordan-form",
  "euclidean-spaces",
  "euclidean-operators",
  "unitary-spaces",
]);
const AFFINE_TOPICS = new Set(["affine-spaces", "quadric-invariants"]);
const TENSOR_TOPICS = new Set([
  "tensor-linear",
  "tensor-euclidean",
  "exterior-algebra",
]);
const ANALYSIS_TOPICS = new Set([
  "sets-reals",
  "functions",
  "sequences",
  "limits",
  "infinitesimals",
  "continuity",
]);
const ANALYSIS_ADVANCED_TOPICS = new Set([
  "derivative",
  "differential",
  "function-study",
  "taylor",
]);
const INTEGRAL_TOPICS = new Set([
  "antiderivative",
  "integration-methods",
  "rational-integration",
  "trig-integration",
  "irrational-integration",
]);
const DEFINITE_INTEGRAL_TOPICS = new Set([
  "riemann-integral",
  "newton-leibniz",
  "improper-integrals",
  "integral-applications",
]);
const MULTIVARIABLE_TOPICS = new Set([
  "multivariable-functions",
  "partial-derivatives",
  "tangent-plane",
  "multivariable-extrema",
]);
const ODE_TOPICS = new Set([
  "first-order-ode",
  "higher-order-ode",
  "linear-ode",
  "ode-systems",
]);
const MULTIPLE_INTEGRAL_TOPICS = new Set(["double-integral", "triple-integral"]);
const LINE_SURFACE_TOPICS = new Set(["line-integrals", "surface-integrals"]);

class VisualErrorBoundary extends Component<
  { children: ReactNode; identity: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[FsocietyMath] visual failed", this.props.identity, error, info);
  }

  componentDidUpdate(previous: { children: ReactNode; identity: string }) {
    if (previous.identity !== this.props.identity && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="visual-failed">
          <span>VISUAL RECOVERY</span>
          <strong>Интерактив не загрузился, но теория остаётся доступной.</strong>
          <button onClick={() => window.location.reload()}>Перезагрузить visual</button>
        </div>
      );
    }
    return this.props.children;
  }
}

function VisualFallback() {
  return (
    <div className="visual-loading" aria-live="polite">
      <span />
      <div>
        <strong>Подключаю интерактив</strong>
        <small>visual chunk загружается отдельно от теории</small>
      </div>
    </div>
  );
}

function shell(identity: string, child: ReactNode) {
  return (
    <VisualErrorBoundary identity={identity}>
      <Suspense fallback={<VisualFallback />}>{child}</Suspense>
    </VisualErrorBoundary>
  );
}

export function TopicVisualInsert({
  topicId,
  index,
  blockTitle,
}: TopicVisualProps) {
  const identity = topicId + "::" + index;

  if (topicId === "matrices" && index === 0) {
    return shell(identity, <MatrixTypesGallery />);
  }
  if (
    topicId === "determinants" &&
    blockTitle.includes("Определитель 3-го порядка")
  ) {
    return shell(identity, <DeterminantVisual />);
  }
  if (
    (topicId === "quadrics" && index === 1) ||
    (topicId === "quadric-invariants" && index === 14)
  ) {
    return shell(identity, <QuadricSurfaceLab />);
  }

  const props = { topicId, index };

  if (VECTOR_TOPICS.has(topicId)) {
    return shell(identity, <VectorVisualInsert {...props} />);
  }
  if (GEOMETRY_TOPICS.has(topicId)) {
    return shell(identity, <GeometryVisualInsert {...props} />);
  }
  if (TRANSFORMATION_TOPICS.has(topicId)) {
    return shell(identity, <TransformationVisualInsert {...props} />);
  }
  if (ABSTRACT_LINEAR_TOPICS.has(topicId)) {
    return shell(identity, <AbstractLinearVisualInsert {...props} />);
  }
  if (ADVANCED_LINEAR_TOPICS.has(topicId)) {
    return shell(identity, <AdvancedLinearVisualInsert {...props} />);
  }
  if (AFFINE_TOPICS.has(topicId)) {
    return shell(identity, <AffineGeometryVisualInsert {...props} />);
  }
  if (TENSOR_TOPICS.has(topicId)) {
    return shell(identity, <TensorVisualInsert {...props} />);
  }
  if (ANALYSIS_TOPICS.has(topicId)) {
    return shell(identity, <AnalysisVisualInsert {...props} />);
  }
  if (ANALYSIS_ADVANCED_TOPICS.has(topicId)) {
    return shell(identity, <AnalysisAdvancedVisualInsert {...props} />);
  }
  if (INTEGRAL_TOPICS.has(topicId)) {
    return shell(identity, <IntegralVisualInsert {...props} />);
  }
  if (DEFINITE_INTEGRAL_TOPICS.has(topicId)) {
    return shell(identity, <DefiniteIntegralVisualInsert {...props} />);
  }
  if (MULTIVARIABLE_TOPICS.has(topicId)) {
    return shell(identity, <MultivariableVisualInsert {...props} />);
  }
  if (ODE_TOPICS.has(topicId)) {
    return shell(identity, <ODEVisualInsert {...props} />);
  }
  if (MULTIPLE_INTEGRAL_TOPICS.has(topicId)) {
    return shell(identity, <MultipleIntegralVisualInsert {...props} />);
  }
  if (LINE_SURFACE_TOPICS.has(topicId)) {
    return shell(identity, <LineSurfaceIntegralVisualInsert {...props} />);
  }

  return null;
}

export function TopicLabInsert({
  topicId,
  enabled,
}: {
  topicId: string;
  enabled: boolean;
}) {
  if (!enabled) return null;
  return shell(topicId + "::lab", <MatrixLab />);
}
