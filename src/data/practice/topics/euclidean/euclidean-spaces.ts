import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "euclid-001",
      title: "Норма",
      prompt: "Как определяется длина вектора через скалярное произведение?",
      type: "choice",
      answer: "||x||=√(x,x)",
      options: ["||x||=√(x,x)", "||x||=(x,x)²", "||x||=det x", "||x||=(x,1)"],
      difficulty: "base",
    },
    {
      id: "euclid-002",
      title: "Ортогональная матрица",
      prompt: "Какое равенство характеризует вещественную ортогональную матрицу Q?",
      type: "choice",
      answer: "QᵀQ=E",
      options: ["QᵀQ=E", "Q²=0", "Qᵀ=Q всегда", "det Q=0"],
      difficulty: "base",
    },
    {
      id: "euclid-003",
      title: "Ортогональное дополнение",
      prompt: "Если dim E=7 и dim L=3, чему равна dim L⊥?",
      type: "number",
      answer: "4",
      difficulty: "base",
    },
    {
      id: "euclid-004",
      title: "Gram–Schmidt",
      prompt: "Что вычитают из очередного вектора в методе Грама–Шмидта?",
      type: "choice",
      answer: "Его проекции на уже построенные ортогональные направления",
      options: [
        "Его проекции на уже построенные ортогональные направления",
        "Его длину",
        "Определитель всей матрицы",
        "Все предыдущие векторы без коэффициентов"
      ],
      difficulty: "base",
    },
    {
      id: "euclid-005",
      title: "QR",
      prompt: "В разложении A=QR какой является матрица Q?",
      type: "choice",
      answer: "Ортогональной",
      options: ["Ортогональной", "Диагональной обязательно", "Нулевой", "Кососимметричной обязательно"],
      difficulty: "base",
    },
  ];

export default tasks;
