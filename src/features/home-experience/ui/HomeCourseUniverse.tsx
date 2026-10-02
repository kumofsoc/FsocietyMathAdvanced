const nodes = [
  ["SETS", "08", "12%"],
  ["LINEAR", "21", "32%"],
  ["ANALYSIS", "34", "54%"],
  ["GEOMETRY", "19", "67%"],
  ["ODE", "16", "79%"],
  ["FOURIER", "09", "91%"],
];

export function HomeCourseUniverse({ onOpenMap }: { onOpenMap: () => void }) {
  return (
    <section className="future-scene future-universe" data-home-scene="universe">
      <div className="future-universe-copy" data-reveal>
        <div className="future-kicker"><span>COURSE UNIVERSE</span><i>ABSTRACT PREVIEW</i></div>
        <h2>Не список тем.<br/><em>Топология знания.</em></h2>
        <button className="future-link-button" onClick={onOpenMap}>OPEN REAL G6 MAP <span>↗</span></button>
      </div>

      <div className="future-constellation" data-parallax aria-hidden="true">
        <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="constellationLine" x1="0" x2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity=".15"/>
              <stop offset="50%" stopColor="var(--accent2)" stopOpacity=".75"/>
              <stop offset="100%" stopColor="var(--accent)" stopOpacity=".12"/>
            </linearGradient>
          </defs>
          <g className="constellation-lines">
            <path d="M90 410 C240 290 290 160 430 220 S650 410 820 180"/>
            <path d="M210 520 C310 390 460 400 555 305 S720 170 905 320"/>
            <path d="M90 410 C310 520 600 520 905 320"/>
          </g>
          {[
            [90,410],[210,520],[430,220],[555,305],[820,180],[905,320]
          ].map(([x,y],index)=>(
            <g key={index} className="constellation-point">
              <circle cx={x} cy={y} r={index===3?22:12}/>
              <circle cx={x} cy={y} r={index===3?42:28} className="halo"/>
            </g>
          ))}
        </svg>
        {nodes.map((node,index)=>(
          <div key={node[0]} className={"constellation-label label-"+index} data-ambient="drift">
            <small>{node[1]}</small><strong>{node[0]}</strong><span>{node[2]}</span>
          </div>
        ))}
        <div className="universe-axis axis-a"/><div className="universe-axis axis-b"/>
      </div>
    </section>
  );
}
