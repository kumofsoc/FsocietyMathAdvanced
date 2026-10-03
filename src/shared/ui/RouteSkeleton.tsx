export type RouteSkeletonVariant =
  | "home"
  | "topic"
  | "map"
  | "review"
  | "account"
  | "academy";

export function RouteSkeleton({
  variant,
  label = "Загружаю страницу",
}: {
  variant: RouteSkeletonVariant;
  label?: string;
}) {
  const contentRows = variant === "topic" ? 4 : variant === "review" ? 5 : 3;

  if (variant === "map") {
    return (
      <section className="route-skeleton route-skeleton-map" role="status" aria-live="polite">
        <span className="sr-only">{label}</span>
        <div className="route-skeleton-hero">
          <i className="skeleton-line xs" />
          <i className="skeleton-line title wide" />
          <i className="skeleton-line body medium" />
        </div>
        <div className="route-skeleton-map-controls">
          <i className="skeleton-panel" />
          <i className="skeleton-panel" />
          <i className="skeleton-panel" />
        </div>
        <div className="route-skeleton-map-stage">
          <div className="skeleton-map-canvas">
            <i className="skeleton-node node-a" />
            <i className="skeleton-node node-b" />
            <i className="skeleton-node node-c" />
            <i className="skeleton-node node-d" />
          </div>
          <div className="skeleton-map-inspector">
            <i className="skeleton-line xs" />
            <i className="skeleton-line heading" />
            <i className="skeleton-line body" />
            <i className="skeleton-line body short" />
            <i className="skeleton-panel compact" />
            <i className="skeleton-panel compact" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={"route-skeleton route-skeleton-" + variant}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{label}</span>

      <div className="route-skeleton-hero">
        <i className="skeleton-line xs" />
        <i className="skeleton-line title" />
        <i className="skeleton-line body wide" />
        <i className="skeleton-line body medium" />

        {variant === "topic" && (
          <div className="skeleton-metrics" aria-hidden="true">
            <i className="skeleton-panel" />
            <i className="skeleton-panel" />
            <i className="skeleton-panel" />
            <i className="skeleton-panel" />
          </div>
        )}
      </div>

      {variant === "topic" && (
        <div className="skeleton-chip-row" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </div>
      )}

      {variant === "review" && (
        <div className="skeleton-toolbar" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
      )}

      <div
        className={
          "route-skeleton-content " +
          (variant === "account" ? "cards" : "") +
          (variant === "academy" ? " academy" : "")
        }
        aria-hidden="true"
      >
        {Array.from({ length: contentRows }, (_, index) => (
          <article className="skeleton-content-card" key={index}>
            <div className="skeleton-card-rail">
              <i className="skeleton-line xs" />
              <i className="skeleton-line tiny" />
            </div>
            <div className="skeleton-card-body">
              <i className="skeleton-line heading" />
              <i className="skeleton-line body wide" />
              <i className="skeleton-line body" />
              <i className="skeleton-line body short" />
              {(variant === "topic" || variant === "review") && (
                <i className="skeleton-formula" />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
