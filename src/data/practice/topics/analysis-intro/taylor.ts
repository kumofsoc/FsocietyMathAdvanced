import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "tay-001",
      title: "Коэффициент Тейлора",
      prompt: "Каков коэффициент при (x−x₀)^k в многочлене Тейлора?",
      type: "choice",
      answer: "f⁽ᵏ⁾(x₀)/k!",
      options: ["f⁽ᵏ⁾(x₀)/k!", "f(x₀)^k", "k!f(x₀)", "f′(x₀)/k"],
      difficulty: "base",
    },
    {
      id: "tay-002",
      title: "Маклорен",
      prompt: "Чем формула Маклорена отличается от общей формулы Тейлора?",
      type: "choice",
      answer: "Центр разложения x₀=0",
      options: ["Центр разложения x₀=0", "В ней нет производных", "Она только для многочленов", "В ней остаток всегда ноль"],
      difficulty: "base",
    },
    {
      id: "tay-003",
      title: "eˣ",
      prompt: "Как выглядит многочлен Маклорена eˣ до x² включительно?",
      type: "choice",
      answer: "1+x+x²/2",
      options: ["1+x+x²/2", "x+x²", "1−x+x²", "1+x²/2"],
      difficulty: "base",
    },
    {
      id: "tay-004",
      title: "sin x",
      prompt: "Какой первый ненулевой член после x в ряде Маклорена sin x?",
      type: "choice",
      answer: "−x³/3!",
      options: ["−x³/3!", "+x²/2!", "+x³/3!", "−x²/2!"],
      difficulty: "base",
    },
    {
      id: "tay-005",
      title: "Остаток Лагранжа",
      prompt: "Какой порядок производной входит в остаток после многочлена степени n?",
      type: "choice",
      answer: "n+1",
      options: ["n+1", "n", "n−1", "2n"],
      difficulty: "medium",
    },
    {
      id: "tay-006",
      title: "Тейлор первого порядка",
      prompt: "Какое знакомое приближение получается после обрезания Тейлора на линейном члене?",
      type: "choice",
      answer: "f(x)≈f(x₀)+f′(x₀)(x−x₀)",
      options: [
        "f(x)≈f(x₀)+f′(x₀)(x−x₀)",
        "f(x)≈f′′(x₀)",
        "f(x)=0",
        "f(x)≈1/f(x₀)"
      ],
      difficulty: "base",
    },
  ];

export default tasks;
