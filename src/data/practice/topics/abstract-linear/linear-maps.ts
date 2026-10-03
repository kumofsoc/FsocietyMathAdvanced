import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "lmap-001",
      title: "Rank-nullity",
      prompt: "A:L→M, dim L=8, rank A=5. Найди dim Ker A.",
      type: "number",
      answer: "3",
      difficulty: "base",
    },
    {
      id: "lmap-002",
      title: "Инъективность",
      prompt: "Какое условие эквивалентно инъективности линейного отображения?",
      type: "choice",
      answer: "Ker A={0}",
      options: ["Ker A={0}", "Im A={0}", "det A=0 для любой матрицы", "rank A=0"],
      difficulty: "base",
    },
    {
      id: "lmap-003",
      title: "Сюръективность",
      prompt: "A:L→M, dim M=4. Какой ранг необходим и достаточен для сюръективности?",
      type: "number",
      answer: "4",
      difficulty: "base",
    },
    {
      id: "lmap-004",
      title: "Замена двух базисов",
      prompt: "Если e'=eS и f'=fP, как меняется матрица линейного отображения?",
      type: "choice",
      answer: "A'=P⁻¹AS",
      options: ["A'=P⁻¹AS", "A'=S⁻¹AS", "A'=PAS⁻¹", "A'=SᵀAP"],
      difficulty: "medium",
    },
  ];

export default tasks;
