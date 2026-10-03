import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "cx-028-1",
      title: "Сложение",
      prompt: "Вычисли (2+3i)+(1−5i).",
      type: "choice",
      answer: "3−2i",
      options: ["3−2i", "3+8i", "1−2i", "−3+2i"],
      difficulty: "base",
    },
    {
      id: "cx-028-2",
      title: "Умножение сопряжённых",
      prompt: "Вычисли (1+i)(1−i).",
      type: "number",
      answer: "2",
      difficulty: "base",
    },
    {
      id: "cx-028-3",
      title: "Деление",
      prompt: "Чему равно 1/(1+i)?",
      type: "choice",
      answer: "(1−i)/2",
      options: ["(1−i)/2", "(1+i)/2", "1−i", "i/2"],
      hint: "Домножь числитель и знаменатель на 1−i.",
      difficulty: "medium",
    },
    {
      id: "cx-028-4",
      title: "Формула Муавра",
      prompt: "Вычисли (1+i)².",
      type: "choice",
      answer: "2i",
      options: ["2i", "2", "-2i", "1+i"],
      difficulty: "base",
    },
    {
      id: "cx-028-5",
      title: "Корни из единицы",
      prompt: "Сколько различных комплексных решений имеет уравнение w³=1?",
      type: "number",
      answer: "3",
      hint: "Ненулевое комплексное число имеет ровно n различных корней n-й степени.",
      difficulty: "base",
    },
  ];

export default tasks;
