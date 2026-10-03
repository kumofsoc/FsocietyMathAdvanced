import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Самосопряжённые операторы имеют ортонормированный спектральный базис; ортогональные сохраняют метрику; SVD раскладывает общий оператор на вращение, растяжение и ещё одно вращение.",
    "theoremTitle": "SVD",
    "theoremBody": "Для любой вещественной матрицы A существует разложение A=UΣVᵀ с ортогональными U,V и неотрицательной диагональной Σ.",
    "theoremFormula": "A=U\\Sigma V^T",
    "proof": "Матрица AᵀA симметрична и неотрицательно определена, значит имеет ортонормированный базис собственных векторов V. Сингулярные числа — sqrt собственных значений; ненулевые Avᵢ/σᵢ формируют столбцы U.",
    "exampleTitle": "Разбор: единичная окружность → эллипс",
    "exampleBody": "Сингулярные значения — длины полуосей эллипса, в который A переводит единичную окружность.",
    "visual": "SVD: круг → вращение → растяжение → вращение",
    "visualBody": "Три стадии U,Σ,Vᵀ с отображением главных направлений и сингулярных чисел."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Eigenvalues общего оператора и singular values — разные объекты. Singular values всегда неотрицательны и существуют для прямоугольных матриц; eigenvalues могут быть комплексными и требуют квадратной матрицы.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
