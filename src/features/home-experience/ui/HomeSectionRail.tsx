import { HOME_SCENES } from "../model/homeScenes";

export function HomeSectionRail({ activeIndex }: { activeIndex: number }) {
  const active = HOME_SCENES[activeIndex] ?? HOME_SCENES[0];

  return (
    <aside className="future-section-rail" aria-label="Текущая сцена">
      <div className="future-rail-code">{active.code}</div>
      <div className="future-rail-track">
        <i style={{ height: ((activeIndex + 1) / HOME_SCENES.length) * 100 + "%" }} />
      </div>
      <div className="future-rail-copy">
        <span>{active.label}</span>
        <small>{String(activeIndex + 1).padStart(2, "0")} / {String(HOME_SCENES.length).padStart(2, "0")}</small>
      </div>
    </aside>
  );
}
