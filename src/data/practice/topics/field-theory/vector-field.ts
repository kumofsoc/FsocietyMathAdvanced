import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"field-071-1", title:"Значение поля", prompt:"Для F(x,y)=(-y,x) найди F(1,2).", type:"choice", answer:"(-2,1)", options:["(-2,1)","(2,-1)","(1,2)","(-1,2)"], difficulty:"base" },
    { id:"field-071-2", title:"Интегральная кривая", prompt:"Какое уравнение выражает, что r(t) идёт по направлению векторного поля F?", type:"choice", answer:"r′(t)=F(r(t))", options:["r′(t)=F(r(t))","r(t)=0","F′(t)=r","r′(t)⊥F(r(t))"], difficulty:"base" },
    { id:"field-071-3", title:"Потенциальное поле", prompt:"Как выглядит определение потенциального поля?", type:"choice", answer:"F=∇φ", options:["F=∇φ","F=0 всегда","F=φ²","F=det φ"], difficulty:"base" },
    { id:"field-071-4", title:"Потенциал", prompt:"Какой потенциал подходит для F=(2x,2y)?", type:"choice", answer:"φ=x²+y²", options:["φ=x²+y²","φ=2x+2y","φ=xy","φ=x−y"], difficulty:"medium" },
    { id:"field-071-5", title:"Работа потенциального поля", prompt:"Если F=∇φ, от чего зависит ∫_A^B F·dr?", type:"choice", answer:"Только от φ(B)−φ(A)", options:["Только от φ(B)−φ(A)","От длины пути и больше ни от чего","От числа разбиений","Всегда равен 0"], difficulty:"medium" },
  ];

export default tasks;
