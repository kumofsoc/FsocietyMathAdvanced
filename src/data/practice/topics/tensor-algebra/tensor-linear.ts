import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "tensor-001",
      title: "Тип вектора",
      prompt: "Какой тип имеет обычный вектор?",
      type: "choice",
      answer: "(1,0)",
      options: ["(1,0)", "(0,1)", "(1,1)", "(0,0)"],
      difficulty: "base",
    },
    {
      id: "tensor-002",
      title: "Тип ковектора",
      prompt: "Линейная функция на пространстве является тензором какого типа?",
      type: "choice",
      answer: "(0,1)",
      options: ["(0,1)", "(1,0)", "(2,0)", "(1,1)"],
      difficulty: "base",
    },
    {
      id: "tensor-003",
      title: "Размерность пространства тензоров",
      prompt: "Какова размерность пространства тензоров типа (2,1) в 3-мерном пространстве?",
      type: "number",
      answer: "27",
      hint: "n^(p+q)=3^3.",
      difficulty: "medium",
    },
    {
      id: "tensor-004",
      title: "Тензорное произведение",
      prompt: "A имеет тип (1,2), B — тип (2,1). Какой тип имеет A⊗B?",
      type: "choice",
      answer: "(3,3)",
      options: ["(3,3)", "(2,2)", "(1,1)", "(3,1)"],
      difficulty: "base",
    },
    {
      id: "tensor-005",
      title: "Свёртка",
      prompt: "Как меняется тип тензора (p,q) после одной свёртки верхнего и нижнего индексов?",
      type: "choice",
      answer: "(p−1,q−1)",
      options: ["(p−1,q−1)", "(p+1,q+1)", "(p−1,q+1)", "(p,q)"],
      difficulty: "base",
    },
    {
      id: "tensor-006",
      title: "След как свёртка",
      prompt: "Для матрицы [[2,5],[−1,4]] чему равна свёртка тензора типа (1,1)?",
      type: "number",
      answer: "6",
      hint: "Это след: 2+4.",
      difficulty: "base",
    },
    {
      id: "tensor-007",
      title: "Симметрирование и альтернирование",
      prompt: "Что получится при альтернировании тензора, симметричного по выбранной группе индексов?",
      type: "choice",
      answer: "Нулевой тензор",
      options: ["Нулевой тензор", "Исходный тензор", "Единичный тензор", "Всегда ковектор"],
      difficulty: "medium",
    },
  ];

export default tasks;
