import type { TopicPatches } from "../model";

const patches: TopicPatches = {
    "Пример 1.12 · Умножение строки": {
      matrixOperation: {
        before: "[[1,2],[3,4]]",
        after: "[[1,2],[1,4/3]]",
        operation: "R₂ ← (1/3)R₂",
        explanation:
          "Нормируем ведущий элемент второй строки: 3 превращается в 1. Это делает дальнейшее исключение переменных и метод Гаусса визуально и арифметически проще.",
        beforeHighlightRows: [1],
        afterHighlightRows: [1],
      },
    },
    "Пример 1.13 · Прибавление кратной строки": {
      matrixOperation: {
        before: "[[1,2],[3,7]]",
        after: "[[1,2],[0,1]]",
        operation: "R₂ ← R₂ − 3R₁",
        explanation:
          "Вычитаем три первых строки из второй, чтобы занулить элемент под ведущей единицей. Именно так метод Гаусса шаг за шагом создаёт ступенчатую форму.",
        beforeHighlightRows: [1],
        afterHighlightRows: [1],
      },
    },
    "Пример 1.14 · Перестановка строк": {
      matrixOperation: {
        before: "[[0,2],[5,1]]",
        after: "[[5,1],[0,2]]",
        operation: "R₁ ↔ R₂",
        explanation:
          "Меняем строки местами, потому что в первой ведущей позиции стоит 0. После перестановки ненулевой элемент 5 можно использовать как pivot.",
        beforeHighlightRows: [0, 1],
        afterHighlightRows: [0, 1],
      },
    },
  };

export default patches;
