import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      "id": "complex-074-1",
      "title": "Коши–Риман",
      "prompt": "Для f=u+iv какое равенство входит в условия Коши–Римана?",
      "type": "choice",
      "answer": "u_x=v_y",
      "options": [
        "u_x=v_y",
        "u_x=-v_y",
        "u_y=v_x",
        "u_x=u_y"
      ],
      "difficulty": "base"
    },
    {
      "id": "complex-074-2",
      "title": "Второе условие",
      "prompt": "Как выглядит второе условие Коши–Римана?",
      "type": "choice",
      "answer": "u_y=-v_x",
      "options": [
        "u_y=-v_x",
        "u_y=v_x",
        "u_x=-v_y",
        "u_y=u_x"
      ],
      "difficulty": "base"
    },
    {
      "id": "complex-074-3",
      "title": "Экспонента",
      "prompt": "Чему равно |e^(x+iy)|?",
      "type": "choice",
      "answer": "e^x",
      "options": [
        "e^x",
        "e^y",
        "1",
        "x²+y²"
      ],
      "difficulty": "base"
    },
    {
      "id": "complex-074-4",
      "title": "Период",
      "prompt": "Какой период имеет комплексная экспонента?",
      "type": "choice",
      "answer": "2πi",
      "options": [
        "2πi",
        "2π",
        "i",
        "πi/2"
      ],
      "difficulty": "medium"
    },
    {
      "id": "complex-074-5",
      "title": "Гармоничность",
      "prompt": "Если u — вещественная часть голоморфной функции, чему равен Δu?",
      "type": "number",
      "answer": "0",
      "difficulty": "medium"
    }
  ];

export default tasks;
