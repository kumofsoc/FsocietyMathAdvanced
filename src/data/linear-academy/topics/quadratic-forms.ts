import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Квадратичная форма q(x)=xᵀAx геометрически задаёт семейство квадрик, а алгебраически — симметричный билинейный закон. Главные оси — собственные направления симметричной части.",
    "theoremTitle": "Спектральная нормальная форма",
    "theoremBody": "В ортонормированном базисе вещественная симметричная квадратичная форма диагональна.",
    "theoremFormula": "A=A^T\\Rightarrow q(x)=\\sum_i\\lambda_i y_i^2",
    "proof": "Спектральная теорема даёт ортогональную Q с QᵀAQ=D. Замена x=Qy переводит xᵀAx в yᵀDy.",
    "exampleTitle": "Разбор: definiteness",
    "exampleBody": "q=3x²+2xy+3y² имеет матрицу [[3,1],[1,3]] с собственными значениями 4 и 2, значит форма положительно определена.",
    "visual": "Квадратичная форма как вращаемый эллипс/гипербола",
    "visualBody": "Управление собственными значениями и углом собственных векторов меняет линии уровня."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Положительные диагональные элементы матрицы не гарантируют положительную определённость. Нужны собственные значения, критерий Сильвестра или эквивалентный инвариантный тест.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
