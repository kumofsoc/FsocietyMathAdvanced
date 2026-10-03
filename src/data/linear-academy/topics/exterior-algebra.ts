import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Внешняя алгебра кодирует ориентированные площади и объёмы без привязки к трёхмерному векторному произведению. Wedge-product автоматически антисимметричен.",
    "theoremTitle": "Критерий зависимости через wedge",
    "theoremBody": "Векторы v₁,…,v_k линейно зависимы тогда и только тогда, когда их внешнее произведение равно нулю.",
    "theoremFormula": "v_1\\wedge\\cdots\\wedge v_k=0\\iff v_1,\\dots,v_k\\text{ зависимы}",
    "proof": "При зависимости один вектор является комбинацией остальных; multilinearity и антисимметрия зануляют wedge. Обратно, ненулевой k-вектор задаёт ненулевой ориентированный k-объём, значит система независима.",
    "exampleTitle": "Разбор: площадь без cross product",
    "exampleBody": "В любой размерности u∧v представляет ориентированный параллелограмм; его норма равна sqrt(det Gram(u,v)).",
    "visual": "Wedge-product как ориентированный k-объём",
    "visualBody": "Два вектора образуют ориентированный параллелограмм; перестановка меняет знак, зависимость схлопывает площадь в ноль."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Wedge-product антикоммутативен: u∧v=−v∧u и u∧u=0. Его нельзя трактовать как обычное коммутативное умножение или как cross product вне специального 3D-контекста.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
