import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"field-072-1", title:"Набла", prompt:"Как записывается оператор Гамильтона в ℝ³?", type:"choice", answer:"(∂/∂x, ∂/∂y, ∂/∂z)", options:["(∂/∂x, ∂/∂y, ∂/∂z)","(x,y,z)","(dx,dy,dz)","(1,1,1)"], difficulty:"base" },
    { id:"field-072-2", title:"Дивергенция", prompt:"Найди div F для F=(x², 3y, −z).", type:"choice", answer:"2x+2", options:["2x+2","2x+3−z","x²+3y−z","0"], hint:"div F=P_x+Q_y+R_z.", difficulty:"base" },
    { id:"field-072-3", title:"Ротор вращательного поля", prompt:"Для F=(-y,x,0) чему равен rot F?", type:"choice", answer:"(0,0,2)", options:["(0,0,2)","(0,0,0)","(1,1,0)","(-1,1,0)"], difficulty:"medium" },
    { id:"field-072-4", title:"Ротор градиента", prompt:"Если F=∇φ и φ имеет непрерывные вторые производные, чему равен rot F?", type:"choice", answer:"0", options:["0","∇φ","Δφ","div F"], difficulty:"base" },
    { id:"field-072-5", title:"Соленоидальность", prompt:"Какое условие определяет соленоидальное поле?", type:"choice", answer:"div F=0", options:["div F=0","rot F=0","F=0","|F|=1"], difficulty:"base" },
    { id:"field-072-6", title:"Лапласиан", prompt:"Найди Δφ для φ=x²+y²+z².", type:"number", answer:"6", hint:"Сложи вторые частные производные по x, y, z.", difficulty:"medium" },
  ];

export default tasks;
