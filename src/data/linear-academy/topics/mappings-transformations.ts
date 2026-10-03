import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Отображение — функция между пространствами; преобразование — отображение пространства в себя. Композиция формирует алгебру действий, а обратимость отделяет симметрии от необратимых деформаций.",
    "theoremTitle": "Обратимость композиции",
    "theoremBody": "Композиция двух биекций является биекцией, а обратная к композиции строится в обратном порядке.",
    "theoremFormula": "(g\\circ f)^{-1}=f^{-1}\\circ g^{-1}",
    "proof": "Прямой подстановкой: (f⁻¹∘g⁻¹)∘(g∘f)=f⁻¹∘id∘f=id.",
    "exampleTitle": "Разбор: преобразование координат",
    "exampleBody": "Поворот, затем перенос — композиция двух отображений. Обратное действие сначала отменяет перенос, затем поворот.",
    "visual": "Композиция отображений как pipeline",
    "visualBody": "Точка проходит через два последовательных преобразования; порядок можно менять и сравнивать результат."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Инъективность и сюръективность — разные свойства. Для конечных множеств одинаковой мощности они эквивалентны, но в общем случае и особенно на бесконечных множествах — нет.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
