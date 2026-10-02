import type { LayeredTopicBlueprint } from "@/entities/course/model/learning-architecture/types";

export const linearFoundationBlueprints: Record<string, LayeredTopicBlueprint> = {
  matrices: {
    topicId: "matrices",
    clarityGoal:
      "Увидеть матрицу не как таблицу ради таблицы, а как язык хранения и преобразования линейной информации.",
    learningGoals: [
      "Свободно читать индексы, размеры и специальные виды матриц.",
      "Понимать смысл сложения, умножения на число и произведения матриц.",
      "Отличать формальное правило операции от её геометрического и операторного смысла.",
    ],
    layerOrder: [
      "intuition",
      "notation",
      "formal",
      "properties",
      "example",
      "visualization",
      "counterexample",
      "connection",
      "extension",
      "research",
    ],
    units: [
      {
        id: "matrices::clarity::object",
        layer: "intuition",
        title: "Что матрица хранит на самом деле",
        summary: "Понятная модель матрицы до формальных операций.",
        legacyBlockIndex: 0,
      },
      {
        id: "matrices::notation::indices",
        layer: "notation",
        title: "Как читать aᵢⱼ и размер m×n",
        legacyBlockIndex: 1,
      },
      {
        id: "matrices::formal::equality",
        layer: "formal",
        title: "Когда две матрицы равны",
        legacyBlockIndex: 2,
      },
    ],
  },
  determinants: {
    topicId: "determinants",
    clarityGoal:
      "Понять определитель как числовую характеристику линейного преобразования: масштаб ориентированного объёма и критерий вырожденности.",
    learningGoals: [
      "Вычислять определители малых порядков разными способами.",
      "Понимать свойства определителя, а не запоминать их как список.",
      "Связывать det A = 0 с потерей размерности и обратимостью.",
    ],
    layerOrder: [
      "intuition",
      "formal",
      "properties",
      "theorem",
      "proof",
      "example",
      "counterexample",
      "visualization",
      "connection",
      "extension",
    ],
  },
  "inverse-rank": {
    topicId: "inverse-rank",
    clarityGoal:
      "Связать обратимость, миноры, ранг и число независимых направлений в одну концептуальную картину.",
    learningGoals: [
      "Понимать, когда и почему существует обратная матрица.",
      "Интерпретировать ранг как число независимых направлений.",
      "Связывать ранг с решениями линейных систем и геометрией отображения.",
    ],
    layerOrder: [
      "intuition",
      "formal",
      "properties",
      "theorem",
      "proof",
      "example",
      "visualization",
      "connection",
      "extension",
      "research",
    ],
  },
};
