import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { HomeMotionTier } from "../model/homeExperience";

const HomeMathField3D = lazy(() =>
  import("../visual/HomeMathField3D").then((module) => ({
    default: module.HomeMathField3D,
  })),
);

function FieldFallback() {
  return (
    <div className="math-field-runtime" aria-hidden="true">
      <div className="math-field-fallback">
        <i /><i /><i /><span>∇</span>
      </div>
    </div>
  );
}

function DeferredMathField({ tier }: { tier: HomeMotionTier }) {
  const anchor = useRef<HTMLDivElement>(null);
  const [nearViewport, setNearViewport] = useState(false);

  useEffect(() => {
    if (tier !== "cinematic" || nearViewport) return;
    const element = anchor.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [nearViewport, tier]);

  if (tier !== "cinematic" || !nearViewport) {
    return <div ref={anchor} className="math-field-deferred-anchor"><FieldFallback /></div>;
  }

  return (
    <div ref={anchor} className="math-field-deferred-anchor">
      <Suspense fallback={<FieldFallback />}>
        <HomeMathField3D tier={tier} />
      </Suspense>
    </div>
  );
}

export function HomeMotionLab({ motionTier }: { motionTier: HomeMotionTier }) {
  return (
    <section className="future-scene future-motion" data-home-scene="motion">
      <div className="motion-lab-copy" data-reveal>
        <div className="future-kicker"><span>MATHEMATICAL MOTION LAB</span><i>LIVE OBJECT / 05</i></div>
        <h2>Формула перестаёт<br/>быть <em>строкой.</em></h2>
        <div className="motion-equations">
          <span>A·v = λv</span><span>z = re<sup>iθ</sup></span><span>∇f(x,y)</span>
        </div>
      </div>

      <div className="motion-lab-stage" data-parallax>
        <DeferredMathField tier={motionTier} />
        <div className="motion-coordinate x">X</div>
        <div className="motion-coordinate y">Y</div>
        <div className="motion-coordinate z">Z</div>
        <div className="motion-lab-readout" data-ambient="drift">
          <span>FIELD</span><strong>NON-LINEAR</strong><small>Δt / 0.0167</small>
        </div>
      </div>
    </section>
  );
}
