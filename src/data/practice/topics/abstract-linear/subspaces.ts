import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "sub-001",
      title: "Проверка подпространства",
      prompt: "Какое условие обязательно для линейного подпространства?",
      type: "choice",
      answer: "Оно замкнуто относительно сложения и умножения на число",
      options: [
        "Оно замкнуто относительно сложения и умножения на число",
        "Оно не содержит нулевой вектор",
        "Оно обязано иметь ту же размерность, что всё пространство",
        "Оно должно быть конечным множеством"
      ],
      difficulty: "base",
    },
    {
      id: "sub-002",
      title: "Размерность суммы",
      prompt: "dim L₁=3, dim L₂=4, dim(L₁∩L₂)=2. Найди dim(L₁+L₂).",
      type: "number",
      answer: "5",
      difficulty: "base",
    },
    {
      id: "sub-003",
      title: "Прямая сумма двух подпространств",
      prompt: "Когда сумма L₁+L₂ является прямой?",
      type: "choice",
      answer: "Когда L₁∩L₂={0}",
      options: ["Когда L₁∩L₂={0}", "Когда L₁=L₂", "Когда оба подпространства нулевые только", "Когда их размерности равны"],
      difficulty: "base",
    },
    {
      id: "sub-004",
      title: "Дополнение",
      prompt: "Если dim L=7 и dim L'=3, какую размерность можно выбрать у дополнения L'' в разложении L=L'⊕L''?",
      type: "number",
      answer: "4",
      difficulty: "medium",
    },
  ];

export default tasks;
