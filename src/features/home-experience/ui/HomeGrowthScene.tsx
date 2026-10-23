interface GrowthPoint {
  year: string;
  users: number;
}

export function HomeGrowthScene({ data }: { data: readonly GrowthPoint[] }) {
  const maxUsers = Math.max(...data.map((item) => item.users));
  const current = data.at(-1)!;
  const multiple = Math.round((current.users / data[0].users) * 10) / 10;
  const points = data.map((item,index)=>{
    const x=80+(index/(data.length-1))*760;
    const y=390-(item.users/maxUsers)*280;
    return { ...item, x, y };
  });
  const path = points.map((point,index)=> (index ? "L" : "M") + point.x + " " + point.y).join(" ");

  return (
    <section className="future-scene future-growth" data-home-scene="growth">
      <div className="growth-giant-year" data-parallax aria-hidden="true">{current.year}</div>
      <div className="future-growth-copy" data-reveal>
        <div className="future-kicker"><span>SIGNAL EXPANSION</span><i>DEMO DATA</i></div>
        <h2>Сигнал<br/>становится <em>громче.</em></h2>
        <div className="growth-metrics">
          <div><strong>{current.users.toLocaleString("ru-RU")}</strong><span>пользователей сейчас</span></div>
          <div><strong>×{multiple}</strong><span>рост с запуска</span></div>
          <div><strong>{data[0].year}</strong><span>старт проекта</span></div>
        </div>
      </div>

      <div className="future-growth-visual" data-reveal>
        <svg viewBox="0 0 920 470" role="img" aria-label="Демонстрационный рост пользователей MathMaMath">
          <g className="growth-grid">
            {Array.from({length:8},(_,i)=><line key={"v"+i} x1={70+i*110} y1="55" x2={70+i*110} y2="410"/>)}
            {Array.from({length:6},(_,i)=><line key={"h"+i} x1="50" y1={70+i*68} x2="880" y2={70+i*68}/>)}
          </g>
          <path className="growth-path-shadow" d={path}/>
          <path className="growth-path" d={path}/>
          {points.map((point)=>(
            <g key={point.year} className="growth-node">
              <circle cx={point.x} cy={point.y} r="8"/>
              <circle cx={point.x} cy={point.y} r="24" className="pulse"/>
              <text x={point.x} y={point.y-26} textAnchor="middle">{point.users.toLocaleString("ru-RU")}</text>
              <text x={point.x} y="438" textAnchor="middle" className="year">{point.year}</text>
            </g>
          ))}
        </svg>
        <div className="growth-demo-stamp">DEMO / NOT LIVE BACKEND DATA</div>
      </div>
    </section>
  );
}
