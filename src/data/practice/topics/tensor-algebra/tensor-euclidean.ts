import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "teuclid-001",
      title: "Метрический тензор",
      prompt: "Какой тип имеет метрический тензор gᵢⱼ?",
      type: "choice",
      answer: "(0,2)",
      options: ["(0,2)", "(2,0)", "(1,1)", "(0,0)"],
      difficulty: "base",
    },
    {
      id: "teuclid-002",
      title: "Обратная метрика",
      prompt: "Что представляет матрица компонентов gⁱʲ?",
      type: "choice",
      answer: "Матрицу, обратную матрице Грама",
      options: [
        "Матрицу, обратную матрице Грама",
        "Ту же матрицу Грама без изменений",
        "Нулевую матрицу",
        "Матрицу линейного преобразования A"
      ],
      difficulty: "base",
    },
    {
      id: "teuclid-003",
      title: "Опускание индекса",
      prompt: "Как из aʲ получить aᵢ?",
      type: "choice",
      answer: "aᵢ=gᵢⱼaʲ",
      options: ["aᵢ=gᵢⱼaʲ", "aᵢ=gⁱʲaʲ", "aᵢ=det(g)aʲ", "aᵢ=aʲ всегда"],
      difficulty: "base",
    },
    {
      id: "teuclid-004",
      title: "Поднятие индекса",
      prompt: "Как из aⱼ получить aⁱ?",
      type: "choice",
      answer: "aⁱ=gⁱʲaⱼ",
      options: ["aⁱ=gⁱʲaⱼ", "aⁱ=gᵢⱼaⱼ", "aⁱ=0", "aⁱ=tr(g)aⱼ"],
      difficulty: "base",
    },
    {
      id: "teuclid-005",
      title: "Ортонормированный базис",
      prompt: "Чему равна матрица метрического тензора в ортонормированном базисе?",
      type: "choice",
      answer: "Единичной матрице",
      options: ["Единичной матрице", "Нулевой матрице", "Любой диагональной матрице", "Матрице перехода"],
      difficulty: "base",
    },
  ];

export default tasks;
