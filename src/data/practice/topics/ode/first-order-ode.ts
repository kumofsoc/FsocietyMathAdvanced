import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"ode-048-1", title:"Поле направлений", prompt:"Что задаёт значение f(x,y) в уравнении y'=f(x,y)?", type:"choice", answer:"Наклон касательной к интегральной кривой", options:["Наклон касательной к интегральной кривой","Координату x","Только значение y","Площадь под кривой"], difficulty:"base" },
    { id:"ode-048-2", title:"Разделение переменных", prompt:"Какой первый шаг удобен для y'=xy?", type:"choice", answer:"dy/y = x dx", options:["dy/y = x dx","y=x+y","dx/y = dy/x","y''=x"], difficulty:"base" },
    { id:"ode-048-3", title:"Однородное ДУ", prompt:"Какая подстановка стандартна для y'=F(y/x)?", type:"choice", answer:"y=ux", options:["y=ux","y=e^u","x=u²","y=u+x²"], difficulty:"base" },
    { id:"ode-048-4", title:"Бернулли", prompt:"Какая замена сводит y'+p(x)y=q(x)y^n к линейному?", type:"choice", answer:"z=y^(1−n)", options:["z=y^(1−n)","z=xy","z=e^x","z=y'"], difficulty:"medium" },
    { id:"ode-048-5", title:"Клеро", prompt:"Как выглядит общее решение y=xy'+ψ(y')?", type:"choice", answer:"y=cx+ψ(c)", options:["y=cx+ψ(c)","y=ce^x","y=ψ(x)+c","y=c/x"], difficulty:"medium" },
  ];

export default tasks;
