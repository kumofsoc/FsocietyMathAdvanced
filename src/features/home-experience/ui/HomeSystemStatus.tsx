export function HomeSystemStatus({
  progress,
  resumeTopic,
}: {
  progress: number;
  resumeTopic?: { number: string; title: string };
}) {
  const cards = [
    {
      label: "ТЕКУЩАЯ ТЕМА",
      value: resumeTopic ? "§ " + resumeTopic.number : "Старт",
      detail: resumeTopic?.title ?? "Выбери первую тему",
    },
    {
      label: "ПРОГРЕСС КУРСА",
      value: progress + "%",
      detail: "среднее освоение изучаемых тем",
    },
    {
      label: "СЛЕДУЮЩИЙ ШАГ",
      value: resumeTopic ? "Продолжить" : "Начать",
      detail: resumeTopic ? "вернуться к последней теме" : "открыть первый раздел",
    },
    {
      label: "КАРТА КУРСА",
      value: "Доступна",
      detail: "все разделы и зависимости",
    },
  ];

  return (
    <section className="future-scene future-status" data-home-scene="status">
      <div className="future-scene-index" aria-hidden="true">01 / ПРОГРЕСС</div>
      <div className="future-status-head" data-reveal>
        <div className="future-kicker"><span>ВАШ ПРОГРЕСС</span><i>АКТУАЛЬНЫЕ ДАННЫЕ</i></div>
        <h2>Продолжай с того места,<br/><em>где остановился.</em></h2>
      </div>

      <div className="future-status-grid">
        <article className="future-status-master" data-reveal>
          <span>ОСВОЕНИЕ КУРСА</span>
          <strong>{progress.toString().padStart(2, "0")}%</strong>
          <div className="status-radar" aria-hidden="true">
            <i/><i/><i/><i/>
            <b style={{ transform: "rotate(" + Math.max(20, progress * 2.4) + "deg)" }} />
          </div>
          <small>{resumeTopic ? "ПРОДОЛЖИТЬ / § " + resumeTopic.number + " / " + resumeTopic.title : "ВЫБЕРИ ПЕРВУЮ ТЕМУ"}</small>
        </article>

        <div className="future-telemetry-stack">
          {cards.map((item, index) => (
            <article key={item.label} data-reveal className="future-telemetry-card">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><small>{item.label}</small><strong>{item.value}</strong></div>
              <b>{item.detail}</b>
            </article>
          ))}
        </div>

        <article className="future-status-wave" data-parallax aria-hidden="true">
          <div className="status-wave-bars">
            {Array.from({ length: 48 }, (_, index) => (
              <i key={index} style={{ "--h": 20 + ((index * 37 + progress) % 78) + "%" } as React.CSSProperties} />
            ))}
          </div>
          <span>ПРОГРЕСС ОБНОВЛЯЕТСЯ ПО МЕРЕ ИЗУЧЕНИЯ И РЕШЕНИЯ ЗАДАЧ</span>
        </article>
      </div>
    </section>
  );
}
