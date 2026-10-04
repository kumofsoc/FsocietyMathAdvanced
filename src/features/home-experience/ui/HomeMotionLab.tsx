import { lazy, Suspense } from "react";
import type { HomeMotionTier } from "../model/homeExperience";

const HomeMathField3D = lazy(() =>
  import("../visual/HomeMathField3D").then((module) => ({
    default: module.HomeMathField3D,
  })),
);

function HomeMathFieldFallback() {
  return (
    <div className="math-field-runtime" aria-hidden="true">
      <div className="math-field-fallback">
        <i /><i /><i /><span>∇</span>
      </div>
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
        {motionTier === "cinematic" ? (
          <Suspense fallback={<HomeMathFieldFallback />}>
            <HomeMathField3D tier={motionTier} />
          </Suspense>
        ) : (
          <HomeMathFieldFallback />
        )}
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
