import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"ode-049-1", title:"Число начальных условий", prompt:"Сколько начальных условий обычно задают для ДУ второго порядка?", type:"number", answer:"2", difficulty:"base" },
    { id:"ode-049-2", title:"Понижение порядка", prompt:"Для y''=f(x) какую замену вводят?", type:"choice", answer:"p=y'", options:["p=y'","p=y²","p=x'","p=f'"], difficulty:"base" },
    { id:"ode-049-3", title:"Если нет x", prompt:"Если x явно не входит в F(y,y',y'')=0, какая формула полезна при p=p(y)?", type:"choice", answer:"y''=p·dp/dy", options:["y''=p·dp/dy","y''=p'²","y''=dp/dx только","y''=1/p"], difficulty:"medium" },
    { id:"ode-049-4", title:"Линейность", prompt:"Что отличает линейное ДУ n-го порядка?", type:"choice", answer:"y и её производные входят только в первой степени", options:["y и её производные входят только в первой степени","Все коэффициенты равны 1","Правая часть всегда ноль","Порядок всегда равен 2"], difficulty:"base" },
  ];

export default tasks;
