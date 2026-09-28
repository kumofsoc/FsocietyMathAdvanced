const two = [["5","2"],["7","3"]];
const three = [["2","1","3"],["5","3","2"],["1","4","3"]];
const expandedExample = [
  ["1","2","3","1","2"],
  ["4","5","6","4","5"],
  ["7","8","0","7","8"],
];

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

function ExpandedSarrus() {
  return (
    <div className="expanded-sarrus">
      <div className="expanded-sarrus-grid">
        {expandedExample.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <span
              key={rowIndex + "-" + columnIndex}
              className={columnIndex >= 3 ? "copied-column" : ""}
            >
              {value}
            </span>
          )),
        )}

        <svg viewBox="0 0 500 240" preserveAspectRatio="none" aria-hidden="true">
          <path className="sarrus-plus p1" d="M50 35 L245 205" />
          <path className="sarrus-plus p2" d="M145 35 L340 205" />
          <path className="sarrus-plus p3" d="M240 35 L435 205" />

          <path className="sarrus-minus m1" d="M240 35 L50 205" />
          <path className="sarrus-minus m2" d="M335 35 L145 205" />
          <path className="sarrus-minus m3" d="M430 35 L240 205" />
        </svg>
      </div>

      <div className="expanded-sarrus-legend">
        <span><i className="plus-dot" /> первые два столбца скопированы справа</span>
        <span><i className="plus-line-dot" /> диагонали ↘ складываются</span>
        <span><i className="minus-line-dot" /> диагонали ↙ вычитаются</span>
      </div>
    </div>
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
          Для 3×3 правило Саррюса удобно рисовать как расширенную схему 3×5.
        </p>
      </header>

      <div className="det-visual-grid">
        <article className="det-card">
          <div className="det-card-title">
            <span>2×2</span>
            <strong>Диагональный крест</strong>
          </div>
          <div className="det-stage">
            <DetMatrix values={two} />
            <svg viewBox="0 0 240 160" aria-hidden="true">
              <path className="plus-line" d="M68 42 L172 118" />
              <path className="minus-line" d="M172 42 L68 118" />
            </svg>
          </div>
          <div className="det-equation">
            <span className="plus">5·3</span>
            <span>−</span>
            <span className="minus">2·7</span>
            <span>=</span>
            <strong>1</strong>
          </div>
          <p>Главная диагональ идёт со знаком «+», побочная — со знаком «−».</p>
        </article>

        <article className="det-card">
          <div className="det-card-title">
            <span>3×3</span>
            <strong>Правило Саррюса</strong>
          </div>
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
          <p>Это краткая запись того же метода: справа повторяются первые два столбца.</p>
        </article>
      </div>

      <article className="det-expanded-method">
        <div className="det-card-title">
          <span>3×3 / РАСШИРЕННАЯ СХЕМА</span>
          <strong>Саррюс через матрицу 3×5</strong>
        </div>

        <div className="det-expanded-layout">
          <ExpandedSarrus />

          <div className="det-expanded-copy">
            <div className="det-method-steps">
              <div><b>1</b><p>Записываем исходную матрицу 3×3.</p></div>
              <div><b>2</b><p>Справа дописываем <strong>первый и второй столбцы</strong>. Получаем схему 3×5.</p></div>
              <div><b>3</b><p>Складываем произведения трёх диагоналей, идущих слева направо вниз.</p></div>
              <div><b>4</b><p>Вычитаем произведения трёх диагоналей, идущих слева направо вверх.</p></div>
            </div>
          </div>
        </div>

        <div className="det-calculation-flow">
          <div>
            <span className="plus">Сумма ↘</span>
            <code>(1·5·0) + (2·6·7) + (3·4·8) = 0 + 84 + 96 = 180</code>
          </div>
          <div>
            <span className="minus">Сумма ↙</span>
            <code>(3·5·7) + (1·6·8) + (2·4·0) = 105 + 48 + 0 = 153</code>
          </div>
          <div className="det-final-result">
            <span>Разность</span>
            <strong>det A = 180 − 153 = 27</strong>
          </div>
        </div>
      </article>

      <div className="det-plain-example">
        <span>ОБЫЧНЫЙ ПРИМЕР</span>
        <div className="det-plain-line">
          <strong>det</strong>
          <DetMatrix values={[["3","2"],["8","5"]]} />
          <b>= 3·5 − 2·8 = −1</b>
        </div>
        <p>Здесь тот же принцип для 2×2: произведение главной диагонали минус произведение побочной.</p>
      </div>
    </section>
  );
}
