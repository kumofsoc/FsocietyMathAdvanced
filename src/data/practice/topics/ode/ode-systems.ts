import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"ode-052-1", title:"Матричная форма", prompt:"Как компактно записывается однородная линейная система с постоянной матрицей A?", type:"choice", answer:"y'=Ay", options:["y'=Ay","y=A+y","Ay=0 всегда","y''=A"], difficulty:"base" },
    { id:"ode-052-2", title:"Фазовое поле", prompt:"Что соответствует каждой точке фазовой плоскости автономной системы?", type:"choice", answer:"Вектор скорости", options:["Вектор скорости","Площадь","Собственное число обязательно","Только координата времени"], difficulty:"base" },
    { id:"ode-052-3", title:"Решение через экспоненту", prompt:"Как выглядит решение y'=Ay с y(x₀)=y₀?", type:"choice", answer:"y=e^{A(x−x₀)}y₀", options:["y=e^{A(x−x₀)}y₀","y=A(x−x₀)+y₀","y=det(A)y₀","y=A⁻¹y₀"], difficulty:"medium" },
    { id:"ode-052-4", title:"Спектр системы", prompt:"Что определяют собственные значения A в системе y'=Ay?", type:"choice", answer:"Характер роста, затухания и фазовых траекторий", options:["Характер роста, затухания и фазовых траекторий","Только размер матрицы","Только начальную точку","Количество переменных x"], difficulty:"medium" },
  ];

export default tasks;
