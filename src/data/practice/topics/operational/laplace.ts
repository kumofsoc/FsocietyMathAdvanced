import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      "id": "laplace-078-1",
      "title": "Определение",
      "prompt": "Какое ядро используется в преобразовании Лапласа?",
      "type": "choice",
      "answer": "e^(−st)",
      "options": [
        "e^(−st)",
        "e^(st)",
        "sin(st)",
        "1/t"
      ],
      "difficulty": "base"
    },
    {
      "id": "laplace-078-2",
      "title": "Образ 1",
      "prompt": "Чему равно L{1}?",
      "type": "choice",
      "answer": "1/s",
      "options": [
        "1/s",
        "s",
        "1",
        "0"
      ],
      "difficulty": "base"
    },
    {
      "id": "laplace-078-3",
      "title": "Экспонента",
      "prompt": "Чему равно L{e^(at)}?",
      "type": "choice",
      "answer": "1/(s−a)",
      "options": [
        "1/(s−a)",
        "1/(s+a)",
        "s−a",
        "e^(as)"
      ],
      "difficulty": "base"
    },
    {
      "id": "laplace-078-4",
      "title": "Производная",
      "prompt": "Чему равно L{f'}?",
      "type": "choice",
      "answer": "sF(s)−f(0)",
      "options": [
        "sF(s)−f(0)",
        "F(s)/s",
        "sF(s)",
        "F'(s)"
      ],
      "difficulty": "medium"
    },
    {
      "id": "laplace-078-5",
      "title": "Свёртка",
      "prompt": "Во что превращается свёртка f*g?",
      "type": "choice",
      "answer": "F(s)G(s)",
      "options": [
        "F(s)G(s)",
        "F(s)+G(s)",
        "F(s)/G(s)",
        "0"
      ],
      "difficulty": "medium"
    }
  ];

export default tasks;
