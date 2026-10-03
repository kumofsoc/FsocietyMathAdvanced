import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Жорданова форма описывает не только собственные значения, но и то, насколько оператор не хватает собственных векторов. Обобщённые собственные векторы образуют цепочки нильпотентной части.",
    "theoremTitle": "Цепочка Жордана",
    "theoremBody": "Для блока J=λI+N существует цепочка v₁,…,v_k, где (T-λI)v₁=0 и (T-λI)v_{j+1}=v_j.",
    "theoremFormula": "(T-\\lambda I)v_{j+1}=v_j",
    "proof": "В стандартном базисе жорданова блока N имеет единицы на наддиагонали и переводит следующий базисный вектор в предыдущий; переносим базис обратно из жордановой формы.",
    "exampleTitle": "Разбор: рост при λ=1",
    "exampleBody": "Для J=[[1,1],[0,1]] имеем Jⁿ=[[1,n],[0,1]]. Хотя единственное собственное значение равно 1, нильпотентная часть создаёт линейный рост n.",
    "visual": "Жорданов блок как shear + scaling",
    "visualBody": "Показывай повторные применения J и отличие от чистой диагональной матрицы с тем же λ."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Одинаковый характеристический многочлен не означает подобие матриц. Размеры Jordan blocks — дополнительная информация, которую spectrum без геометрических кратностей не видит.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
