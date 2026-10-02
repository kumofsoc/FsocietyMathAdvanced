const modules = [
  { code: "01", title: "CONTEXT", copy: "История переходов и точка продолжения не исчезают между разделами.", mark: "↶" },
  { code: "02", title: "MAP", copy: "Знания связаны в G6-граф, а не разложены в мёртвый список.", mark: "⌬" },
  { code: "03", title: "INTERACTIVE", copy: "Матрицы, поля, поверхности и формулы становятся объектами.", mark: "∿" },
  { code: "04", title: "PERSONAL", copy: "Темы, прогресс, профиль, курсор и музыка собираются вокруг пользователя.", mark: "◉" },
  { code: "05", title: "MOTION", copy: "Движение объясняет структуру интерфейса, а не просто украшает её.", mark: "≈" },
];

export function HomeInterfaceDNA() {
  return (
    <section className="future-scene future-dna" data-home-scene="dna">
      <div className="future-dna-head" data-reveal>
        <div className="future-kicker"><span>INTERFACE DNA</span><i>05 MODULES</i></div>
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
            <small>VM.MOD/{module.code}.3026</small>
          </article>
        ))}
      </div>
    </section>
  );
}
