import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "seq-001",
      title: "Последовательность как функция",
      prompt: "На каком множестве определён натуральный номер n числовой последовательности?",
      type: "choice",
      answer: "ℕ",
      options: ["ℕ", "ℝ", "ℂ", "Только {0,1}"],
      difficulty: "base",
    },
    {
      id: "seq-002",
      title: "Ограниченность",
      prompt: "Какая последовательность ограничена?",
      type: "choice",
      answer: "xₙ=(−1)ⁿ/n",
      options: ["xₙ=(−1)ⁿ/n", "xₙ=n²", "xₙ=−3n", "xₙ=n+1"],
      difficulty: "base",
    },
    {
      id: "seq-003",
      title: "ε–N",
      prompt: "Для xₙ=1/n и ε=0.01 какое целое N достаточно выбрать, чтобы n>N гарантировало |xₙ|<ε?",
      type: "number",
      answer: "100",
      hint: "Нужно n>1/ε.",
      difficulty: "base",
    },
    {
      id: "seq-004",
      title: "Теорема Вейерштрасса",
      prompt: "Какого набора условий достаточно для существования конечного предела последовательности по теореме 15.3?",
      type: "choice",
      answer: "Монотонность и ограниченность",
      options: ["Монотонность и ограниченность", "Только ограниченность", "Только монотонность", "Периодичность"],
      difficulty: "base",
    },
    {
      id: "seq-005",
      title: "Зажатая последовательность",
      prompt: "Если −1/n≤zₙ≤1/n для всех n, чему равен lim zₙ?",
      type: "number",
      answer: "0",
      difficulty: "medium",
    },
  ];

export default tasks;
