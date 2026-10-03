import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Метрика g связывает векторы и ковекторы: опускание индекса применяет g, поднятие — g⁻¹. В ортонормированном базисе это визуально скрыто, потому что g=I.",
    "theoremTitle": "Поднятие и опускание индексов взаимно обратны",
    "theoremBody": "Контрвариантная метрика g^{ij} является обратной к g_{ij}, поэтому последовательное опускание и поднятие возвращает исходные компоненты.",
    "theoremFormula": "v_i=g_{ij}v^j,\\qquad v^i=g^{ij}v_j",
    "proof": "Подставляем вторую формулу в первую и используем g^{ik}g_{kj}=δ^i_j.",
    "exampleTitle": "Разбор: косой базис",
    "exampleBody": "В неортонормированном базисе численные наборы vᵢ и vⁱ различаются; метрика хранит углы и длины базисных векторов.",
    "visual": "Метрика как деформация единичной окружности",
    "visualBody": "Показывай Gram-матрицу косого базиса и соответствующую эллиптическую единичную сферу координат."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Поднятие/опускание индекса — не косметическая смена положения символа. В неортонормированном базисе численные значения v_i и v^i обычно различны и связаны матрицей метрики.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
