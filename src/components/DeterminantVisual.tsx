const two = [["5","2"],["7","3"]];
const three = [["2","1","3"],["5","3","2"],["1","4","3"]];

function DetMatrix({ values }: { values: string[][] }) {
  return (
    <span className="det-matrix">
      <i className="left" />
      <span
        className="det-matrix-grid"
        style={{ gridTemplateColumns: "repeat(" + values[0].length + ", 1fr)" }}
      >
        {values.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <b key={rowIndex + "-" + columnIndex}>{value}</b>
          )),
        )}
      </span>
      <i className="right" />
    </span>
  );
}

export function DeterminantVisual() {
  return (
    <section className="det-visual">
      <header>
        <div className="eyebrow">ГРАФИЧЕСКИЙ ПРИМЕР</div>
        <h2>Сначала схема. Потом вычисление.</h2>
        <p>
          Для 2×2 определитель — разность двух диагональных произведений.
          Для 3×3 правило Саррюса организует шесть произведений в две группы.
        </p>
      </header>

      <div className="det-visual-grid">
        <article className="det-card">
          <div className="det-card-title"><span>2×2</span><strong>Диагональный крест</strong></div>
          <div className="det-stage">
            <DetMatrix values={two} />
            <svg viewBox="0 0 240 160" aria-hidden="true">
              <path className="plus-line" d="M68 42 L172 118" />
              <path className="minus-line" d="M172 42 L68 118" />
            </svg>
          </div>
          <div className="det-equation">
            <span className="plus">5·3</span><span>−</span><span className="minus">2·7</span>
            <span>=</span><strong>1</strong>
          </div>
          <p>Главная диагональ идёт со знаком «+», побочная — со знаком «−».</p>
        </article>

        <article className="det-card">
          <div className="det-card-title"><span>3×3</span><strong>Правило Саррюса</strong></div>
          <div className="sarrus-layout">
            <DetMatrix values={three} />
            <div className="sarrus-copy" aria-hidden="true">
              <span>2</span><span>1</span>
              <span>5</span><span>3</span>
              <span>1</span><span>4</span>
            </div>
          </div>
          <div className="sarrus-groups">
            <div>
              <span className="plus">+</span>
              <code>2·3·3 + 1·2·1 + 3·5·4</code>
            </div>
            <div>
              <span className="minus">−</span>
              <code>3·3·1 + 1·5·3 + 2·2·4</code>
            </div>
          </div>
          <p>Первые два столбца мысленно дублируются справа, чтобы диагонали были видны сразу.</p>
        </article>
      </div>

      <div className="det-plain-example">
        <span>ОБЫЧНЫЙ ПРИМЕР</span>
        <strong>det [[3, 2], [8, 5]] = 3·5 − 2·8 = −1</strong>
        <p>Это тот же алгоритм без графической подсветки: два произведения, затем разность.</p>
      </div>
    </section>
  );
}
