import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"int-030-1", title:"Подстановка", prompt:"Для ∫2x(x²+1)^5 dx какая подстановка естественна?", type:"choice", answer:"u=x²+1", options:["u=x²+1","u=2x","u=x⁵","u=1/x"], difficulty:"base" },
    { id:"int-030-2", title:"По частям", prompt:"Как выглядит формула интегрирования по частям?", type:"choice", answer:"∫u dv=uv−∫v du", options:["∫u dv=uv−∫v du","∫u dv=uv+∫v du","∫u dv=u/v","∫u dv=du·dv"], difficulty:"base" },
    { id:"int-030-3", title:"Выбор u", prompt:"Для ∫x e^x dx что обычно выгодно взять за u?", type:"choice", answer:"x", options:["x","e^x","dx","1"], difficulty:"base" },
    { id:"int-030-4", title:"Дважды по частям", prompt:"Чему равен ∫x²e^x dx?", type:"choice", answer:"e^x(x²−2x+2)+C", options:["e^x(x²−2x+2)+C","x²e^x+C","e^x(x²+2x+2)+C","2xe^x+C"], difficulty:"medium" },
  ];

export default tasks;
