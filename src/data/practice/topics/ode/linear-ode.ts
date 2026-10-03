import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"ode-050-1", title:"Характеристическое уравнение", prompt:"Для y''−3y'+2y=0 выбери характеристическое уравнение.", type:"choice", answer:"k²−3k+2=0", options:["k²−3k+2=0","k²+3k+2=0","2k²−3=0","k−3=0"], difficulty:"base" },
    { id:"ode-050-2", title:"Различные корни", prompt:"Корни k₁=1, k₂=2. Как выглядит общее решение?", type:"choice", answer:"C₁e^x+C₂e^(2x)", options:["C₁e^x+C₂e^(2x)","(C₁+C₂x)e^x","C₁cos x+C₂sin x","C₁x+C₂"], difficulty:"base" },
    { id:"ode-050-3", title:"Кратный корень", prompt:"Двойной корень k=−1. Как выглядит решение?", type:"choice", answer:"(C₁+C₂x)e^(−x)", options:["(C₁+C₂x)e^(−x)","C₁e^(−x)+C₂e^x","C₁cos x+C₂sin x","C₁+C₂x"], difficulty:"medium" },
    { id:"ode-050-4", title:"Комплексные корни", prompt:"Для корней α±βi какой общий вещественный вид решения?", type:"choice", answer:"e^(αx)(C₁cosβx+C₂sinβx)", options:["e^(αx)(C₁cosβx+C₂sinβx)","C₁e^(βx)+C₂e^(−βx)","αx+β","C₁x+C₂"], difficulty:"medium" },
    { id:"ode-051-1", title:"Структура ЛНДУ", prompt:"Как строится общее решение неоднородного линейного ДУ?", type:"choice", answer:"y=y_hom+y_part", options:["y=y_hom+y_part","y=y_hom·y_part","y=y_part только","y=0"], difficulty:"base" },
    { id:"ode-051-2", title:"Резонанс", prompt:"Что делают с пробным частным решением при совпадении его формы с однородным решением?", type:"choice", answer:"Умножают на подходящую степень x", options:["Умножают на подходящую степень x","Делят на x всегда","Берут производную","Меняют знак"], difficulty:"medium" },
  ];

export default tasks;
