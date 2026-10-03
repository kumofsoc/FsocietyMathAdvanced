import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      "id": "complex-075-1",
      "title": "Смена ориентации",
      "prompt": "Что происходит с ∫γ f(z)dz при обращении ориентации γ?",
      "type": "choice",
      "answer": "Меняет знак",
      "options": [
        "Меняет знак",
        "Не меняется",
        "Удваивается",
        "Обнуляется"
      ],
      "difficulty": "base"
    },
    {
      "id": "complex-075-2",
      "title": "Оценка ML",
      "prompt": "Если |f|≤3 на контуре длины 4, какая верхняя оценка для модуля интеграла?",
      "type": "number",
      "answer": "12",
      "difficulty": "base"
    },
    {
      "id": "complex-075-3",
      "title": "Коши",
      "prompt": "Чему равен интеграл голоморфной функции по замкнутому контуру в односвязной области?",
      "type": "number",
      "answer": "0",
      "difficulty": "base"
    },
    {
      "id": "complex-075-4",
      "title": "Формула Коши",
      "prompt": "Чему равно ∮ dz/(z-a), если контур один раз положительно обходит a?",
      "type": "choice",
      "answer": "2πi",
      "options": [
        "2πi",
        "πi",
        "0",
        "1"
      ],
      "difficulty": "medium"
    },
    {
      "id": "complex-075-5",
      "title": "Следствие",
      "prompt": "Что автоматически существует у голоморфной функции?",
      "type": "choice",
      "answer": "Производные всех порядков",
      "options": [
        "Производные всех порядков",
        "Только первая производная",
        "Только вещественная часть",
        "Только интеграл по окружности"
      ],
      "difficulty": "medium"
    }
  ];

export default tasks;
