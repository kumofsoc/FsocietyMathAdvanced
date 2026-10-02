import type { HomeMotionTier } from "../model/homeExperience";
import { HomeCore3D } from "../visual/HomeCore3D";
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
          <span>VISUALMATH</span>
          <i>INTERFACE / 3026</i>
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
            <span>{resumeTopic ? "CONTINUE" : "ENTER"}</span>
            <strong>{resumeTopic ? "§ " + resumeTopic.number : "START"}</strong>
          </button>
          <button className="future-secondary" onClick={onMap}>
            <span>COURSE UNIVERSE</span>
            <strong>OPEN MAP ↗</strong>
          </button>
        </div>

        <div className="future-system-line" data-reveal>
          <span>SYSTEM ONLINE</span>
          <span>KNOWLEDGE CORE / STABLE</span>
          <span>LOCAL TIME / ∞</span>
        </div>
      </div>

      <div className="future-core-stage" data-parallax>
        <div className="future-core-orbit-label label-a" data-ambient="orbit">ALGEBRA</div>
        <div className="future-core-orbit-label label-b" data-ambient="orbit">ANALYSIS</div>
        <div className="future-core-orbit-label label-c" data-ambient="orbit">GEOMETRY</div>
        <HomeCore3D tier={motionTier} />
      </div>

      <div className="future-mastery-card" data-reveal>
        <div>
          <span>COURSE MASTERY</span>
          <strong>{progress}%</strong>
        </div>
        <i><b style={{ width: progress + "%" }} /></i>
        <small>{resumeTopic ? "RESUME / " + resumeTopic.title : "READY FOR ENTRY"}</small>
      </div>

      <div className="future-scroll-mark" aria-hidden="true">
        <span>DESCEND</span>
        <i />
      </div>

      <HomeFormulaTicker />
    </section>
  );
}
