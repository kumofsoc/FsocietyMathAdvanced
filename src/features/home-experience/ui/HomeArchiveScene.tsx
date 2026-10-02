const fragments = [
  ["ARC-7A", "Topology of impossible surfaces", "3026.184"],
  ["ARC-11", "Synthetic eigenmemory", "3026.201"],
  ["ARC-19", "Continuum without observer", "3026.244"],
  ["ARC-∞", "Unresolved object", "UNKNOWN"],
];

export function HomeArchiveScene() {
  return (
    <section className="future-scene future-archive" data-home-scene="archive">
      <div className="archive-vertical" aria-hidden="true">ARCHIVE / 3026 / FICTIONAL FUTURE INTERFACE</div>
      <div className="archive-head" data-reveal>
        <div className="future-kicker"><span>ARCHIVE 3026</span><i>ARTISTIC / FICTIONAL</i></div>
        <h2>Документы из<br/><em>будущего, которого нет.</em></h2>
      </div>
      <div className="archive-catalog">
        {fragments.map((fragment,index)=>(
          <article key={fragment[0]} data-reveal className={"archive-sheet archive-sheet-"+index}>
            <div className="archive-barcode" aria-hidden="true"/>
            <span>{fragment[0]}</span>
            <strong>{fragment[1]}</strong>
            <small>{fragment[2]}</small>
            <p aria-hidden="true">∫∫ Ω dA · det(Λ − I) / lim<sub>n→∞</sub> Σ ψₙ</p>
          </article>
        ))}
      </div>
      <div className="archive-tape" data-ambient="ticker" aria-hidden="true">
        <span>THIS SECTION IS AN ARTISTIC FUTURE ARCHIVE</span>
        <span>NOT HISTORICAL DATA</span>
        <span>VISUALMATH / 3026</span>
        <span>THIS SECTION IS AN ARTISTIC FUTURE ARCHIVE</span>
      </div>
    </section>
  );
}
