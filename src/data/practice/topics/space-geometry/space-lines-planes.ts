import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "space-001",
      title: "Нормаль плоскости",
      prompt: "Для плоскости 2x−y+3z−7=0 выбери нормальный вектор.",
      type: "choice",
      answer: "(2, -1, 3)",
      options: ["(2, -1, 3)", "(-1, 3, 2)", "(2, 1, 3)", "(7, 0, 0)"],
      difficulty: "base",
    },
    {
      id: "space-002",
      title: "Параллельность прямой плоскости",
      prompt: "Если направляющий вектор прямой a ортогонален нормали n плоскости, что верно?",
      type: "choice",
      answer: "Прямая параллельна плоскости или лежит в ней",
      options: [
        "Прямая параллельна плоскости или лежит в ней",
        "Прямая обязательно перпендикулярна плоскости",
        "Прямая обязательно пересекает плоскость под 45°",
        "Ничего сказать нельзя"
      ],
      difficulty: "medium",
    },
  ];

export default tasks;
