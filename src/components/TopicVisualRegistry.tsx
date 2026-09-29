import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
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
const SeriesVisualInsert = lazy(() =>
  import("./SeriesVisuals").then((module) => ({
    default: module.SeriesVisualInsert,
  })),
);
const FieldVisualInsert = lazy(() =>
  import("./FieldVisuals").then((module) => ({
    default: module.FieldVisualInsert,
  })),
);

const VECTOR_INSERTS = new Set([
  "vectors:1",
  "vectors:6",
  "vectors:10",
  "vectors:13",
  "dot-product:2",
  "cross-product:3",
  "mixed-product:2",
]);
const GEOMETRY_INSERTS = new Set([
  "plane-coordinates:1",
  "plane-lines:2",
  "conics:2",
  "space-lines-planes:3",
]);
const TRANSFORMATION_INSERTS = new Set([
  "mappings-transformations:4",
  "linear-transformations:3",
  "affine-transformations:2",
]);
const ABSTRACT_LINEAR_INSERTS = new Set([
  "linear-spaces:5",
  "subspaces:6",
  "linear-maps:6",
  "eigenproblem:5",
  "linear-functionals:2",
  "quadratic-forms:5",
]);
const ADVANCED_LINEAR_INSERTS = new Set([
  "jordan-form:7",
  "euclidean-spaces:9",
  "euclidean-operators:6",
  "unitary-spaces:2",
]);
const AFFINE_INSERTS = new Set([
  "affine-spaces:10",
  "quadric-invariants:8",
]);
const TENSOR_INSERTS = new Set([
  "tensor-linear:7",
  "tensor-linear:13",
  "tensor-euclidean:4",
  "exterior-algebra:10",
]);
const ANALYSIS_INSERTS = new Set([
  "sets-reals:10",
  "functions:9",
  "sequences:5",
  "limits:2",
  "infinitesimals:14",
  "continuity:6",
]);
const ANALYSIS_ADVANCED_INSERTS = new Set([
  "derivative:2",
  "differential:3",
  "function-study:9",
  "taylor:6",
]);
const INTEGRAL_INSERTS = new Set([
  "antiderivative:2",
  "integration-methods:2",
  "rational-integration:4",
  "trig-integration:5",
  "irrational-integration:2",
]);
const DEFINITE_INTEGRAL_INSERTS = new Set([
  "riemann-integral:2",
  "newton-leibniz:0",
  "improper-integrals:2",
  "integral-applications:1",
  "integral-applications:11",
]);
const MULTIVARIABLE_INSERTS = new Set([
  "multivariable-functions:5",
  "partial-derivatives:7",
  "tangent-plane:1",
  "multivariable-extrema:5",
]);
const ODE_INSERTS = new Set([
  "first-order-ode:1",
  "higher-order-ode:4",
  "linear-ode:1",
  "ode-systems:5",
]);
const MULTIPLE_INTEGRAL_INSERTS = new Set([
  "double-integral:1",
  "double-integral:9",
  "triple-integral:4",
]);
const LINE_SURFACE_INSERTS = new Set([
  "line-integrals:4",
  "surface-integrals:4",
]);
const SERIES_INSERTS = new Set([
  "numeric-series:1",
  "positive-series:8",
  "alternating-series:3",
]);
const FIELD_INSERTS = new Set([
  "scalar-field:2",
  "vector-field:1",
]);

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

function DeferredVisual({
  identity,
  render,
}: {
  identity: string;
  render: () => ReactNode;
}) {
  const target = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (active) return;
    const element = target.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        setActive(true);
        observer.disconnect();
      },
      { rootMargin: "700px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);

  if (!active) {
    return (
      <div ref={target} className="visual-deferred" data-visual-id={identity}>
        <span>INTERACTIVE</span>
        <small>будет подключён при приближении к блоку</small>
      </div>
    );
  }

  return (
    <VisualErrorBoundary identity={identity}>
      <Suspense fallback={<VisualFallback />}>{render()}</Suspense>
    </VisualErrorBoundary>
  );
}

function shell(identity: string, render: () => ReactNode) {
  return <DeferredVisual identity={identity} render={render} />;
}

export function TopicVisualInsert({
  topicId,
  index,
  blockTitle,
}: TopicVisualProps) {
  const identity = topicId + "::" + index;

  if (topicId === "matrices" && index === 0) {
    return shell(identity, () => <MatrixTypesGallery />);
  }
  if (
    topicId === "determinants" &&
    blockTitle.includes("Определитель 3-го порядка")
  ) {
    return shell(identity, () => <DeterminantVisual />);
  }
  if (
    (topicId === "quadrics" && index === 1) ||
    (topicId === "quadric-invariants" && index === 14)
  ) {
    return shell(identity, () => <QuadricSurfaceLab />);
  }

  const props = { topicId, index };

  if (VECTOR_INSERTS.has(identity)) {
    return shell(identity, () => <VectorVisualInsert {...props} />);
  }
  if (GEOMETRY_INSERTS.has(identity)) {
    return shell(identity, () => <GeometryVisualInsert {...props} />);
  }
  if (TRANSFORMATION_INSERTS.has(identity)) {
    return shell(identity, () => <TransformationVisualInsert {...props} />);
  }
  if (ABSTRACT_LINEAR_INSERTS.has(identity)) {
    return shell(identity, () => <AbstractLinearVisualInsert {...props} />);
  }
  if (ADVANCED_LINEAR_INSERTS.has(identity)) {
    return shell(identity, () => <AdvancedLinearVisualInsert {...props} />);
  }
  if (AFFINE_INSERTS.has(identity)) {
    return shell(identity, () => <AffineGeometryVisualInsert {...props} />);
  }
  if (TENSOR_INSERTS.has(identity)) {
    return shell(identity, () => <TensorVisualInsert {...props} />);
  }
  if (ANALYSIS_INSERTS.has(identity)) {
    return shell(identity, () => <AnalysisVisualInsert {...props} />);
  }
  if (ANALYSIS_ADVANCED_INSERTS.has(identity)) {
    return shell(identity, () => <AnalysisAdvancedVisualInsert {...props} />);
  }
  if (INTEGRAL_INSERTS.has(identity)) {
    return shell(identity, () => <IntegralVisualInsert {...props} />);
  }
  if (DEFINITE_INTEGRAL_INSERTS.has(identity)) {
    return shell(identity, () => <DefiniteIntegralVisualInsert {...props} />);
  }
  if (MULTIVARIABLE_INSERTS.has(identity)) {
    return shell(identity, () => <MultivariableVisualInsert {...props} />);
  }
  if (ODE_INSERTS.has(identity)) {
    return shell(identity, () => <ODEVisualInsert {...props} />);
  }
  if (MULTIPLE_INTEGRAL_INSERTS.has(identity)) {
    return shell(identity, () => <MultipleIntegralVisualInsert {...props} />);
  }
  if (LINE_SURFACE_INSERTS.has(identity)) {
    return shell(identity, () => <LineSurfaceIntegralVisualInsert {...props} />);
  }
  if (SERIES_INSERTS.has(identity)) {
    return shell(identity, () => <SeriesVisualInsert {...props} />);
  }
  if (FIELD_INSERTS.has(identity)) {
    return shell(identity, () => <FieldVisualInsert {...props} />);
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
  return shell(topicId + "::lab", () => <MatrixLab />);
}
