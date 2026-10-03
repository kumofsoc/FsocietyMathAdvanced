import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"surf-001", title:"I род", prompt:"Что даёт ∬_S 1 dS?", type:"choice", answer:"Площадь поверхности S", options:["Площадь поверхности S","Объём тела","Длину границы","0"], difficulty:"base" },
    { id:"surf-002", title:"Граф поверхности", prompt:"Для z=z(x,y) чему равен dS?", type:"choice", answer:"√(1+z_x²+z_y²)dxdy", options:["√(1+z_x²+z_y²)dxdy","dxdy","z_x z_y dxdy","dz"], difficulty:"base" },
    { id:"surf-003", title:"II род", prompt:"Что происходит с поверхностным интегралом II рода при смене стороны поверхности?", type:"choice", answer:"Меняет знак", options:["Меняет знак","Не меняется","Удваивается","Обнуляется"], difficulty:"base" },
    { id:"surf-004", title:"Поток", prompt:"Что выражает ∬_S F·n dS?", type:"choice", answer:"Поток поля через поверхность", options:["Поток поля через поверхность","Работу вдоль кривой","Площадь проекции","Кривизну"], difficulty:"base" },
    { id:"surf-005", title:"Гаусс", prompt:"Что связывает формула Остроградского—Гаусса?", type:"choice", answer:"Поток через замкнутую поверхность и интеграл дивергенции по объёму", options:["Поток через замкнутую поверхность и интеграл дивергенции по объёму","Циркуляцию и ротор по поверхности","Длину и площадь","Только двойные интегралы"], difficulty:"medium" },
    { id:"surf-006", title:"Стокс", prompt:"Что связывает формула Стокса?", type:"choice", answer:"Циркуляцию по границе и поток ротора через поверхность", options:["Циркуляцию по границе и поток ротора через поверхность","Поток и дивергенцию по объёму","Двойной интеграл и площадь","Ряд и предел"], difficulty:"medium" },
  ];

export default tasks;
