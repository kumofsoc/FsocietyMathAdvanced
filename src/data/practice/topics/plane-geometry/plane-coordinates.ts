import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "geo-set-001",
      title: "Уравнение окружности",
      prompt: "Какое множество задаёт x²+y²=9?",
      type: "choice",
      answer: "Окружность радиуса 3 с центром в начале координат",
      options: [
        "Окружность радиуса 3 с центром в начале координат",
        "Круг радиуса 9",
        "Прямая",
        "Сфера радиуса 3"
      ],
      difficulty: "base",
    },
    {
      id: "geo-set-002",
      title: "Равенство или неравенство",
      prompt: "Что задаёт x²+y²≤4?",
      type: "choice",
      answer: "Круг радиуса 2 вместе с границей",
      options: [
        "Круг радиуса 2 вместе с границей",
        "Только окружность радиуса 2",
        "Внешность круга",
        "Две прямые"
      ],
      difficulty: "base",
    },
  ];

export default tasks;
