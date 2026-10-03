import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"lineint-001", title:"I род", prompt:"Что является элементом интегрирования в криволинейном интеграле I рода?", type:"choice", answer:"dl", options:["dl","dxdy","dV","dS"], difficulty:"base" },
    { id:"lineint-002", title:"Параметризация", prompt:"Если x=x(t), y=y(t), чему равно dl?", type:"choice", answer:"√(x'²+y'²)dt", options:["√(x'²+y'²)dt","(x'+y')dt","dxdy","x'y'dt"], difficulty:"base" },
    { id:"lineint-003", title:"II род и ориентация", prompt:"Что происходит с ∫_L Pdx+Qdy при смене направления пути?", type:"choice", answer:"Меняет знак", options:["Меняет знак","Не меняется","Становится нулём","Удваивается"], difficulty:"base" },
    { id:"lineint-004", title:"Работа поля", prompt:"Что физически выражает ∫_L F·dr?", type:"choice", answer:"Работу поля вдоль пути", options:["Работу поля вдоль пути","Площадь области","Поток через поверхность","Объём тела"], difficulty:"base" },
    { id:"lineint-005", title:"Формула Грина", prompt:"Что связывает формула Грина?", type:"choice", answer:"Интеграл по границе области и двойной интеграл по области", options:["Интеграл по границе области и двойной интеграл по области","Тройной и поверхностный интегралы","Только два неопределённых интеграла","Два ряда"], difficulty:"medium" },
  ];

export default tasks;
