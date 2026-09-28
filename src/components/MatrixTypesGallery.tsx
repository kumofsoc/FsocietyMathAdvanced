const matrixTypes = [
  {
    title: "Квадратная",
    size: "3×3",
    note: "m=n",
    values: [["2","−1","4"],["0","3","5"],["7","1","6"]],
  },
  {
    title: "Прямоугольная",
    size: "2×3",
    note: "m≠n",
    values: [["1","2","3"],["4","5","6"]],
  },
  {
    title: "Строка",
    size: "1×4",
    note: "одна строка",
    values: [["1","−2","0","5"]],
  },
  {
    title: "Столбец",
    size: "4×1",
    note: "один столбец",
    values: [["1"],["−2"],["0"],["5"]],
  },
  {
    title: "Диагональная",
    size: "3×3",
    note: "aᵢⱼ=0 при i≠j",
    values: [["4","0","0"],["0","−2","0"],["0","0","7"]],
  },
  {
    title: "Единичная",
    size: "3×3",
    note: "I",
    values: [["1","0","0"],["0","1","0"],["0","0","1"]],
  },
  {
    title: "Верхнетреугольная",
    size: "3×3",
    note: "aᵢⱼ=0 при i>j",
    values: [["2","4","−1"],["0","3","5"],["0","0","7"]],
  },
  {
    title: "Нижнетреугольная",
    size: "3×3",
    note: "aᵢⱼ=0 при i<j",
    values: [["2","0","0"],["4","3","0"],["−1","5","7"]],
  },
  {
    title: "Симметричная",
    size: "3×3",
    note: "Aᵀ=A",
    values: [["2","1","−3"],["1","5","4"],["−3","4","0"]],
  },
  {
    title: "Кососимметричная",
    size: "3×3",
    note: "Aᵀ=−A",
    values: [["0","2","−1"],["−2","0","4"],["1","−4","0"]],
  },
  {
    title: "Нулевая",
    size: "3×3",
    note: "O",
    values: [["0","0","0"],["0","0","0"],["0","0","0"]],
  },
];

function MiniMatrix({ values }: { values: string[][] }) {
  return (
    <div className="mini-matrix" aria-hidden="true">
      <i className="matrix-bracket left" />
      <div className="mini-matrix-grid" style={{ gridTemplateColumns: `repeat(${values[0]?.length ?? 1}, minmax(20px,1fr))` }}>
        {values.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <span key={rowIndex + "-" + columnIndex}>{value}</span>
          )),
        )}
      </div>
      <i className="matrix-bracket right" />
    </div>
  );
}

export function MatrixTypesGallery() {
  return (
    <section className="matrix-types-gallery">
      <header>
        <div className="eyebrow">ВИЗУАЛЬНЫЙ СПРАВОЧНИК</div>
        <h2>Тип матрицы видно по рисунку элементов.</h2>
        <p>
          Размер матрицы — это число строк × число столбцов. Для квадратных матриц
          особенно важна главная диагональ: именно относительно неё определяются
          диагональные, треугольные, симметричные и кососимметричные матрицы.
        </p>
      </header>

      <div className="matrix-type-grid">
        {matrixTypes.map((item) => (
          <article key={item.title}>
            <div className="matrix-type-head">
              <strong>{item.title}</strong>
              <span>{item.size}</span>
            </div>
            <MiniMatrix values={item.values} />
            <small>{item.note}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
