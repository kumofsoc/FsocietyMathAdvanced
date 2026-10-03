import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Скалярное произведение кодирует метрическую структуру: длины, углы, ортогональность и ортогональные проекции. Без него линейное пространство не знает расстояний.",
    "theoremTitle": "Неравенство Коши–Буняковского",
    "theoremBody": "Модуль скалярного произведения не превосходит произведение длин; равенство достигается ровно для линейно зависимых векторов.",
    "theoremFormula": "|\\langle x,y\\rangle|\\le\\|x\\|\\,\\|y\\|",
    "proof": "Квадрат нормы ||x-ty||²≥0 как квадратный трёхчлен по t имеет неположительный дискриминант. Отсюда ⟨x,y⟩²≤||x||²||y||².",
    "exampleTitle": "Разбор: ортогональная проекция",
    "exampleBody": "Проекция x на направление ненулевого a равна коэффициенту ⟨x,a⟩/⟨a,a⟩, умноженному на a.",
    "exampleFormula": "\\operatorname{proj}_a x=\\frac{\\langle x,a\\rangle}{\\langle a,a\\rangle}a",
    "visual": "Проекция и разложение на параллельную/ортогональную части",
    "visualBody": "Перетаскиваемый вектор x и фиксированное направление a; визуально показываются projₐx и ортогональный остаток."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Из a·b=0 не следует, что один из векторов нулевой: это обычная ортогональность. И формула cosθ=(a·b)/(|a||b|) требует ненулевых векторов.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
