import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Аффинное преобразование x↦Ax+b сохраняет прямые, параллельность и барицентрические отношения, но не обязано сохранять длины или углы.",
    "theoremTitle": "Сохранение барицентрических комбинаций",
    "theoremBody": "Если коэффициенты αᵢ суммируются в 1, аффинное отображение переносит их комбинацию в ту же комбинацию образов.",
    "theoremFormula": "\\sum_i\\alpha_i=1\\Rightarrow f\\left(\\sum_i\\alpha_ix_i\\right)=\\sum_i\\alpha_i f(x_i)",
    "proof": "Подставляем f(x)=Ax+b: AΣαᵢxᵢ+b=AΣαᵢxᵢ+(Σαᵢ)b=Σαᵢ(Axᵢ+b).",
    "exampleTitle": "Разбор: центр масс треугольника",
    "exampleBody": "Центроид G=(A+B+C)/3 переходит в центроид образного треугольника при любом аффинном преобразовании.",
    "visual": "Аффинная деформация треугольника и барицентрические точки",
    "visualBody": "Деформируй треугольник и наблюдай, что центроид и деление сторон в фиксированных отношениях сохраняются."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Аффинное преобразование сохраняет параллельность и отношения на одной прямой, но обычно не сохраняет углы, длины и окружности.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
