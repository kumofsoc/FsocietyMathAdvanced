import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "mixed-001",
      title: "Ориентированный объём",
      prompt: "Для a=(1,0,0), b=(0,2,0), c=(0,0,3) вычисли (a,b,c).",
      type: "number",
      answer: "6",
      difficulty: "base",
    },
    {
      id: "mixed-002",
      title: "Компланарность",
      prompt: "Если (a,b,c)=0, что можно заключить о трёх векторах?",
      type: "choice",
      answer: "Они компланарны",
      options: ["Они компланарны", "Они попарно ортогональны", "Они обязательно равны", "Они образуют базис ℝ³"],
      difficulty: "base",
    },
    {
      id: "mixed-003",
      title: "Перестановка двух векторов",
      prompt: "Если (a,b,c)=5, чему равно (b,a,c)?",
      type: "number",
      answer: "-5",
      hint: "Одна перестановка меняет ориентацию тройки.",
      difficulty: "medium",
    },
  ];

export default tasks;
