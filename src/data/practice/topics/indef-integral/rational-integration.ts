import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"int-031-1", title:"Правильная дробь", prompt:"Какая дробь правильная?", type:"choice", answer:"(x+1)/(x²+1)", options:["(x+1)/(x²+1)","(x³+1)/(x²+1)","x²/(x+1)","(x²+x)/(x²−1)"], difficulty:"base" },
    { id:"int-031-2", title:"Разложение", prompt:"Чему равен коэффициент A при 1/((x−1)(x+2)) = A/(x−1)+B/(x+2)?", type:"choice", answer:"1/3", options:["1/3","−1/3","1","3"], difficulty:"medium" },
    { id:"int-031-3", title:"Линейный множитель", prompt:"Как интегрируется A/(x−a)?", type:"choice", answer:"A ln|x−a|+C", options:["A ln|x−a|+C","A/(x−a)²+C","A arctg(x−a)+C","Ae^(x−a)+C"], difficulty:"base" },
    { id:"int-031-4", title:"Рациональные функции", prompt:"Верно ли, что любая рациональная функция интегрируется в элементарных функциях?", type:"choice", answer:"Да", options:["Да","Нет","Только если знаменатель линейный","Только если числитель постоянный"], difficulty:"base" },
  ];

export default tasks;
