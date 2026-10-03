import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "map-001",
      title: "Порядок композиции",
      prompt: "Что означает (gf)(A)?",
      type: "choice",
      answer: "Сначала применить f к A, затем g к f(A)",
      options: [
        "Сначала применить f к A, затем g к f(A)",
        "Сначала применить g к A, затем f к g(A)",
        "Применить f и g одновременно",
        "Найти обратные преобразования"
      ],
      difficulty: "base",
    },
    {
      id: "map-002",
      title: "Тождественное преобразование",
      prompt: "Чему равно fe для тождественного преобразования e?",
      type: "choice",
      answer: "f",
      options: ["f", "e", "0", "f⁻¹"],
      difficulty: "base",
    },
    {
      id: "map-003",
      title: "Обратное к композиции",
      prompt: "Если f и g взаимно однозначны, чему равно (fg)⁻¹?",
      type: "choice",
      answer: "g⁻¹f⁻¹",
      options: ["g⁻¹f⁻¹", "f⁻¹g⁻¹", "fg", "gf"],
      difficulty: "medium",
    },
  ];

export default tasks;
