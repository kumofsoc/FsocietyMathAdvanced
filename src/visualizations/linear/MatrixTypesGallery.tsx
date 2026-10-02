import { useMemo, useState } from "react";

type HighlightMode =
  | "square"
  | "rect"
  | "row"
  | "column"
  | "diagonal"
  | "identity"
  | "upper"
  | "lower"
  | "symmetric"
  | "skew"
  | "zero";

interface MatrixType {
  title: string;
  size: string;
  note: string;
  description: string;
  mode: HighlightMode;
  values: string[][];
  examples: string[][][];
}

const matrixTypes: MatrixType[] = [
  {
    title: "Квадратная",
    size: "3×3",
    note: "m=n",
    description: "Число строк равно числу столбцов. Для неё определены det, след, характеристический многочлен и — при det≠0 — обратная матрица.",
    mode: "square",
    values: [["2","−1","4"],["0","3","5"],["7","1","6"]],
    examples: [
      [["1","2"],["3","4"]],
      [["2","0","1"],["−1","3","4"],["5","2","0"]],
      [["7"]],
    ],
  },
  {
    title: "Прямоугольная",
    size: "2×3",
    note: "m≠n",
    description: "Число строк и столбцов различается. Такая матрица естественно описывает линейное отображение между пространствами разных размерностей.",
    mode: "rect",
    values: [["1","2","3"],["4","5","6"]],
    examples: [
      [["1","0","2"],["3","−1","4"]],
      [["2","1"],["0","3"],["5","4"]],
      [["1","2","3","4"]],
    ],
  },
  {
    title: "Строка",
    size: "1×4",
    note: "одна строка",
    description: "Матрица с одной строкой. Её удобно рассматривать как вектор-строку.",
    mode: "row",
    values: [["1","−2","0","5"]],
    examples: [
      [["4","2","−1"]],
      [["0","0","0","1"]],
      [["a","b"]],
    ],
  },
  {
    title: "Столбец",
    size: "4×1",
    note: "один столбец",
    description: "Матрица с одним столбцом. В линейной алгебре это стандартная запись координат вектора.",
    mode: "column",
    values: [["1"],["−2"],["0"],["5"]],
    examples: [
      [["2"],["3"],["−1"]],
      [["x"],["y"],["z"]],
      [["1"],["0"]],
    ],
  },
  {
    title: "Диагональная",
    size: "3×3",
    note: "aᵢⱼ=0 при i≠j",
    description: "Все элементы вне главной диагонали равны нулю. Поэтому действия с такой матрицей почти полностью сводятся к действиям с диагональными элементами.",
    mode: "diagonal",
    values: [["4","0","0"],["0","−2","0"],["0","0","7"]],
    examples: [
      [["3","0"],["0","5"]],
      [["−1","0","0"],["0","2","0"],["0","0","9"]],
      [["0","0","0"],["0","4","0"],["0","0","−3"]],
    ],
  },
  {
    title: "Единичная",
    size: "3×3",
    note: "I",
    description: "Частный случай диагональной матрицы: на главной диагонали стоят единицы. Она играет роль числа 1 в умножении матриц.",
    mode: "identity",
    values: [["1","0","0"],["0","1","0"],["0","0","1"]],
    examples: [
      [["1","0"],["0","1"]],
      [["1"]],
      [["1","0","0","0"],["0","1","0","0"],["0","0","1","0"],["0","0","0","1"]],
    ],
  },
  {
    title: "Верхнетреугольная",
    size: "3×3",
    note: "aᵢⱼ=0 при i>j",
    description: "Ниже главной диагонали стоят нули. Её определитель равен произведению диагональных элементов.",
    mode: "upper",
    values: [["2","4","−1"],["0","3","5"],["0","0","7"]],
    examples: [
      [["2","5"],["0","−1"]],
      [["1","3","4"],["0","2","−5"],["0","0","6"]],
      [["a","b","c"],["0","d","e"],["0","0","f"]],
    ],
  },
  {
    title: "Нижнетреугольная",
    size: "3×3",
    note: "aᵢⱼ=0 при i<j",
    description: "Выше главной диагонали стоят нули. Как и для верхнетреугольной, det равен произведению элементов диагонали.",
    mode: "lower",
    values: [["2","0","0"],["4","3","0"],["−1","5","7"]],
    examples: [
      [["4","0"],["3","2"]],
      [["1","0","0"],["−2","5","0"],["7","3","6"]],
      [["a","0","0"],["b","c","0"],["d","e","f"]],
    ],
  },
  {
    title: "Симметричная",
    size: "3×3",
    note: "Aᵀ=A",
    description: "Элементы зеркально совпадают относительно главной диагонали: aᵢⱼ=aⱼᵢ.",
    mode: "symmetric",
    values: [["2","1","−3"],["1","5","4"],["−3","4","0"]],
    examples: [
      [["1","4"],["4","2"]],
      [["3","−1","2"],["−1","5","0"],["2","0","7"]],
      [["a","b"],["b","d"]],
    ],
  },
  {
    title: "Кососимметричная",
    size: "3×3",
    note: "Aᵀ=−A",
    description: "При отражении относительно диагонали знак меняется: aᵢⱼ=−aⱼᵢ. На диагонали обязательно стоят нули.",
    mode: "skew",
    values: [["0","2","−1"],["−2","0","4"],["1","−4","0"]],
    examples: [
      [["0","3"],["−3","0"]],
      [["0","1","2"],["−1","0","−5"],["−2","5","0"]],
      [["0","a"],["−a","0"]],
    ],
  },
  {
    title: "Нулевая",
    size: "3×3",
    note: "O",
    description: "Все элементы равны нулю. Это нейтральный элемент для сложения матриц.",
    mode: "zero",
    values: [["0","0","0"],["0","0","0"],["0","0","0"]],
    examples: [
      [["0","0"],["0","0"]],
      [["0","0","0"]],
      [["0"],["0"],["0"]],
    ],
  },
];

function cellClass(mode: HighlightMode, row: number, column: number, value: string) {
  const classes = ["matrix-cell"];
  if (mode === "diagonal" && row === column) classes.push("cell-diagonal");
  if (mode === "identity" && row === column && value === "1") classes.push("cell-identity");
  if (mode === "upper") classes.push(row <= column ? "cell-structure" : "cell-muted");
  if (mode === "lower") classes.push(row >= column ? "cell-structure" : "cell-muted");
  if (mode === "row") classes.push("cell-row");
  if (mode === "column") classes.push("cell-column");
  if (mode === "zero") classes.push("cell-zero");
  if (mode === "symmetric") {
    if (row === column) classes.push("cell-diagonal");
    else classes.push((row + column) % 2 === 0 ? "cell-pair-a" : "cell-pair-b");
  }
  if (mode === "skew") {
    if (row === column) classes.push("cell-zero");
    else classes.push(row < column ? "cell-pair-a" : "cell-pair-b");
  }
  if ((mode === "square" || mode === "rect") && row === column) classes.push("cell-soft");
  return classes.join(" ");
}

function MiniMatrix({
  values,
  mode,
  large = false,
}: {
  values: string[][];
  mode: HighlightMode;
  large?: boolean;
}) {
  return (
    <div className={"mini-matrix " + (large ? "large" : "")} aria-hidden="true">
      <i className="matrix-bracket left" />
      <div
        className="mini-matrix-grid"
        style={{ gridTemplateColumns: `repeat(${values[0]?.length ?? 1}, minmax(20px,1fr))` }}
      >
        {values.flatMap((row, rowIndex) =>
          row.map((value, columnIndex) => (
            <span
              className={cellClass(mode, rowIndex, columnIndex, value)}
              key={rowIndex + "-" + columnIndex}
            >
              {value}
            </span>
          )),
        )}
      </div>
      <i className="matrix-bracket right" />
    </div>
  );
}

export function MatrixTypesGallery() {
  const [selectedTitle, setSelectedTitle] = useState("Диагональная");
  const selected = useMemo(
    () => matrixTypes.find((item) => item.title === selectedTitle) ?? matrixTypes[0],
    [selectedTitle],
  );

  return (
    <section className="matrix-types-gallery">
      <header>
        <div className="eyebrow">ВИЗУАЛЬНЫЙ СПРАВОЧНИК</div>
        <h2>Тип матрицы видно по рисунку элементов.</h2>
        <p>
          Нажми на карточку типа: снизу откроется увеличенный разбор и несколько разных
          примеров. Цвет показывает именно структурно важные элементы, а не просто украшает таблицу.
        </p>
      </header>

      <div className="matrix-type-grid">
        {matrixTypes.map((item) => (
          <button
            className={"matrix-type-card " + (selected.title === item.title ? "active" : "")}
            key={item.title}
            onClick={() => setSelectedTitle(item.title)}
          >
            <div className="matrix-type-head">
              <strong>{item.title}</strong>
              <span>{item.size}</span>
            </div>
            <MiniMatrix values={item.values} mode={item.mode} />
            <small>{item.note}</small>
          </button>
        ))}
      </div>

      <div className="matrix-type-detail">
        <div className="matrix-type-detail-copy">
          <div className="eyebrow">ВЫБРАННЫЙ ТИП</div>
          <h3>{selected.title}</h3>
          <p>{selected.description}</p>
          <code>{selected.note}</code>
        </div>

        <div className="matrix-type-detail-main">
          <MiniMatrix values={selected.values} mode={selected.mode} large />
        </div>

        <div className="matrix-type-examples">
          {selected.examples.map((example, index) => (
            <article key={index}>
              <span>ПРИМЕР {index + 1}</span>
              <MiniMatrix values={example} mode={selected.mode} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
