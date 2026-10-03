import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Ядро измеряет потерянные направления, образ — реально достижимые направления. Теорема rank-nullity — главный баланс размерностей линейного отображения.",
    "theoremTitle": "Теорема о ранге и дефекте",
    "theoremBody": "Для T:V→W с конечномерным V размерность области равна сумме размерности ядра и образа.",
    "theoremFormula": "\\dim V=\\dim\\ker T+\\dim\\operatorname{Im}T",
    "proof": "Берём базис ядра и достраиваем до базиса V. Образы достроенных векторов образуют базис Im T: они порождают образ и независимы modulo ядра.",
    "exampleTitle": "Разбор: проекция ℝ³→плоскость",
    "exampleBody": "Ортогональная проекция на xy-плоскость имеет rank=2 и ker=span(e₃), поэтому nullity=1 и 2+1=3.",
    "visual": "Kernel → operator → image",
    "visualBody": "Показывай пространство входа, схлопываемое ядро и получаемый образ с балансом rank+nullity."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Инъективность связана с ker T={0}, а сюръективность — с Im T=W. Полный rank относительно domain и полный rank относительно codomain — не одно и то же для прямоугольных операторов.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
