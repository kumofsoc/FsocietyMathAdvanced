import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      "id": "laplace-080-1",
      "title": "Первый шаг",
      "prompt": "Что делают первым при операционном методе решения ОДУ?",
      "type": "choice",
      "answer": "Применяют преобразование Лапласа к обеим частям",
      "options": [
        "Применяют преобразование Лапласа к обеим частям",
        "Сразу интегрируют исходное уравнение",
        "Заменяют t на x²",
        "Удаляют начальные условия"
      ],
      "difficulty": "base"
    },
    {
      "id": "laplace-080-2",
      "title": "Начальные данные",
      "prompt": "Где появляются y(0), y'(0) после преобразования производных?",
      "type": "choice",
      "answer": "Прямо в алгебраическом уравнении для Y(s)",
      "options": [
        "Прямо в алгебраическом уравнении для Y(s)",
        "Они исчезают",
        "Только после обратного преобразования",
        "В знаменателе всегда"
      ],
      "difficulty": "base"
    },
    {
      "id": "laplace-080-3",
      "title": "Пример",
      "prompt": "Для y'+y=1, y(0)=0 чему равно решение?",
      "type": "choice",
      "answer": "1−e^(−t)",
      "options": [
        "1−e^(−t)",
        "e^t",
        "t",
        "0"
      ],
      "difficulty": "medium"
    },
    {
      "id": "laplace-080-4",
      "title": "Передаточная функция",
      "prompt": "При нулевых начальных условиях H(s) определяется как:",
      "type": "choice",
      "answer": "Y(s)/G(s)",
      "options": [
        "Y(s)/G(s)",
        "G(s)/Y(s)",
        "Y(s)+G(s)",
        "Y'(s)"
      ],
      "difficulty": "medium"
    },
    {
      "id": "laplace-080-5",
      "title": "Импульсная характеристика",
      "prompt": "Как связаны выход y и вход g через h(t)?",
      "type": "choice",
      "answer": "y=h*g",
      "options": [
        "y=h*g",
        "y=h+g",
        "y=h/g",
        "y=h'"
      ],
      "difficulty": "hard"
    }
  ];

export default tasks;
