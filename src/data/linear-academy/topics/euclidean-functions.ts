import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Скалярное произведение отождествляет функционалы с векторами: каждый линейный функционал имеет вид φ(x)=⟨a,x⟩. Это конечномерная версия теоремы Рисса.",
    "theoremTitle": "Представление линейного функционала",
    "theoremBody": "В конечномерном евклидовом пространстве для каждого линейного функционала φ существует единственный a, такой что φ(x)=⟨a,x⟩.",
    "theoremFormula": "\\varphi(x)=\\langle a,x\\rangle",
    "proof": "В ортонормированном базисе положим a=Σφ(eᵢ)eᵢ. Тогда для x=Σxᵢeᵢ скалярное произведение ⟨a,x⟩=Σφ(eᵢ)xᵢ=φ(x).",
    "exampleTitle": "Разбор: градиент линейной функции",
    "exampleBody": "Функционал φ(x,y)=3x-4y представлен вектором a=(3,-4); линии уровня перпендикулярны a.",
    "visual": "Функционал ↔ представляющий вектор",
    "visualBody": "Семейство уровней φ=c и вектор a, задающий направление максимального роста."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Градиент как «вектор производной» зависит от inner product: дифференциал является ковектором, а градиент получается из него через метрическую идентификацию.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
