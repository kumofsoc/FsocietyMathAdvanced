import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"def-035-1", title:"Интегральная сумма", prompt:"Как выглядит интегральная сумма функции f на разбиении?", type:"choice", answer:"Σ f(cᵢ)Δxᵢ", options:["Σ f(cᵢ)Δxᵢ","Σ f(xᵢ)/Δxᵢ","Π f(cᵢ)Δxᵢ","f(b)−f(a)"], difficulty:"base" },
    { id:"def-035-2", title:"Диаметр разбиения", prompt:"Что означает λ в определении интеграла Римана?", type:"choice", answer:"Максимальную длину частичного отрезка", options:["Максимальную длину частичного отрезка","Число частей","Минимальное значение функции","Среднее значение функции"], difficulty:"base" },
    { id:"def-035-3", title:"Постоянная функция", prompt:"Вычисли ∫₁⁵ 3 dx.", type:"number", answer:"12", difficulty:"base" },
    { id:"def-038-1", title:"Аддитивность", prompt:"Как разложить ∫ₐᵇ f(x)dx через точку c между a и b?", type:"choice", answer:"∫ₐᶜf dx + ∫ᶜᵇf dx", options:["∫ₐᶜf dx + ∫ᶜᵇf dx","∫ₐᶜf dx − ∫ᶜᵇf dx","2∫ₐᶜf dx всегда","f(c)(a+b)"], difficulty:"base" },
    { id:"def-038-2", title:"Теорема о среднем", prompt:"Если f непрерывна на [a,b], чему равен ∫ₐᵇf(x)dx для некоторого c∈[a,b]?", type:"choice", answer:"f(c)(b−a)", options:["f(c)(b−a)","f(c)/(b−a)","f(a)+f(b)","f'(c)(b−a)"], difficulty:"medium" },
    { id:"def-038-3", title:"Порядок", prompt:"Если f(x)≤g(x) на [a,b], что верно?", type:"choice", answer:"∫ₐᵇf≤∫ₐᵇg", options:["∫ₐᵇf≤∫ₐᵇg","∫ₐᵇf≥∫ₐᵇg","Интегралы обязательно равны","Ничего нельзя сказать"], difficulty:"base" },
  ];

export default tasks;
