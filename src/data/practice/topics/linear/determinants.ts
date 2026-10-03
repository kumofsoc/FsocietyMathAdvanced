import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "det-001",
      title: "Определитель 2-го порядка",
      prompt: "Вычисли det [[5, 2], [7, 3]].",
      type: "number",
      answer: "1",
      hint: "Для 2×2: ad − bc.",
      difficulty: "base",
    },
    {
      id: "det-002",
      title: "Ещё один 2×2",
      prompt: "Вычисли det [[1, 2], [3, 4]].",
      type: "number",
      answer: "-2",
      hint: "1·4 − 2·3.",
      difficulty: "base",
    },
    {
      id: "det-003",
      title: "Определитель 2×2 с отрицательным результатом",
      prompt: "Вычисли det [[3,2],[8,5]].",
      type: "number",
      answer: "-1",
      difficulty: "base",
    },
    {
      id: "det-004",
      title: "Когда определитель равен нулю",
      prompt: "Вычисли det [[6,9],[8,12]].",
      type: "number",
      answer: "0",
      hint: "Строки здесь пропорциональны.",
      difficulty: "base",
    },
    {
      id: "det-006",
      title: "Параметрический 2×2",
      prompt: "Для матрицы [[n+1,n],[n,n−1]] чему равен определитель при любом n?",
      type: "number",
      answer: "-1",
      hint: "Раскрой (n+1)(n−1)−n².",
      difficulty: "medium",
    },
    {
      id: "det-043",
      title: "Определитель 3-го порядка",
      prompt: "Вычисли det [[2, 1, 3], [5, 3, 2], [1, 4, 3]].",
      type: "number",
      answer: "40",
      hint: "Можно использовать правило Саррюса или разложение по строке.",
      difficulty: "medium",
    },
    {
      id: "det-044",
      title: "3×3 без подсказки",
      prompt: "Вычисли det [[3, 2, 1], [2, 5, 3], [3, 4, 2]].",
      type: "number",
      answer: "-3",
      difficulty: "medium",
    },
  ];

export default tasks;
