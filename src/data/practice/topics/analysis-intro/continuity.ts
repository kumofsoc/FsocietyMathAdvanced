import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "cont-001",
      title: "Непрерывность в точке",
      prompt: "Какое равенство является основным условием непрерывности f в x₀?",
      type: "choice",
      answer: "limₓ→ₓ₀ f(x)=f(x₀)",
      options: ["limₓ→ₓ₀ f(x)=f(x₀)", "f(x₀)=0", "lim f(x)=0", "f'(x₀)=0"],
      difficulty: "base",
    },
    {
      id: "cont-002",
      title: "Устранимый разрыв",
      prompt: "Левый и правый пределы в x₀ равны 4, но f(x₀)=7. Какой это разрыв?",
      type: "choice",
      answer: "Устранимый разрыв первого рода",
      options: ["Устранимый разрыв первого рода", "Скачок", "Разрыв второго рода", "Функция непрерывна"],
      difficulty: "base",
    },
    {
      id: "cont-003",
      title: "Скачок",
      prompt: "f(x₀−0)=−2, f(x₀+0)=3. Чему равен скачок?",
      type: "number",
      answer: "5",
      difficulty: "base",
    },
    {
      id: "cont-004",
      title: "Разрыв второго рода",
      prompt: "Если правый предел в x₀ равен +∞, к какому роду относится разрыв?",
      type: "choice",
      answer: "Ко второму",
      options: ["Ко второму", "К первому устранимому", "К первому со скачком", "Разрыва нет"],
      difficulty: "base",
    },
    {
      id: "cont-005",
      title: "Вейерштрасс",
      prompt: "Что гарантирует непрерывность функции на замкнутом отрезке [a,b]?",
      type: "choice",
      answer: "Функция достигает максимума и минимума",
      options: [
        "Функция достигает максимума и минимума",
        "Функция строго возрастает",
        "Функция имеет производную",
        "Функция не имеет нулей"
      ],
      difficulty: "medium",
    },
    {
      id: "cont-006",
      title: "Больцано–Коши",
      prompt: "f непрерывна на [a,b], f(a)<0, f(b)>0. Что обязательно существует?",
      type: "choice",
      answer: "c∈(a,b), где f(c)=0",
      options: ["c∈(a,b), где f(c)=0", "точка максимума только в a", "производная во всех точках", "обратная функция"],
      difficulty: "medium",
    },
  ];

export default tasks;
