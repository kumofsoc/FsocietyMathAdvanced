import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "ef-001",
      title: "Присоединённый вектор",
      prompt: "Как записывается регулярная линейная функция через присоединённый вектор a?",
      type: "choice",
      answer: "f(x)=(a,x)",
      options: ["f(x)=(a,x)", "f(x)=det(a,x)", "f(x)=a+x", "f(x)=||a||·||x|| всегда"],
      difficulty: "base",
    },
    {
      id: "ef-002",
      title: "Билинейная форма и оператор",
      prompt: "Как связана билинейная функция b с присоединённым оператором A?",
      type: "choice",
      answer: "b(x,y)=(x,Ay)",
      options: ["b(x,y)=(x,Ay)", "b(x,y)=Ax+Ay", "b(x,y)=det A", "b(x,y)=0 всегда"],
      difficulty: "base",
    },
    {
      id: "ef-003",
      title: "Ортогональная диагонализация",
      prompt: "Что гарантируется для квадратичной формы в евклидовом пространстве?",
      type: "choice",
      answer: "Есть ортонормированный базис, в котором форма диагональна",
      options: [
        "Есть ортонормированный базис, в котором форма диагональна",
        "Она всегда уже диагональна",
        "Её матрица всегда единичная",
        "Она всегда положительно определена"
      ],
      difficulty: "medium",
    },
  ];

export default tasks;
