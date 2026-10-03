import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"tri-001", title:"Элемент объёма", prompt:"Что суммируется в интегральной сумме тройного интеграла?", type:"choice", answer:"f(Mᵢ)ΔVᵢ", options:["f(Mᵢ)ΔVᵢ","f(Mᵢ)ΔSᵢ","f(Mᵢ)Δxᵢ","Только ΔVᵢ"], difficulty:"base" },
    { id:"tri-002", title:"Объём тела", prompt:"Чему равен ∭_V 1 dV?", type:"choice", answer:"Объёму V", options:["Объёму V","Площади поверхности V","0","1 всегда"], difficulty:"base" },
    { id:"tri-003", title:"Цилиндрические координаты", prompt:"Как выглядит элемент объёма в цилиндрических координатах?", type:"choice", answer:"r dr dφ dz", options:["r dr dφ dz","dr dφ dz","r² dr dφ dz","ρ² sinθ dρ dθ dφ"], difficulty:"base" },
    { id:"tri-004", title:"Сферические координаты", prompt:"Как выглядит элемент объёма в сферических координатах?", type:"choice", answer:"ρ² sinθ dρ dθ dφ", options:["ρ² sinθ dρ dθ dφ","ρ dρ dθ dφ","sinθ dρ dθ dφ","r dr dφ dz"], difficulty:"base" },
    { id:"tri-005", title:"Выбор координат", prompt:"Для шара x²+y²+z²≤R² какая система координат обычно наиболее естественна?", type:"choice", answer:"Сферическая", options:["Сферическая","Только декартова","Полярная двумерная","Логарифмическая"], difficulty:"base" },
  ];

export default tasks;
