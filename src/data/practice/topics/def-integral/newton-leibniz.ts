import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"def-037-1", title:"Ньютон–Лейбниц", prompt:"Если F'=f, чему равен ∫ₐᵇf(x)dx?", type:"choice", answer:"F(b)−F(a)", options:["F(b)−F(a)","F(a)−F(b)","F(a)+F(b)","f(b)−f(a)"], difficulty:"base" },
    { id:"def-037-2", title:"Прямое вычисление", prompt:"Вычисли ∫₀³ x² dx.", type:"number", answer:"9", difficulty:"base" },
    { id:"def-039-1", title:"Замена переменной", prompt:"Что обязательно надо изменить вместе с x=φ(t) в определённом интеграле?", type:"choice", answer:"Пределы интегрирования", options:["Пределы интегрирования","Только знак интеграла","Название функции","Ничего"], difficulty:"base" },
    { id:"def-039-2", title:"По частям", prompt:"Выбери правильную формулу для определённого интеграла.", type:"choice", answer:"∫ₐᵇu dv=uv|ₐᵇ−∫ₐᵇv du", options:["∫ₐᵇu dv=uv|ₐᵇ−∫ₐᵇv du","∫ₐᵇu dv=uv|ₐᵇ+∫ₐᵇv du","∫ₐᵇu dv=u/v","∫ₐᵇu dv=0"], difficulty:"base" },
    { id:"def-039-3", title:"Нечётность", prompt:"f нечётна. Чему равен ∫₋ₐᵃ f(x)dx?", type:"number", answer:"0", difficulty:"base" },
    { id:"def-039-4", title:"Чётность", prompt:"f чётна. Как переписать ∫₋ₐᵃf(x)dx?", type:"choice", answer:"2∫₀ᵃf(x)dx", options:["2∫₀ᵃf(x)dx","0","∫₀ᵃf(x)dx","−2∫₀ᵃf(x)dx"], difficulty:"base" },
  ];

export default tasks;
