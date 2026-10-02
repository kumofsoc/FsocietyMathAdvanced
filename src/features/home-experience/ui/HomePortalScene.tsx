interface PortalProps {
  resumeTopic?: { number: string; title: string };
  onPrimary: () => void;
  onMap: () => void;
}

export function HomePortalScene({ resumeTopic, onPrimary, onMap }: PortalProps) {
  return (
    <section className="future-scene future-portal" data-home-scene="portal">
      <div className="portal-grid" data-parallax aria-hidden="true"/>
      <div className="portal-halo" data-ambient="pulse" aria-hidden="true"/>
      <div className="portal-code" aria-hidden="true">09 / ENTER</div>
      <div className="portal-content">
        <div className="future-kicker" data-reveal><span>OPEN THE SYSTEM</span><i>NO RETURN REQUIRED</i></div>
        <h2 data-reveal>
          НЕ СМОТРИ.
          <span>ВХОДИ.</span>
        </h2>
        <p data-reveal>{resumeTopic ? "Точка продолжения сохранена: § " + resumeTopic.number + " / " + resumeTopic.title : "Первая точка входа уже готова."}</p>
        <div className="portal-actions" data-reveal>
          <button className="future-primary portal-primary" onClick={onPrimary}><span>{resumeTopic ? "CONTINUE" : "START"}</span><strong>ENTER ↘</strong></button>
          <button className="future-secondary" onClick={onMap}><span>UNIVERSE</span><strong>MAP ↗</strong></button>
        </div>
      </div>
      <div className="portal-footer" aria-hidden="true"><span>VISUALMATH</span><span>MATHEMATICS / INTERFACE / MOTION</span><span>3026</span></div>
    </section>
  );
}
