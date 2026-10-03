import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "conic-001",
      title: "Эксцентриситет эллипса",
      prompt: "Для эллипса a=5, b=4 найди c.",
      type: "number",
      answer: "3",
      hint: "c²=a²−b².",
      difficulty: "base",
    },
    {
      id: "conic-002",
      title: "Гипербола и фокусы",
      prompt: "Для гиперболы a=3, b=4 найди c.",
      type: "number",
      answer: "5",
      hint: "c²=a²+b².",
      difficulty: "base",
    },
    {
      id: "conic-003",
      title: "Парабола",
      prompt: "Для y²=8x чему равно p в форме y²=2px?",
      type: "number",
      answer: "4",
      difficulty: "base",
    },
  ];

export default tasks;
