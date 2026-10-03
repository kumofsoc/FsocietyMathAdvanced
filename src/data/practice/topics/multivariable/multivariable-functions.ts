import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"mv-043-1", title:"Область определения", prompt:"Для z=√(4−x²−y²) выбери область определения.", type:"choice", answer:"x²+y²≤4", options:["x²+y²≤4","x²+y²≥4","x+y≤4","Все ℝ²"], difficulty:"base" },
    { id:"mv-043-2", title:"Линии уровня", prompt:"Как выглядят линии уровня функции z=x²+y²?", type:"choice", answer:"Окружности x²+y²=c", options:["Окружности x²+y²=c","Прямые x+y=c","Гиперболы xy=c всегда","Параболы y=x²+c"], difficulty:"base" },
    { id:"mv-043-3", title:"Предел по путям", prompt:"Для (x²−y²)/(x²+y²) при (x,y)→(0,0) что происходит?", type:"choice", answer:"Предел не существует", options:["Предел не существует","Предел равен 0","Предел равен 1","Предел равен −1"], difficulty:"medium" },
    { id:"mv-043-4", title:"Непрерывность", prompt:"Что обязательно для непрерывности f в M₀?", type:"choice", answer:"lim(M→M₀)f(M)=f(M₀)", options:["lim(M→M₀)f(M)=f(M₀)","Все частные производные равны 0","f(M₀)=0","Область обязана быть кругом"], difficulty:"base" },
    { id:"mv-043-5", title:"Замкнутая область", prompt:"Что гарантируется для непрерывной функции на ограниченной замкнутой области?", type:"choice", answer:"Она достигает максимума и минимума", options:["Она достигает максимума и минимума","Она обязана быть линейной","У неё нет критических точек","Она постоянна"], difficulty:"base" },
  ];

export default tasks;
