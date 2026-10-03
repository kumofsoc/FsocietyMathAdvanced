import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Евклидово пространство — линейное пространство со скалярным произведением. Оно добавляет метрику и позволяет говорить об ортогональности, проекциях, наилучшем приближении и QR.",
    "theoremTitle": "Теорема об ортогональной проекции",
    "theoremBody": "Для подпространства U любой x единственно раскладывается как x=p+r, где p∈U и r⊥U; p — ближайшая к x точка U.",
    "theoremFormula": "x=P_Ux+(x-P_Ux),\\qquad x-P_Ux\\perp U",
    "proof": "Если q∈U, то ||x-q||²=||r+(p-q)||²=||r||²+||p-q||²≥||r||² по Пифагору.",
    "exampleTitle": "Разбор: least squares",
    "exampleBody": "Несовместную Ax≈b решают проекцией b на Col(A): остаток ортогонален всем столбцам A, поэтому Aᵀ(Ax-b)=0.",
    "exampleFormula": "A^TAx=A^Tb",
    "visual": "Gram–Schmidt и ортогональная проекция",
    "visualBody": "Два исходных вектора, удаляемая проекция и возникающий ортогональный базис."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Ортогональность зависит от выбранного inner product. Два вектора могут быть ортогональны в одной метрике и не быть ортогональны в другой.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
