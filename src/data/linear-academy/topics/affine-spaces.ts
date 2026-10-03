import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Аффинное пространство отделяет точки от векторов: точки нельзя канонически складывать, но разность двух точек — вектор, а к точке можно прибавить вектор.",
    "theoremTitle": "Аффинная плоскость как смещение подпространства",
    "theoremBody": "Любое множество решений совместной линейной системы Ax=b является аффинным подпространством x₀+ker A.",
    "theoremFormula": "\\{x:Ax=b\\}=x_0+\\ker A",
    "proof": "Если Ax₀=b, то A(x₀+v)=b для v∈ker A. Обратно, для любого решения x разность x-x₀ лежит в ker A.",
    "exampleTitle": "Разбор: плоскость решений",
    "exampleBody": "Уравнение x+y+z=1 задаёт аффинную плоскость; её направляющее пространство x+y+z=0 проходит через начало.",
    "visual": "Точка + направляющее подпространство",
    "visualBody": "Показывай линейную плоскость через 0 и её параллельный аффинный сдвиг через выбранную точку."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Точки аффинного пространства нельзя канонически складывать как векторы. Осмысленны разность двух точек и прибавление вектора к точке; выбор начала координат — дополнительная структура.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
