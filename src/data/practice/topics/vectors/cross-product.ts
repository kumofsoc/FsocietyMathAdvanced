import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "cross-001",
      title: "Базисные векторы",
      prompt: "Чему равно e₁×e₂ в правом ортонормированном базисе?",
      type: "choice",
      answer: "e₃",
      options: ["e₃", "−e₃", "0", "e₁+e₂"],
      difficulty: "base",
    },
    {
      id: "cross-002",
      title: "Векторное произведение по координатам",
      prompt: "Для a=(1,0,0), b=(0,2,0) найди a×b.",
      type: "choice",
      answer: "(0, 0, 2)",
      options: ["(0, 0, 2)", "(0, 0, -2)", "(2, 0, 0)", "(0, 0, 0)"],
      difficulty: "base",
    },
    {
      id: "cross-003",
      title: "Площадь параллелограмма",
      prompt: "Если |a×b|=7, чему равна площадь параллелограмма на a и b?",
      type: "number",
      answer: "7",
      difficulty: "base",
    },
  ];

export default tasks;
