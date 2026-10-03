import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "inf-001",
      title: "Бесконечно малая",
      prompt: "Как определяется бесконечно малая функция α при данном предельном переходе?",
      type: "choice",
      answer: "lim α=0",
      options: ["lim α=0", "lim α=1", "|α|>1", "α постоянна"],
      difficulty: "base",
    },
    {
      id: "inf-002",
      title: "Предел через бесконечно малую",
      prompt: "Какое представление эквивалентно условию f(x)→A?",
      type: "choice",
      answer: "f(x)=A+α(x), α(x)→0",
      options: ["f(x)=A+α(x), α(x)→0", "f(x)=Aα(x), α(x)→∞", "f(x)=0", "f(x)=A+x всегда"],
      difficulty: "base",
    },
    {
      id: "inf-003",
      title: "Первый замечательный предел",
      prompt: "Чему равен limₓ→0 sin x / x?",
      type: "number",
      answer: "1",
      difficulty: "base",
    },
    {
      id: "inf-004",
      title: "Эквивалентность",
      prompt: "Что означает α∼β?",
      type: "choice",
      answer: "α/β→1",
      options: ["α/β→1", "α−β→1", "αβ→1", "α=β при всех x"],
      difficulty: "base",
    },
    {
      id: "inf-005",
      title: "Порядок малости",
      prompt: "При x→0 сравни x² и x.",
      type: "choice",
      answer: "x² — бесконечно малая более высокого порядка",
      options: [
        "x² — бесконечно малая более высокого порядка",
        "x² — более низкого порядка",
        "Они эквивалентны",
        "Они несравнимы"
      ],
      difficulty: "base",
    },
    {
      id: "inf-006",
      title: "Замена эквивалентными",
      prompt: "Вычисли limₓ→0 tan(2x)/sin(3x).",
      type: "choice",
      answer: "2/3",
      options: ["2/3", "3/2", "1", "0"],
      hint: "tan(2x)∼2x, sin(3x)∼3x.",
      difficulty: "medium",
    },
    {
      id: "inf-007",
      title: "Стандартная эквивалентность",
      prompt: "Чему эквивалентно 1−cos x при x→0?",
      type: "choice",
      answer: "x²/2",
      options: ["x²/2", "x", "2x", "x³"],
      difficulty: "medium",
    },
  ];

export default tasks;
