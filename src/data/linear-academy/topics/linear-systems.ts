import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "СЛАУ — геометрия пересечения аффинных подпространств и одновременно задача о принадлежности b образу линейного оператора A.",
    "theoremTitle": "Кронекер–Капелли в операторной форме",
    "theoremBody": "Система Ax=b совместна тогда и только тогда, когда b принадлежит Im A, то есть ранг A совпадает с рангом расширенной матрицы.",
    "theoremFormula": "Ax=b\\text{ совместна}\\iff b\\in\\operatorname{Im}A\\iff\\operatorname{rank}A=\\operatorname{rank}[A|b]",
    "proof": "Столбец b должен быть линейной комбинацией столбцов A. Добавление b не увеличивает размерность их линейной оболочки ровно тогда, когда такая комбинация существует.",
    "exampleTitle": "Разбор: число параметров",
    "exampleBody": "Если система совместна, имеет n неизвестных и rank A=r, множество решений — аффинное подпространство размерности n-r.",
    "exampleFormula": "x=x_0+\\ker A,\\qquad \\dim\\ker A=n-r",
    "visual": "Система как пересечение прямых и плоскостей",
    "visualBody": "Показывай три режима: единственная точка, бесконечная линия решений и несовместные параллельные ограничения."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Количество уравнений не равно числу независимых ограничений. Дублированные или линейно зависимые строки не увеличивают rank и не уменьшают размерность решения.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
