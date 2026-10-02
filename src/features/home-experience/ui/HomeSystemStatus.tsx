interface TelemetryItem {
  label: string;
  value: string;
  unit: string;
}

export function HomeSystemStatus({
  progress,
  resumeTopic,
  telemetry,
}: {
  progress: number;
  resumeTopic?: { number: string; title: string };
  telemetry: readonly TelemetryItem[];
}) {
  return (
    <section className="future-scene future-status" data-home-scene="status">
      <div className="future-scene-index" aria-hidden="true">01 / STATUS</div>
      <div className="future-status-head" data-reveal>
        <div className="future-kicker"><span>SYSTEM STATUS</span><i>LIVE / LOCAL</i></div>
        <h2>Ты не читаешь курс.<br/><em>Ты находишься внутри него.</em></h2>
      </div>

      <div className="future-status-grid">
        <article className="future-status-master" data-reveal>
          <span>REAL / COURSE MASTERY</span>
          <strong>{progress.toString().padStart(2, "0")}%</strong>
          <div className="status-radar" aria-hidden="true">
            <i/><i/><i/><i/>
            <b style={{ transform: "rotate(" + Math.max(20, progress * 2.4) + "deg)" }} />
          </div>
          <small>{resumeTopic ? "NEXT SIGNAL / § " + resumeTopic.number + " / " + resumeTopic.title : "NO RESUME POINT"}</small>
        </article>

        <div className="future-telemetry-stack">
          {telemetry.map((item, index) => (
            <article key={item.label} data-reveal className="future-telemetry-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{item.label}</small><strong>{item.value}</strong></div>
              <b>{item.unit}</b>
            </article>
          ))}
        </div>

        <article className="future-status-wave" data-parallax aria-hidden="true">
          <div className="status-wave-bars">
            {Array.from({ length: 48 }, (_, index) => (
              <i key={index} style={{ "--h": 20 + ((index * 37) % 78) + "%" } as React.CSSProperties} />
            ))}
          </div>
          <span>DECORATIVE TELEMETRY / NOT ACCOUNT DATA</span>
        </article>
      </div>
    </section>
  );
}
