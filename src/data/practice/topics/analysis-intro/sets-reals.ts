import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "set-001",
      title: "Объединение",
      prompt: "A={1,2,4}, B={2,3,4}. Чему равно A∪B?",
      type: "choice",
      answer: "{1,2,3,4}",
      options: ["{1,2,3,4}", "{2,4}", "{1,3}", "{1,2,2,3,4,4}"],
      difficulty: "base",
    },
    {
      id: "set-002",
      title: "Пересечение",
      prompt: "Для A=[−2,3] и B=(1,5) выбери A∩B.",
      type: "choice",
      answer: "(1,3]",
      options: ["(1,3]", "[1,3]", "(1,5)", "[−2,5)"],
      difficulty: "base",
    },
    {
      id: "set-003",
      title: "Вложение числовых множеств",
      prompt: "Какая цепочка включений верна?",
      type: "choice",
      answer: "ℕ⊂ℤ⊂ℚ⊂ℝ",
      options: ["ℕ⊂ℤ⊂ℚ⊂ℝ", "ℝ⊂ℚ⊂ℤ⊂ℕ", "ℚ⊂ℕ⊂ℝ", "ℤ⊂ℕ⊂ℚ"],
      difficulty: "base",
    },
    {
      id: "set-004",
      title: "ε-окрестность",
      prompt: "x₀=2, ε=0.3. Какой интервал является ε-окрестностью x₀?",
      type: "choice",
      answer: "(1.7,2.3)",
      options: ["(1.7,2.3)", "[1.7,2.3]", "(2,2.3)", "(−0.3,0.3)"],
      difficulty: "base",
    },
    {
      id: "set-005",
      title: "Иррациональное число",
      prompt: "Какое число среди перечисленных иррационально?",
      type: "choice",
      answer: "√2",
      options: ["√2", "3/7", "−12", "0.125"],
      difficulty: "base",
    },
  ];

export default tasks;
