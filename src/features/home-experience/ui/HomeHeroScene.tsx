import { lazy, Suspense } from "react";
import type { HomeMotionTier } from "../model/homeExperience";

const HomeCore3D = lazy(() =>
  import("../visual/HomeCore3D").then((module) => ({
    default: module.HomeCore3D,
  })),
);

function HomeCoreFallback() {
  return (
    <div className="future-core-runtime" aria-hidden="true">
      <div className="future-core-fallback">
        <i className="future-core-shell shell-a" />
        <i className="future-core-shell shell-b" />
        <i className="future-core-shell shell-c" />
        <b>VM</b>
      </div>
    </div>
  );
}
import { HomeFormulaTicker } from "./HomeFormulaTicker";

interface HeroProps {
  progress: number;
  resumeTopic?: { id: string; number: string; title: string };
  motionTier: HomeMotionTier;
  onPrimary: () => void;
  onMap: () => void;
}

export function HomeHeroScene({
  progress,
  resumeTopic,
  motionTier,
  onPrimary,
  onMap,
}: HeroProps) {
  return (
    <section className="future-scene future-arrival" data-home-scene="arrival">
      <div className="future-noise" aria-hidden="true" />
      <div className="future-scanlines" aria-hidden="true" />
      <div className="future-perspective-grid" data-parallax aria-hidden="true" />
      <div className="future-crosshair crosshair-a" data-ambient="drift" aria-hidden="true" />
      <div className="future-crosshair crosshair-b" data-ambient="drift" aria-hidden="true" />

      <div className="future-arrival-copy">
        <div className="future-kicker" data-reveal>
          <span>MATHMAMATH</span>
          <i>ИНТЕРАКТИВНЫЙ КУРС</i>
        </div>

        <div className="future-title-wrap" data-reveal>
          <h1>
            Математика
            <span>после интерфейса.</span>
          </h1>
          <b aria-hidden="true">VM/∞</b>
        </div>

        <div className="future-arrival-actions" data-reveal>
          <button className="future-primary" onClick={onPrimary}>
            <span>{resumeTopic ? "ПРОДОЛЖИТЬ" : "НАЧАТЬ"}</span>
            <strong>{resumeTopic ? "§ " + resumeTopic.number : "НАЧАТЬ"}</strong>
          </button>
          <button className="future-secondary" onClick={onMap}>
            <span>КАРТА КУРСА</span>
            <strong>ОТКРЫТЬ ↗</strong>
          </button>
        </div>

        <div className="future-system-line" data-reveal>
          <span>КУРС ГОТОВ</span>
          <span>ПРОГРЕСС СОХРАНЯЕТСЯ</span>
          <span>ТЕОРИЯ + ПРАКТИКА + ВИЗУАЛИЗАЦИИ</span>
        </div>
      </div>

      <div className="future-core-stage" data-parallax>
        <div className="future-core-orbit-label label-a" data-ambient="orbit">ALGEBRA</div>
        <div className="future-core-orbit-label label-b" data-ambient="orbit">ANALYSIS</div>
        <div className="future-core-orbit-label label-c" data-ambient="orbit">GEOMETRY</div>
        {motionTier === "cinematic" ? (
          <Suspense fallback={<HomeCoreFallback />}>
            <HomeCore3D tier={motionTier} />
          </Suspense>
        ) : (
          <HomeCoreFallback />
        )}
      </div>

      <div className="future-mastery-card" data-reveal>
        <div>
          <span>ОСВОЕНИЕ КУРСА</span>
          <strong>{progress}%</strong>
        </div>
        <i><b style={{ width: progress + "%" }} /></i>
        <small>{resumeTopic ? "ПРОДОЛЖИТЬ: " + resumeTopic.title : "МОЖНО НАЧИНАТЬ"}</small>
      </div>

      <div className="future-scroll-mark" aria-hidden="true">
        <span>ДАЛЬШЕ</span>
        <i />
      </div>

      <HomeFormulaTicker />
    </section>
  );
}
