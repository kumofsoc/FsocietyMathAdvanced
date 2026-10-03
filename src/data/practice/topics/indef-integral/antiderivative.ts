import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"int-029-1", title:"Первообразная", prompt:"Какая функция является первообразной для f(x)=3x²?", type:"choice", answer:"x³+C", options:["x³+C","3x³+C","x²+C","6x+C"], difficulty:"base" },
    { id:"int-029-2", title:"Почему появляется C", prompt:"Почему все первообразные одной функции отличаются на константу?", type:"choice", answer:"Их разность имеет нулевую производную", options:["Их разность имеет нулевую производную","У них одинаковые значения в нуле","Так определён логарифм","Потому что интеграл всегда положителен"], difficulty:"base" },
    { id:"int-029-3", title:"Линейность", prompt:"Чему равен ∫(2x+3)dx?", type:"choice", answer:"x²+3x+C", options:["x²+3x+C","2x²+3x+C","x²+3+C","2+3x+C"], difficulty:"base" },
    { id:"int-029-4", title:"Табличный интеграл", prompt:"Выбери ∫ dx/(1+x²).", type:"choice", answer:"arctg x + C", options:["arctg x + C","ln|x|+C","arcsin x+C","1/(1+x²)+C"], difficulty:"base" },
  ];

export default tasks;
