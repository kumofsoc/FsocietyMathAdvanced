import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"series-060-1", title:"p-ряд", prompt:"Сходится ли ∑1/n²?", type:"choice", answer:"Да, потому что p=2>1", options:["Да, потому что p=2>1","Нет, любой p-ряд расходится","Нет, потому что 1/n²→0","Да, потому что p<1"], difficulty:"base" },
    { id:"series-060-2", title:"Гармонический ряд", prompt:"Что верно для ∑1/n?", type:"choice", answer:"Расходится", options:["Расходится","Сходится к 1","Сходится к π","Абсолютно сходится"], difficulty:"base" },
    { id:"series-060-3", title:"Сравнение", prompt:"Что следует из 0≤1/(n²+1)≤1/n² и сходимости ∑1/n²?", type:"choice", answer:"∑1/(n²+1) сходится", options:["∑1/(n²+1) сходится","∑1/(n²+1) расходится","Ничего нельзя сказать","1/(n²+1) не стремится к 0"], difficulty:"base" },
    { id:"series-060-4", title:"Предельное сравнение", prompt:"С каким p-рядом естественно сравнить (3n+1)/(n³+5)?", type:"choice", answer:"1/n²", options:["1/n²","1/n","1/n³","1/√n"], difficulty:"medium" },
    { id:"series-060-5", title:"Даламбер", prompt:"Для aₙ=3ⁿ/n! чему стремится aₙ₊₁/aₙ?", type:"choice", answer:"0", options:["0","1","3","∞"], hint:"aₙ₊₁/aₙ=3/(n+1).", difficulty:"medium" },
    { id:"series-060-6", title:"Радикальный признак", prompt:"Для aₙ=(2/3)ⁿ чему равен lim ⁿ√aₙ?", type:"choice", answer:"2/3", options:["2/3","1","0","3/2"], difficulty:"base" },
  ];

export default tasks;
