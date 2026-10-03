import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"mv-045-1", title:"Касательная плоскость", prompt:"Какое выражение стоит при (x−x₀) в касательной плоскости к z=f(x,y)?", type:"choice", answer:"fₓ(x₀,y₀)", options:["fₓ(x₀,y₀)","fᵧ(x₀,y₀)","f(x₀,y₀)²","1 всегда"], difficulty:"base" },
    { id:"mv-045-2", title:"Нормальный вектор", prompt:"Какой вектор нормален к касательной плоскости графика z=f(x,y)?", type:"choice", answer:"(fₓ,fᵧ,−1)", options:["(fₓ,fᵧ,−1)","(1,1,1)","(fₓ,−fᵧ,0)","(x₀,y₀,z₀)"], difficulty:"base" },
    { id:"mv-045-3", title:"Неявная поверхность", prompt:"Для F(x,y,z)=0 что задаёт направление нормали в обычной точке?", type:"choice", answer:"∇F", options:["∇F","F","det F","Только Fₓ"], difficulty:"base" },
    { id:"mv-045-4", title:"Параболоид", prompt:"Для z=x²+y² в точке (1,−1,2) выбери касательную плоскость.", type:"choice", answer:"z−2=2(x−1)−2(y+1)", options:["z−2=2(x−1)−2(y+1)","z−2=x+y","z=2","z−2=−2(x−1)+2(y+1)"], difficulty:"medium" },
  ];

export default tasks;
