const fragments = [
  ["ARC-7A", "Topology of impossible surfaces", "VM.ARCH"],
  ["ARC-11", "Synthetic eigenmemory", "VM.ARCH"],
  ["ARC-19", "Continuum without observer", "VM.ARCH"],
  ["ARC-∞", "Unresolved object", "UNKNOWN"],
];

export function HomeArchiveScene() {
  return (
    <section className="future-scene future-archive" data-home-scene="archive">
      <div className="archive-vertical" aria-hidden="true">АРХИВ ИДЕЙ / ЭКСПЕРИМЕНТАЛЬНЫЙ РАЗДЕЛ</div>
      <div className="archive-head" data-reveal>
        <div className="future-kicker"><span>АРХИВ ИДЕЙ</span><i>ЭКСПЕРИМЕНТАЛЬНЫЙ РАЗДЕЛ</i></div>
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
        <span>ЭКСПЕРИМЕНТАЛЬНЫЙ АРХИВ МАТЕМАТИЧЕСКИХ ИДЕЙ</span>
        <span>НЕ УЧЕБНАЯ СТАТИСТИКА</span>
        <span>VISUALMATH / ARCHIVE</span>
        <span>ЭКСПЕРИМЕНТАЛЬНЫЙ АРХИВ МАТЕМАТИЧЕСКИХ ИДЕЙ</span>
      </div>
    </section>
  );
}
