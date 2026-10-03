import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Полная классификация квадрик строится не по внешнему виду формулы, а по инвариантам квадратичной формы и расширенной матрицы. Это координатно-независимая версия аналитической геометрии.",
    "theoremTitle": "Инвариантность ранга квадратичной части",
    "theoremBody": "При невырожденной линейной замене координат матрица квадратичной формы преобразуется конгруэнцией, поэтому её ранг сохраняется.",
    "theoremFormula": "A'=S^TAS,\\quad S\\in GL(n)\\Rightarrow\\operatorname{rank}A'=\\operatorname{rank}A",
    "proof": "Умножение слева и справа на обратимые матрицы не меняет ранг: rank(SᵀAS)=rank A.",
    "exampleTitle": "Разбор: знак сигнатуры",
    "exampleBody": "Формы x²+y² и -x²-y² задают одинаковый пустой/эллиптический тип после умножения всего уравнения на -1, поэтому в классификации важен модуль сигнатуры.",
    "visual": "Инварианты квадрики при смене координат",
    "visualBody": "Вращай/сдвигай координаты и показывай, что r,R,|σ|,|Σ| остаются неизменными."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Каноническая форма зависит от разрешённого класса преобразований. Аффинная эквивалентность и евклидова эквивалентность сохраняют разные наборы инвариантов.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
