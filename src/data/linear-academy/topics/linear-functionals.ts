import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Линейный функционал φ:V→F — ковектор: он измеряет вектор числом. Его ядро — гиперплоскость, а dual space собирает все линейные измерители пространства.",
    "theoremTitle": "Двойственный базис",
    "theoremBody": "Каждому базису e₁,…,eₙ существует единственный dual-базис ε¹,…,εⁿ, выделяющий соответствующие координаты.",
    "theoremFormula": "\\varepsilon^i(e_j)=\\delta^i_j",
    "proof": "Определяем εⁱ на произвольном x=Σxʲeⱼ как εⁱ(x)=xⁱ. Это линейный функционал; свойство Кронекера очевидно и однозначно задаёт его.",
    "exampleTitle": "Разбор: гиперплоскость уровня",
    "exampleBody": "Функционал φ(x,y,z)=2x-y+3z имеет ядро 2x-y+3z=0 — плоскость через начало.",
    "visual": "Ковектор как семейство параллельных гиперплоскостей",
    "visualBody": "Уровни φ=c изображаются параллельными линиями/плоскостями; изменение φ вращает нормаль."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Ковектор не преобразуется как обычный вектор. Координаты функционала должны компенсировать изменение координат вектора, чтобы число φ(v) оставалось инвариантным.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
