const modules = [
  { code: "01", title: "КОНТЕКСТ", copy: "История переходов и точка продолжения не исчезают между разделами.", mark: "↶" },
  { code: "02", title: "КАРТА", copy: "Знания связаны в G6-граф, а не разложены в мёртвый список.", mark: "⌬" },
  { code: "03", title: "ИНТЕРАКТИВНОСТЬ", copy: "Матрицы, поля, поверхности и формулы становятся объектами.", mark: "∿" },
  { code: "04", title: "ПЕРСОНАЛИЗАЦИЯ", copy: "Темы, прогресс, профиль, курсор и музыка собираются вокруг пользователя.", mark: "◉" },
  { code: "05", title: "АНИМАЦИЯ", copy: "Движение объясняет структуру интерфейса, а не просто украшает её.", mark: "≈" },
];

export function HomeInterfaceDNA() {
  return (
    <section className="future-scene future-dna" data-home-scene="dna">
      <div className="future-dna-head" data-reveal>
        <div className="future-kicker"><span>ВОЗМОЖНОСТИ ИНТЕРФЕЙСА</span><i>5 КЛЮЧЕВЫХ ФУНКЦИЙ</i></div>
        <h2>Структура<br/>имеет <em>характер.</em></h2>
      </div>
      <div className="dna-stack">
        {modules.map((module,index)=>(
          <article key={module.code} className={"dna-card dna-card-"+index} data-reveal>
            <div className="dna-card-scan" aria-hidden="true"/>
            <span>{module.code}</span>
            <b aria-hidden="true">{module.mark}</b>
            <strong>{module.title}</strong>
            <p>{module.copy}</p>
            <small>ВОЗМОЖНОСТЬ {module.code}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
