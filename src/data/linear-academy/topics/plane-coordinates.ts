import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Уравнение F(x,y)=0 задаёт геометрическое множество как прообраз значения 0. Координатная геометрия — перевод инвариантных геометрических условий в алгебру.",
    "theoremTitle": "Градиент как нормаль к уровню",
    "theoremBody": "Если ∇F(P)≠0, то в точке P градиент функции F перпендикулярен гладкой линии уровня F=const.",
    "theoremFormula": "\\nabla F(P)\\perp T_P\\{F=c\\}",
    "proof": "Вдоль параметризации r(t) линии уровня F(r(t))=c. Дифференцирование даёт ∇F·r'(t)=0.",
    "exampleTitle": "Разбор: окружность как уровень",
    "exampleBody": "Для F=x²+y²-R² градиент (2x,2y) направлен радиально и потому перпендикулярен касательной окружности.",
    "visual": "Неявная кривая и поле нормалей",
    "visualBody": "Показывай линию уровня, выбранную точку и градиент-нормаль."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Уравнение F(x,y)=0 не уникально: умножение F на ненулевой коэффициент задаёт ту же кривую. Коэффициенты сами по себе не являются геометрическими инвариантами.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
