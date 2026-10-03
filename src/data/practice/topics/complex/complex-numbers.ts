import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "cx-027-1",
      title: "Квадрат мнимой единицы",
      prompt: "Чему равно i²?",
      type: "choice",
      answer: "-1",
      options: ["-1", "1", "i", "-i"],
      difficulty: "base",
    },
    {
      id: "cx-027-2",
      title: "Модуль комплексного числа",
      prompt: "Найди |3+4i|.",
      type: "number",
      answer: "5",
      hint: "|a+bi|=√(a²+b²).",
      difficulty: "base",
    },
    {
      id: "cx-027-3",
      title: "Сопряжение",
      prompt: "Выбери число, сопряжённое к z=2−3i.",
      type: "choice",
      answer: "2+3i",
      options: ["2+3i", "-2+3i", "-2-3i", "3+2i"],
      difficulty: "base",
    },
    {
      id: "cx-027-4",
      title: "Аргумент",
      prompt: "Главный аргумент числа 1+i равен:",
      type: "choice",
      answer: "π/4",
      options: ["π/4", "π/2", "3π/4", "-π/4"],
      difficulty: "base",
    },
    {
      id: "cx-027-5",
      title: "Показательная форма",
      prompt: "Какая запись эквивалентна 2(cos(π/3)+i sin(π/3))?",
      type: "choice",
      answer: "2e^(iπ/3)",
      options: ["2e^(iπ/3)", "e^(2iπ/3)", "2e^(−iπ/3)", "2+iπ/3"],
      difficulty: "medium",
    },
  ];

export default tasks;
