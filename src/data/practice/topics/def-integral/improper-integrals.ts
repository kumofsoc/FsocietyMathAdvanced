import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"def-040-1", title:"I род", prompt:"Как определяется ∫ₐ^∞ f(x)dx?", type:"choice", answer:"lim(b→∞)∫ₐᵇf(x)dx", options:["lim(b→∞)∫ₐᵇf(x)dx","∫ₐᵇf(x)dx при b=∞","f(∞)−f(a)","Σf(n)"], difficulty:"base" },
    { id:"def-040-2", title:"p-интеграл на бесконечности", prompt:"Когда сходится ∫₁^∞ dx/x^p?", type:"choice", answer:"p>1", options:["p>1","p≥0","p<1","Для любого p"], difficulty:"base" },
    { id:"def-040-3", title:"II род", prompt:"Когда сходится ∫₀¹ dx/x^p?", type:"choice", answer:"p<1", options:["p<1","p>1","p=1 только","Для любого p"], difficulty:"base" },
    { id:"def-040-4", title:"Внутренняя особая точка", prompt:"Если f имеет бесконечный разрыв внутри (a,b), когда общий несобственный интеграл сходится?", type:"choice", answer:"Когда сходятся обе части по разные стороны особой точки", options:["Когда сходятся обе части по разные стороны особой точки","Если хотя бы одна часть сходится","Всегда","Никогда"], difficulty:"medium" },
    { id:"def-040-5", title:"Сравнение", prompt:"lim f(x)/g(x)=k, 0<k<∞ для положительных функций. Что можно сказать об интегралах?", type:"choice", answer:"Они сходятся или расходятся одновременно", options:["Они сходятся или расходятся одновременно","Оба всегда сходятся","Оба всегда расходятся","Их значения равны"], difficulty:"medium" },
  ];

export default tasks;
