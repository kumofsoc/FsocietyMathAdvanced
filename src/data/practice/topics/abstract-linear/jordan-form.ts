import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "jordan-001",
      title: "Гамильтон–Кэли",
      prompt: "Что утверждает теорема Гамильтона–Кэли для характеристического многочлена p?",
      type: "choice",
      answer: "p(A)=0",
      options: ["p(A)=0", "p(A)=E", "det A=0", "A всегда диагональна"],
      difficulty: "base",
    },
    {
      id: "jordan-002",
      title: "Корневое подпространство",
      prompt: "Как записывается корневое подпространство для λ кратности k?",
      type: "choice",
      answer: "Ker(A−λE)^k",
      options: ["Ker(A−λE)^k", "Im(A−λE)", "Ker A только", "Im A^k"],
      difficulty: "medium",
    },
    {
      id: "jordan-003",
      title: "Жорданова цепочка",
      prompt: "Для цепочки e₁,e₂,e₃ при N=A−λE чему равно Ne₃?",
      type: "choice",
      answer: "e₂",
      options: ["e₂", "e₃", "0", "λe₃"],
      difficulty: "base",
    },
    {
      id: "jordan-004",
      title: "Одна клетка порядка 4",
      prompt: "У одной жордановой клетки J₄(λ) какова геометрическая кратность λ?",
      type: "number",
      answer: "1",
      difficulty: "medium",
    },
    {
      id: "jordan-005",
      title: "Диагонализация как частный случай",
      prompt: "Когда жорданова форма уже диагональна?",
      type: "choice",
      answer: "Когда все жордановы клетки имеют размер 1",
      options: [
        "Когда все жордановы клетки имеют размер 1",
        "Когда все клетки имеют размер 2",
        "Только когда det A=0",
        "Только когда A нильпотентна"
      ],
      difficulty: "base",
    },
  ];

export default tasks;
