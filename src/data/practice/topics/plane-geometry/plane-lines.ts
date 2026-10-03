import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "line-001",
      title: "Нормаль прямой",
      prompt: "Для прямой 3x−4y+7=0 выбери нормальный вектор.",
      type: "choice",
      answer: "(3, -4)",
      options: ["(3, -4)", "(4, 3)", "(-4, 3)", "(7, 0)"],
      difficulty: "base",
    },
    {
      id: "line-002",
      title: "Расстояние до прямой",
      prompt: "Найди расстояние от точки (0,0) до прямой 3x+4y−10=0.",
      type: "number",
      answer: "2",
      difficulty: "base",
    },
    {
      id: "line-003",
      title: "Перпендикулярные прямые",
      prompt: "Если k₁=2, чему должен быть равен k₂ для перпендикулярности?",
      type: "number",
      answer: "-0.5",
      hint: "Используй 1+k₁k₂=0.",
      difficulty: "medium",
    },
  ];

export default tasks;
