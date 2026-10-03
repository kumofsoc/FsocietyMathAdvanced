import {
  buildAcademyBlocks,
  buildPitfallBlocks,
  type AcademySpec,
} from "../model";

export const academySpec: AcademySpec = {
    "core": "Унитарное пространство — комплексный аналог евклидова: скалярное произведение сопряжённо-линейно по одному аргументу, а геометрия обязана учитывать фазу.",
    "theoremTitle": "Спектр эрмитова оператора",
    "theoremBody": "Все собственные значения эрмитова оператора вещественны, а собственные векторы разных собственных значений ортогональны.",
    "theoremFormula": "A=A^*\\Rightarrow\\lambda\\in\\mathbb R",
    "proof": "Av=λv ⇒ ⟨Av,v⟩=λ⟨v,v⟩. Но ⟨Av,v⟩=⟨v,Av⟩¯=λ¯⟨v,v⟩, значит λ=λ¯.",
    "exampleTitle": "Разбор: фазовый поворот",
    "exampleBody": "Умножение комплексного вектора на e^{iθ} меняет фазу, но сохраняет норму; это простейший унитарный оператор.",
    "visual": "Комплексная фаза и сохранение нормы",
    "visualBody": "Комплексный вектор на Argand-плоскости вращается фазой без изменения длины."
  };

export const academyBlocks = buildAcademyBlocks(academySpec);
export const pitfallBlocks = buildPitfallBlocks("Сопряжённое транспонирование A* нельзя заменять обычным Aᵀ в комплексной геометрии. Потеря complex conjugation разрушает положительность нормы и правильную ортогональность.");
export const blocks = [...academyBlocks, ...pitfallBlocks];
