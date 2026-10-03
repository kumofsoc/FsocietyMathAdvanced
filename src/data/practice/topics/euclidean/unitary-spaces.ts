import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "unit-001",
      title: "Унитарная матрица",
      prompt: "Какое равенство характеризует унитарную матрицу U?",
      type: "choice",
      answer: "U*U=E",
      options: ["U*U=E", "UᵀU=0", "U²=E всегда", "det U=0"],
      difficulty: "base",
    },
    {
      id: "unit-002",
      title: "Определитель",
      prompt: "Чему равен модуль det U для унитарной матрицы?",
      type: "number",
      answer: "1",
      difficulty: "base",
    },
    {
      id: "unit-003",
      title: "Самосопряжённый спектр",
      prompt: "Каковы собственные значения самосопряжённого оператора унитарного пространства?",
      type: "choice",
      answer: "Вещественные",
      options: ["Вещественные", "Только мнимые", "Всегда равны нулю", "Всегда равны 1"],
      difficulty: "base",
    },
    {
      id: "unit-004",
      title: "Унитарный спектр",
      prompt: "Какое свойство имеют собственные значения унитарного преобразования?",
      type: "choice",
      answer: "Их модуль равен 1",
      options: ["Их модуль равен 1", "Они все положительны", "Они все равны 0", "Они все вещественные"],
      difficulty: "medium",
    },
  ];

export default tasks;
