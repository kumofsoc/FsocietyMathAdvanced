import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      "id": "series-065-1",
      "title": "Предел через ряд",
      "prompt": "Найди lim(x→0) (sin x−x)/x³.",
      "type": "number",
      "answer": "-1/6",
      "hint": "sin x=x−x³/6+O(x⁵).",
      "difficulty": "medium"
    },
    {
      "id": "series-065-2",
      "title": "Остаток Лейбница",
      "prompt": "Для знакочередующегося ряда с убывающими bₙ чему не превосходит ошибка после N членов?",
      "type": "choice",
      "answer": "bₙ₊₁",
      "options": [
        "bₙ₊₁",
        "b₁",
        "N",
        "Сумму первых N членов"
      ],
      "difficulty": "base"
    },
    {
      "id": "series-065-3",
      "title": "Почленное интегрирование",
      "prompt": "Как интегрируется член aₙxⁿ?",
      "type": "choice",
      "answer": "aₙx^(n+1)/(n+1)",
      "options": [
        "aₙx^(n+1)/(n+1)",
        "naₙx^(n−1)",
        "aₙxⁿ",
        "aₙ/(x^(n+1))"
      ],
      "difficulty": "base"
    },
    {
      "id": "series-065-4",
      "title": "Метод рядов для ОДУ",
      "prompt": "После подстановки y=∑aₙxⁿ в ОДУ что делают дальше?",
      "type": "choice",
      "answer": "Приравнивают коэффициенты одинаковых степеней x",
      "options": [
        "Приравнивают коэффициенты одинаковых степеней x",
        "Сразу полагают все aₙ=1",
        "Интегрируют только первый член",
        "Удаляют все производные"
      ],
      "difficulty": "medium"
    },
    {
      "id": "series-065-5",
      "title": "y'=y",
      "prompt": "Для y'=y какая рекурсия возникает для коэффициентов степенного ряда?",
      "type": "choice",
      "answer": "aₙ₊₁=aₙ/(n+1)",
      "options": [
        "aₙ₊₁=aₙ/(n+1)",
        "aₙ₊₁=(n+1)aₙ",
        "aₙ₊₁=−aₙ",
        "aₙ₊₁=aₙ²"
      ],
      "difficulty": "medium"
    }
  ];

export default tasks;
