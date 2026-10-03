import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "dot-001",
      title: "Скалярное произведение",
      prompt: "Вычисли a·b для a=(2,−1,3), b=(4,2,0).",
      type: "number",
      answer: "6",
      hint: "2·4+(−1)·2+3·0.",
      difficulty: "base",
    },
    {
      id: "dot-002",
      title: "Ортогональность",
      prompt: "Для a=(1,2,−1) и b=(2,−1,0) чему равно a·b?",
      type: "number",
      answer: "0",
      hint: "Если получится ноль, векторы ортогональны.",
      difficulty: "base",
    },
    {
      id: "dot-003",
      title: "Косинус угла",
      prompt: "a=(1,0), b=(1,1). Чему равен cosφ?",
      type: "choice",
      answer: "1/√2",
      options: ["1/√2", "1", "0", "√2"],
      difficulty: "medium",
    },
  ];

export default tasks;
