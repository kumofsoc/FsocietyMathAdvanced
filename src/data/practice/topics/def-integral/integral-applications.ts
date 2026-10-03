import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"def-041-1", title:"Площадь между графиками", prompt:"Если f≥g на [a,b], как найти площадь между графиками?", type:"choice", answer:"∫ₐᵇ(f−g)dx", options:["∫ₐᵇ(f−g)dx","∫ₐᵇ(f+g)dx","f(b)−g(a)","∫ₐᵇfg dx"], difficulty:"base" },
    { id:"def-041-2", title:"Длина дуги", prompt:"Какая формула задаёт длину графика y=f(x)?", type:"choice", answer:"∫ₐᵇ√(1+(f')²)dx", options:["∫ₐᵇ√(1+(f')²)dx","∫ₐᵇf²dx","∫ₐᵇ|f'|dx всегда","π∫ₐᵇf²dx"], difficulty:"base" },
    { id:"def-041-3", title:"Объём по сечениям", prompt:"Если S(x) — площадь поперечного сечения, чему равен объём?", type:"choice", answer:"∫ₐᵇS(x)dx", options:["∫ₐᵇS(x)dx","S(a)S(b)","π∫ₐᵇS²dx","S'(b)−S'(a)"], difficulty:"base" },
    { id:"def-041-4", title:"Работа силы", prompt:"Как вычисляется работа переменной силы F(x) вдоль оси?", type:"choice", answer:"∫ₐᵇF(x)dx", options:["∫ₐᵇF(x)dx","F(a)+F(b)","F'(b)−F'(a)","∫ₐᵇF²(x)dx"], difficulty:"base" },
    { id:"def-042-1", title:"Средние прямоугольники", prompt:"Где берётся значение функции на каждом маленьком отрезке в формуле средних прямоугольников?", type:"choice", answer:"В середине отрезка", options:["В середине отрезка","Только в левом конце","Только в правом конце","В точке максимума"], difficulty:"base" },
    { id:"def-042-2", title:"Симпсон", prompt:"Как чередуются коэффициенты внутренних ординат в формуле Симпсона?", type:"choice", answer:"4,2,4,2,…,4", options:["4,2,4,2,…,4","1,1,1,…","2,2,2,…","3,1,3,1,…"], difficulty:"medium" },
  ];

export default tasks;
