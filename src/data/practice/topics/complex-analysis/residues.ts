import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      "id": "complex-077-1",
      "title": "Коэффициент вычета",
      "prompt": "Какой коэффициент ряда Лорана является вычетом?",
      "type": "choice",
      "answer": "a_{−1}",
      "options": [
        "a_{−1}",
        "a_0",
        "a_1",
        "a_{−2}"
      ],
      "difficulty": "base"
    },
    {
      "id": "complex-077-2",
      "title": "Простой полюс",
      "prompt": "Как найти вычет в простом полюсе z0?",
      "type": "choice",
      "answer": "lim (z−z0)f(z)",
      "options": [
        "lim (z−z0)f(z)",
        "lim f(z)/(z−z0)",
        "f'(z0) всегда",
        "∫f dz без контура"
      ],
      "difficulty": "base"
    },
    {
      "id": "complex-077-3",
      "title": "Теорема о вычетах",
      "prompt": "На что умножается сумма вычетов внутри контура?",
      "type": "choice",
      "answer": "2πi",
      "options": [
        "2πi",
        "π",
        "i",
        "2"
      ],
      "difficulty": "base"
    },
    {
      "id": "complex-077-4",
      "title": "Рациональная функция",
      "prompt": "Чему равен Res_{z=1} 1/[z(z−1)]?",
      "type": "number",
      "answer": "1",
      "difficulty": "medium"
    },
    {
      "id": "complex-077-5",
      "title": "Классический интеграл",
      "prompt": "Чему равен ∫_{−∞}^{∞} dx/(x²+1)?",
      "type": "choice",
      "answer": "π",
      "options": [
        "π",
        "2π",
        "1",
        "0"
      ],
      "difficulty": "medium"
    }
  ];

export default tasks;
