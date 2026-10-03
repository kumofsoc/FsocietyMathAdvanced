import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
    id: "triple-integral",
    number: "54",
    title: "Тройной интеграл",
    chapterId: "multiple-integrals",
    summary: "Интегральные суммы по объёму, повторное интегрирование, замена переменных, цилиндрические и сферические координаты и приложения.",
    prerequisites: ["double-integral"],
    blocks: [
      { kind:"definition", title:"54.1 · Тройной интеграл", body:"Область V пространства разбивают на малые объёмы ΔVᵢ, выбирают точки Mᵢ и рассматривают предел суммы f(Mᵢ)ΔVᵢ.", formula:String.raw`\iiint_V f(x,y,z)dV=\lim_{\max d_i\to0}\sum f(M_i)\Delta V_i` },
      { kind:"theorem", title:"Теорема 54.1 · Существование", body:"Если f непрерывна в ограниченной замкнутой области V, тройной интеграл существует и не зависит от способа разбиения." },
      { kind:"property", title:"Основные свойства", body:"Линейность, аддитивность по области, монотонность, оценка и теорема о среднем полностью аналогичны двойному интегралу.", items:["∭_V 1 dV = Vol(V)","mVol(V)≤∭_V f dV≤MVol(V)","∭(af+bg)=a∭f+b∭g"] },
      { kind:"algorithm", title:"54.2 · Вычисление в декартовых координатах", body:"Если тело правильно по Oz и проецируется в область D, внутренний интеграл идёт по z между поверхностями z₁(x,y) и z₂(x,y).", formula:String.raw`\iiint_V f\,dV=\iint_D\left[\int_{z_1(x,y)}^{z_2(x,y)}f(x,y,z)dz\right]dxdy` },
      { kind:"definition", title:"54.3 · Замена переменных", body:"При переходе к новым координатам элемент объёма умножается на модуль якобиана преобразования.", formula:String.raw`dV=|J|\,du\,dv\,dw` },
      { kind:"concepts", title:"Цилиндрические координаты", body:"Удобны для тел с осевой симметрией.", items:["x=r cosφ","y=r sinφ","z=z","dV=r dr dφ dz"] },
      { kind:"concepts", title:"Сферические координаты", body:"Удобны для шаров, сферических слоёв и тел с центральной симметрией.", items:["x=ρ sinθ cosφ","y=ρ sinθ sinφ","z=ρ cosθ","dV=ρ² sinθ dρ dθ dφ"] },
      { kind:"example", title:"Пример · Объём шара", body:"Для шара ρ≤R в сферических координатах границы становятся постоянными.", formula:String.raw`V=\int_0^{2\pi}\int_0^\pi\int_0^R \rho^2\sin\theta\,d\rho\,d\theta\,d\varphi=\frac{4\pi R^3}{3}` },
      { kind:"concepts", title:"54.4 · Приложения", body:"Тройной интеграл вычисляет массу неоднородного тела, статические моменты, координаты центра масс и моменты инерции." },
      { kind:"summary", title:"Итог", body:"Тройной интеграл — трёхмерный аналог двойного. Главная сложность обычно не в интегрировании, а в правильном описании тела и выборе системы координат." }
    ],
  };

export default topic;
