import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      "id": "laplace-079-1",
      "title": "Обращение",
      "prompt": "Чему равно L⁻¹{1/s}?",
      "type": "choice",
      "answer": "1",
      "options": [
        "1",
        "t",
        "e^t",
        "0"
      ],
      "difficulty": "base"
    },
    {
      "id": "laplace-079-2",
      "title": "Простые дроби",
      "prompt": "1/[s(s+1)] раскладывается как:",
      "type": "choice",
      "answer": "1/s−1/(s+1)",
      "options": [
        "1/s−1/(s+1)",
        "1/s+1/(s+1)",
        "1/(s−1)",
        "s/(s+1)"
      ],
      "difficulty": "base"
    },
    {
      "id": "laplace-079-3",
      "title": "Первый сдвиг",
      "prompt": "F(s−a) соответствует:",
      "type": "choice",
      "answer": "e^(at)f(t)",
      "options": [
        "e^(at)f(t)",
        "f(t−a)",
        "af(t)",
        "f(at)"
      ],
      "difficulty": "medium"
    },
    {
      "id": "laplace-079-4",
      "title": "Хевисайд",
      "prompt": "Что описывает H(t−a)?",
      "type": "choice",
      "answer": "Включение сигнала в момент a",
      "options": [
        "Включение сигнала в момент a",
        "Периодическую функцию",
        "Производную",
        "Комплексный контур"
      ],
      "difficulty": "base"
    },
    {
      "id": "laplace-079-5",
      "title": "Второй сдвиг",
      "prompt": "e^(−as)F(s) соответствует:",
      "type": "choice",
      "answer": "H(t−a)f(t−a)",
      "options": [
        "H(t−a)f(t−a)",
        "e^(at)f(t)",
        "f(t+a)",
        "F(s+a)"
      ],
      "difficulty": "medium"
    }
  ];

export default tasks;
