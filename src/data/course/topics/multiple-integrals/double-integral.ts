import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
    id: "double-integral",
    number: "53",
    title: "Двойной интеграл",
    chapterId: "multiple-integrals",
    summary: "Интегральная сумма по области, геометрический и физический смысл, свойства, повторный интеграл, полярные координаты и приложения.",
    prerequisites: ["riemann-integral", "multivariable-functions"],
    blocks: [
      { kind:"definition", title:"53.1 · Интегральная сумма по области", body:"Замкнутую область D разбивают на элементарные области Dᵢ площадей ΔSᵢ, в каждой выбирают точку Mᵢ=(xᵢ,yᵢ), после чего суммируют f(xᵢ,yᵢ)ΔSᵢ.", formula:String.raw`S_n=\sum_{i=1}^n f(x_i,y_i)\Delta S_i` },
      { kind:"definition", title:"Двойной интеграл", body:"Если предел интегральных сумм существует при измельчении разбиения и не зависит от разбиения и выбора точек, он называется двойным интегралом.", formula:String.raw`\iint_D f(x,y)\,dS=\lim_{\max d_i\to0}\sum f(x_i,y_i)\Delta S_i` },
      { kind:"theorem", title:"Теорема 53.1 · Существование", body:"Если f непрерывна в ограниченной замкнутой области D, двойной интеграл существует." },
      { kind:"geometry", title:"53.2 · Геометрический смысл", body:"Если f(x,y)≥0, двойной интеграл равен объёму тела под поверхностью z=f(x,y) над областью D.", formula:String.raw`V=\iint_D f(x,y)\,dxdy` },
      { kind:"concepts", title:"Физический смысл", body:"Если f — поверхностная плотность пластинки, двойной интеграл даёт её массу. Аналогично вычисляются статические моменты и координаты центра тяжести.", items:["m=∬_D ρ(x,y)dS","S_x=∬_D yρ(x,y)dS","S_y=∬_D xρ(x,y)dS","x_c=S_y/m, y_c=S_x/m"] },
      { kind:"property", title:"53.3 · Линейность", body:"Постоянный множитель выносится за знак интеграла, а интеграл от суммы равен сумме интегралов.", formula:String.raw`\iint_D(af+bg)dS=a\iint_Df\,dS+b\iint_Dg\,dS` },
      { kind:"property", title:"Аддитивность по области", body:"Если D=D₁∪D₂ и внутренности D₁,D₂ не пересекаются, интеграл по D равен сумме интегралов по частям." },
      { kind:"property", title:"Монотонность и оценка", body:"Если f≤g в D, то ∬f≤∬g. Для m≤f≤M выполняется mS≤∬f≤MS." },
      { kind:"theorem", title:"Теорема о среднем", body:"Для непрерывной f существует точка (x₀,y₀)∈D такая, что интеграл равен значению функции в этой точке, умноженному на площадь области.", formula:String.raw`\iint_D f\,dS=f(x_0,y_0)S(D)` },
      { kind:"algorithm", title:"53.4 · Повторный интеграл в декартовых координатах", body:"Если D={a≤x≤b, φ₁(x)≤y≤φ₂(x)}, сначала интегрируем по y, считая x параметром, затем по x.", formula:String.raw`\iint_D f(x,y)dxdy=\int_a^b\left[\int_{\varphi_1(x)}^{\varphi_2(x)}f(x,y)dy\right]dx` },
      { kind:"concepts", title:"Смена порядка интегрирования", body:"Одну и ту же область можно описать вертикальными или горизонтальными сечениями. Перед сменой порядка нужно заново выписать границы области." },
      { kind:"definition", title:"53.5 · Полярные координаты", body:"При x=r cosφ, y=r sinφ элемент площади получает множитель r.", formula:String.raw`dxdy=r\,dr\,d\varphi` },
      { kind:"example", title:"Пример · Круг", body:"Для круга x²+y²≤R² границы в полярных координатах особенно просты: 0≤r≤R, 0≤φ≤2π.", formula:String.raw`\iint_D f\,dxdy=\int_0^{2\pi}\int_0^R f(r\cos\varphi,r\sin\varphi)r\,dr\,d\varphi` },
      { kind:"summary", title:"Итог", body:"Двойной интеграл — предел сумм по маленьким площадкам. На практике задача сводится к описанию области и двум последовательным обычным интегралам; правильные координаты часто радикально упрощают границы." }
    ],
  };

export default topic;
