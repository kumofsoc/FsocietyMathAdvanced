import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Прямая может задаваться через точку и направление, точку и нормаль, двумя точками или линейным уравнением. Все формы — разные координатные упаковки одного аффинного объекта.",
    "theoremTitle": "Расстояние от точки до прямой",
    "theoremBody": "Для прямой Ax+By+C=0 расстояние от P(x₀,y₀) равно модулю нормальной координаты, делённому на длину нормали.",
    "theoremFormula": "d(P,l)=\\frac{|Ax_0+By_0+C|}{\\sqrt{A^2+B^2}}",
    "proof": "Проекция вектора от любой точки прямой к P на единичную нормаль n/||n|| имеет один и тот же модуль и равна искомому кратчайшему расстоянию.",
    "exampleTitle": "Разбор: пересечение двух прямых",
    "exampleBody": "Решение двух линейных уравнений прямых — их точка пересечения; determinant коэффициентов показывает, единственна ли она.",
    "visual": "Точка, прямая, нормаль и кратчайший отрезок",
    "visualBody": "Интерактивная точка рядом с прямой с отображением signed distance и проекции."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Slope-form y=kx+b не покрывает вертикальные прямые. Нормальная/общая форма Ax+By+C=0 принципиально устойчивее и симметричнее.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
