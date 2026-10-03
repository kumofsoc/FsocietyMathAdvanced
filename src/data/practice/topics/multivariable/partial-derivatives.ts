import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"mv-044-1", title:"Частная производная", prompt:"Для f=x²y+3y найди fₓ.", type:"choice", answer:"2xy", options:["2xy","x²+3","2xy+3","x²"], difficulty:"base" },
    { id:"mv-044-2", title:"Частная производная по y", prompt:"Для f=x²y+3y найди fᵧ.", type:"choice", answer:"x²+3", options:["x²+3","2xy","2x+3","x²y"], difficulty:"base" },
    { id:"mv-044-3", title:"Шварц", prompt:"При каком условии в курсе гарантируется fₓᵧ=fᵧₓ?", type:"choice", answer:"При непрерывности соответствующих смешанных производных", options:["При непрерывности соответствующих смешанных производных","Всегда без условий","Только если f=0","Только для многочленов"], difficulty:"medium" },
    { id:"mv-044-4", title:"Полный дифференциал", prompt:"Как записывается dz для z=f(x,y)?", type:"choice", answer:"fₓdx+fᵧdy", options:["fₓdx+fᵧdy","fₓ+fᵧ","fₓdx·fᵧdy","dx+dy"], difficulty:"base" },
    { id:"mv-044-5", title:"Цепное правило", prompt:"x=x(t), y=y(t). Как найти dz/dt?", type:"choice", answer:"fₓ dx/dt + fᵧ dy/dt", options:["fₓ dx/dt + fᵧ dy/dt","fₓ+fᵧ","dx/dt+dy/dt","fₓfᵧ"], difficulty:"base" },
    { id:"mv-044-6", title:"Неявная функция", prompt:"F(x,y,z)=0 и F_z≠0. Чему равен zₓ?", type:"choice", answer:"−Fₓ/F_z", options:["−Fₓ/F_z","Fₓ/F_z","−F_z/Fₓ","Fₓ+F_z"], difficulty:"medium" },
  ];

export default tasks;
