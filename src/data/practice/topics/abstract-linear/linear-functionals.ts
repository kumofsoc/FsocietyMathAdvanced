import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "lf-001",
      title: "Линейная функция",
      prompt: "Какое из равенств обязательно для линейной функции f?",
      type: "choice",
      answer: "f(x+y)=f(x)+f(y)",
      options: ["f(x+y)=f(x)+f(y)", "f(x+y)=f(x)f(y)", "f(0)=1", "f(αx)=f(x)+α"],
      difficulty: "base",
    },
    {
      id: "lf-002",
      title: "Размерность сопряжённого пространства",
      prompt: "Если dim L=6, чему равна dim L*?",
      type: "number",
      answer: "6",
      difficulty: "base",
    },
    {
      id: "lf-003",
      title: "Взаимный базис",
      prompt: "Чему равно pⁱ(eⱼ) для взаимного базиса?",
      type: "choice",
      answer: "δⁱⱼ",
      options: ["δⁱⱼ", "1 для всех i,j", "0 для всех i,j", "det A"],
      difficulty: "medium",
    },
  ];

export default tasks;
