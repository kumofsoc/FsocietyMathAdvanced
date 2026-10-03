import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"dbl-001", title:"Интегральная сумма", prompt:"Что заменяет Δx в двойной интегральной сумме?", type:"choice", answer:"Площадь ΔS", options:["Площадь ΔS","Объём ΔV","Длина дуги Δs","Угол Δφ"], difficulty:"base" },
    { id:"dbl-002", title:"Геометрический смысл", prompt:"Если f(x,y)≥0, что выражает ∬_D f(x,y)dS?", type:"choice", answer:"Объём под поверхностью над D", options:["Объём под поверхностью над D","Длину границы D","Только площадь D","Производную f"], difficulty:"base" },
    { id:"dbl-003", title:"Повторный интеграл", prompt:"Для D={a≤x≤b, φ₁(x)≤y≤φ₂(x)} какой интеграл вычисляется первым?", type:"choice", answer:"По y", options:["По y","По x","По φ","Порядок всегда безразличен без изменения границ"], difficulty:"base" },
    { id:"dbl-004", title:"Полярные координаты", prompt:"Какой множитель появляется в dxdy при переходе к полярным координатам?", type:"choice", answer:"r", options:["r","r²","sinφ","1/r"], difficulty:"base" },
    { id:"dbl-005", title:"Среднее значение", prompt:"Если площадь D равна S и f непрерывна, чему равно среднее значение f по D?", type:"choice", answer:"(1/S)∬_D f dS", options:["(1/S)∬_D f dS","S∬_D f dS","∬_D f dS без деления","max f"], difficulty:"medium" },
  ];

export default tasks;
