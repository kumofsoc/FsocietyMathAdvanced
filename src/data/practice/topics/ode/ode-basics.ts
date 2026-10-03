import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"ode-047-1", title:"Порядок ДУ", prompt:"Каков порядок уравнения y''' + y = 0?", type:"number", answer:"3", difficulty:"base" },
    { id:"ode-047-2", title:"Решение ДУ", prompt:"Что означает, что функция является решением дифференциального уравнения?", type:"choice", answer:"После подстановки она обращает уравнение в тождество", options:["После подстановки она обращает уравнение в тождество","Она обязательно линейна","Она обязательно положительна","Её производная всегда ноль"], difficulty:"base" },
    { id:"ode-047-3", title:"Общее решение", prompt:"Сколько произвольных постоянных обычно содержит общее решение ДУ n-го порядка?", type:"choice", answer:"n", options:["n","1","2n","0"], difficulty:"base" },
    { id:"ode-047-4", title:"Экспоненциальная модель", prompt:"Какой вид имеет решение y'=ky?", type:"choice", answer:"y=Ce^(kx)", options:["y=Ce^(kx)","y=C+kx","y=Cx^k","y=k/C"], difficulty:"base" },
  ];

export default tasks;
