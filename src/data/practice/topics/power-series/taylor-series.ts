import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      "id": "series-064-1",
      "title": "Коэффициент Тейлора",
      "prompt": "Чему равен коэффициент при (x−x₀)ⁿ в ряде Тейлора?",
      "type": "choice",
      "answer": "f^(n)(x₀)/n!",
      "options": [
        "f^(n)(x₀)/n!",
        "f(x₀)^n",
        "n!/f^(n)(x₀)",
        "f'(x₀) для всех n"
      ],
      "difficulty": "base"
    },
    {
      "id": "series-064-2",
      "title": "Маклорен",
      "prompt": "Какой центр используется в ряде Маклорена?",
      "type": "number",
      "answer": "0",
      "difficulty": "base"
    },
    {
      "id": "series-064-3",
      "title": "Экспонента",
      "prompt": "Чему равен коэффициент при x³ в ряде eˣ?",
      "type": "choice",
      "answer": "1/6",
      "options": [
        "1/6",
        "1/3",
        "3",
        "1"
      ],
      "difficulty": "base"
    },
    {
      "id": "series-064-4",
      "title": "Синус",
      "prompt": "Какой первый ненулевой член после x в разложении sin x?",
      "type": "choice",
      "answer": "−x³/6",
      "options": [
        "−x³/6",
        "+x²/2",
        "−x²/2",
        "+x³/3"
      ],
      "difficulty": "medium"
    },
    {
      "id": "series-064-5",
      "title": "Аналитичность",
      "prompt": "Что нужно кроме существования всех производных, чтобы функция совпадала со своим рядом Тейлора?",
      "type": "choice",
      "answer": "Чтобы остаток Rₙ(x) стремился к 0",
      "options": [
        "Чтобы остаток Rₙ(x) стремился к 0",
        "Чтобы f была положительна",
        "Чтобы f была периодична",
        "Чтобы f'(x₀)=0"
      ],
      "difficulty": "hard"
    }
  ];

export default tasks;
