import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"field-070-1", title:"Линия уровня", prompt:"Для f(x,y)=x²+y² чему соответствует уровень f=4?", type:"choice", answer:"Окружности радиуса 2", options:["Окружности радиуса 2","Прямой x+y=4","Гиперболе xy=4","Точке (4,4)"], difficulty:"base" },
    { id:"field-070-2", title:"Градиент", prompt:"Найди ∇f(1,2) для f=x²+y².", type:"choice", answer:"(2,4)", options:["(2,4)","(1,2)","(2,2)","(4,2)"], difficulty:"base" },
    { id:"field-070-3", title:"Ортогональность", prompt:"Как расположен ∇f относительно гладкой линии уровня f=c?", type:"choice", answer:"Перпендикулярно касательной к линии уровня", options:["Перпендикулярно касательной к линии уровня","Всегда вдоль касательной","Под углом 45° всегда","Никак не связан"], difficulty:"base" },
    { id:"field-070-4", title:"Производная по направлению", prompt:"Если ∇f=(2,0) и e=(1,0), чему равно Dₑf?", type:"number", answer:"2", difficulty:"base" },
    { id:"field-070-5", title:"Максимальный рост", prompt:"В каком направлении производная по направлению максимальна?", type:"choice", answer:"В направлении ∇f", options:["В направлении ∇f","Перпендикулярно ∇f","В любом направлении одинакова","Только вдоль оси x"], difficulty:"medium" },
  ];

export default tasks;
