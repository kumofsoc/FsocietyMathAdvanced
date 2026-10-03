import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "ext-001",
      title: "Степень выше размерности",
      prompt: "Что можно сказать о 4-векторе в 3-мерном пространстве?",
      type: "choice",
      answer: "Он обязательно нулевой",
      options: ["Он обязательно нулевой", "Он всегда ненулевой", "Он равен обычному вектору", "Он имеет 4 независимые компоненты"],
      difficulty: "base",
    },
    {
      id: "ext-002",
      title: "Размерность пространства 2-форм",
      prompt: "Какова размерность пространства 2-форм в 4-мерном пространстве?",
      type: "number",
      answer: "6",
      hint: "C(4,2)=6.",
      difficulty: "medium",
    },
    {
      id: "ext-003",
      title: "Антикоммутативность",
      prompt: "Что верно для двух 1-форм α и β?",
      type: "choice",
      answer: "α∧β=−β∧α",
      options: ["α∧β=−β∧α", "α∧β=β∧α", "α∧β=0 всегда", "α∧β=α+β"],
      difficulty: "base",
    },
    {
      id: "ext-004",
      title: "Форма с самой собой",
      prompt: "Чему равно α∧α для 1-формы α?",
      type: "choice",
      answer: "0",
      options: ["0", "α", "1", "2α"],
      difficulty: "base",
    },
    {
      id: "ext-005",
      title: "Простой бивектор",
      prompt: "Когда u∧v=0?",
      type: "choice",
      answer: "Когда u и v линейно зависимы",
      options: [
        "Когда u и v линейно зависимы",
        "Когда u и v ортогональны",
        "Когда оба ненулевые",
        "Только когда |u|=|v|"
      ],
      difficulty: "medium",
    },
    {
      id: "ext-006",
      title: "Ориентированная площадь",
      prompt: "Для u=(2,0), v=(0,3) чему равен коэффициент u∧v в стандартном ориентированном базисе ℝ²?",
      type: "number",
      answer: "6",
      difficulty: "base",
    },
    {
      id: "ext-007",
      title: "Степени внешних форм",
      prompt: "α — 2-форма, β — 3-форма. Какую степень имеет α∧β?",
      type: "number",
      answer: "5",
      difficulty: "base",
    },
  ];

export default tasks;
