import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "func-001",
      title: "Область определения",
      prompt: "Найди область определения f(x)=√(4−x²).",
      type: "choice",
      answer: "[−2,2]",
      options: ["[−2,2]", "(−2,2)", "[0,4]", "ℝ"],
      difficulty: "base",
    },
    {
      id: "func-002",
      title: "Чётность",
      prompt: "Какой является функция f(x)=x⁴+2?",
      type: "choice",
      answer: "Чётной",
      options: ["Чётной", "Нечётной", "Периодической с периодом 2", "Ни чётной, ни нечётной"],
      difficulty: "base",
    },
    {
      id: "func-003",
      title: "Обратная функция",
      prompt: "Для f(x)=3x−6 найди f⁻¹(x).",
      type: "choice",
      answer: "(x+6)/3",
      options: ["(x+6)/3", "3x+6", "1/(3x−6)", "(x−6)/3"],
      difficulty: "base",
    },
    {
      id: "func-004",
      title: "Почему x² не обратима на ℝ",
      prompt: "Почему f(x)=x² не имеет обратной функции на всей ℝ?",
      type: "choice",
      answer: "Разным x могут соответствовать одинаковые значения",
      options: [
        "Разным x могут соответствовать одинаковые значения",
        "У неё нет области определения",
        "Она не является числовой функцией",
        "Она неограничена"
      ],
      difficulty: "base",
    },
    {
      id: "func-005",
      title: "Композиция",
      prompt: "f(u)=u²+1, u=2x−1. Чему равна f(u(x))?",
      type: "choice",
      answer: "(2x−1)²+1",
      options: ["(2x−1)²+1", "2x²", "u²+2x", "4x−1"],
      difficulty: "base",
    },
  ];

export default tasks;
