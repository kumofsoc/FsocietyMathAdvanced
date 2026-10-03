import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Векторное произведение в ℝ³ одновременно кодирует площадь, ориентацию и нормаль к двум векторам. Это не независимая магия, а метрически идентифицированная внешняя 2-форма.",
    "theoremTitle": "Норма векторного произведения",
    "theoremBody": "Длина a×b равна площади параллелограмма на a и b.",
    "theoremFormula": "\\|a\\times b\\|=\\|a\\|\\,\\|b\\|\\sin\\theta",
    "proof": "Квадрат длины a×b равен детерминанту матрицы Грама двух векторов: ||a||²||b||²-⟨a,b⟩².",
    "exampleTitle": "Разбор: нормаль плоскости",
    "exampleBody": "Для двух направлений плоскости u и v вектор n=u×v ортогонален обоим, поэтому может служить нормалью в уравнении n·(x-x₀)=0.",
    "visual": "Площадь и правило правой руки",
    "visualBody": "Показывай параллелограмм, нормаль и изменение знака при перестановке a и b."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Векторное произведение в привычном виде специфично для ориентированного ℝ³. В более высокой размерности фундаментальным объектом становится exterior product a∧b.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
