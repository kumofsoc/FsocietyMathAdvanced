import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Ранг — размерность реально передаваемой линейным отображением информации. Он одновременно равен размерности пространства столбцов, пространства строк и числу ведущих позиций в ступенчатой форме.",
    "theoremTitle": "Ранг и обратимость",
    "theoremBody": "Квадратная матрица A порядка n обратима тогда и только тогда, когда rank A=n; это эквивалентно det A≠0 и отсутствию ненулевого решения Ax=0.",
    "theoremFormula": "A^{-1}\\exists\\iff \\operatorname{rank}A=n\\iff\\det A\\ne0\\iff\\ker A=\\{0\\}",
    "proof": "Если A обратима, Ax=0 ⇒ x=A⁻¹0=0. Значит столбцы независимы и rank=n. Обратно, независимость n столбцов в n-мерном пространстве делает их базисом, поэтому отображение сюръективно и имеет обратный оператор.",
    "exampleTitle": "Разбор: ранг без полного Гаусса",
    "exampleBody": "Если третий столбец равен сумме первых двух, rank≤2. Если первые два столбца не пропорциональны, rank=2 — этого достаточно, не приводя всю матрицу к RREF.",
    "visual": "Ранг как потеря размерности",
    "visualBody": "Показывай, как квадрат/куб при вырожденном преобразовании схлопывается в прямую или плоскость."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Высокий ранг отдельных слагаемых ничего не гарантирует для rank(A+B): ранги могут резко уменьшаться из-за компенсации. Используй inequalities, а не «сложение рангов».");
export const blocks = [...academyBlocks, ...pitfallBlocks];
