import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "diff-001",
      title: "Определение",
      prompt: "Как записывается дифференциал функции одной переменной?",
      type: "choice",
      answer: "dy=f′(x)dx",
      options: ["dy=f′(x)dx", "dy=f(x)dx", "dy=f′′(x)", "dy=Δy всегда"],
      difficulty: "base",
    },
    {
      id: "diff-002",
      title: "Дифференциал x",
      prompt: "Чему равен dx для независимой переменной x?",
      type: "choice",
      answer: "Δx",
      options: ["Δx", "x²", "1/x", "0"],
      difficulty: "base",
    },
    {
      id: "diff-003",
      title: "Линейное приближение",
      prompt: "Используя √(1+x)≈1+x/2, оцени √1.04.",
      type: "number",
      answer: "1.02",
      difficulty: "base",
    },
    {
      id: "diff-004",
      title: "Ошибка",
      prompt: "При ограниченной второй производной какого порядка относительно Δx имеет ошибка Δy−dy?",
      type: "choice",
      answer: "Порядка (Δx)²",
      options: ["Порядка (Δx)²", "Порядка 1/Δx", "Всегда нулевая", "Порядка √Δx"],
      difficulty: "medium",
    },
    {
      id: "diff-005",
      title: "Второй дифференциал",
      prompt: "При независимом x чему равен d²y?",
      type: "choice",
      answer: "f″(x)dx²",
      options: ["f″(x)dx²", "f′(x)dx", "f(x)dx²", "2f′(x)"],
      difficulty: "base",
    },
  ];

export default tasks;
