import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Линейное преобразование полностью определяется образами базисных векторов. Столбцы матрицы оператора — именно эти образы в выбранном базисе.",
    "theoremTitle": "Определение оператора по базису",
    "theoremBody": "Если задать произвольные образы n базисных векторов, существует единственный линейный оператор, реализующий это задание.",
    "theoremFormula": "T\\left(\\sum_i\\xi_i e_i\\right)=\\sum_i\\xi_iT(e_i)",
    "proof": "Линейность вынуждает указанную формулу, поэтому единственность очевидна; сама формула корректно определяет оператор на каждом векторе.",
    "exampleTitle": "Разбор: shear",
    "exampleBody": "Матрица [[1,k],[0,1]] оставляет e₁ на месте и переводит e₂ в (k,1). Квадрат превращается в параллелограмм без изменения площади.",
    "visual": "Линейный оператор на сетке и базисе",
    "visualBody": "Слайдеры элементов 2×2 матрицы деформируют координатную сетку и отображают образы e₁,e₂."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("T(0)=0 обязательно для линейного оператора. Если отображение содержит ненулевой перенос b, это уже аффинное, а не линейное преобразование.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
