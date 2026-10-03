import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
    id: "line-integrals",
    number: "55–56",
    title: "Криволинейные интегралы",
    chapterId: "line-surface-integrals",
    summary: "Криволинейные интегралы I и II рода, вычисление по параметру, работа поля, формула Грина и независимость от пути.",
    prerequisites: ["double-integral", "vector-field"],
    blocks: [
      { kind:"definition", title:"55.1 · Криволинейный интеграл I рода", body:"Кривую L разбивают на малые дуги Δlᵢ, выбирают точки Mᵢ и переходят к пределу сумм f(Mᵢ)Δlᵢ.", formula:String.raw`\int_L f\,dl=\lim\sum f(M_i)\Delta l_i` },
      { kind:"theorem", title:"Теорема 55.1 · Существование", body:"Если L гладкая, а f непрерывна на L, криволинейный интеграл I рода существует и не зависит от разбиения и выбора точек." },
      { kind:"algorithm", title:"55.2 · Вычисление по параметру", body:"Если x=x(t), y=y(t), α≤t≤β, то dl=√(x'²+y'²)dt.", formula:String.raw`\int_L f(x,y)dl=\int_\alpha^\beta f(x(t),y(t))\sqrt{x'^2+y'^2}\,dt` },
      { kind:"concepts", title:"55.3 · Приложения I рода", body:"Интеграл I рода используется для массы проволоки, статических моментов и центра тяжести кривой.", items:["m=∫_L ρ dl","координаты центра тяжести — через взвешенные интегралы"] },
      { kind:"definition", title:"56.1 · Криволинейный интеграл II рода", body:"Интеграл II рода учитывает ориентированные проекции элементов кривой на координатные оси.", formula:String.raw`\int_L P\,dx+Q\,dy` },
      { kind:"property", title:"Ориентация пути", body:"При изменении направления обхода интеграл II рода меняет знак." },
      { kind:"algorithm", title:"56.2 · Вычисление по параметру", body:"Для x=x(t), y=y(t) заменяем dx=x'dt, dy=y'dt.", formula:String.raw`\int_L Pdx+Qdy=\int_\alpha^\beta [P(x,y)x'+Q(x,y)y']dt` },
      { kind:"geometry", title:"Работа векторного поля", body:"Если F=(P,Q), криволинейный интеграл II рода равен работе поля вдоль ориентированного пути.", formula:String.raw`A=\int_L \mathbf F\cdot d\mathbf r` },
      { kind:"theorem", title:"56.3 · Формула Остроградского—Грина", body:"Интеграл по положительно ориентированной границе области D связывается с двойным интегралом по самой области.", formula:String.raw`\oint_{\partial D}Pdx+Qdy=\iint_D\left(\frac{\partial Q}{\partial x}-\frac{\partial P}{\partial y}\right)dxdy` },
      { kind:"theorem", title:"56.4 · Независимость от пути", body:"В односвязной области при непрерывных первых производных условие ∂P/∂y=∂Q/∂x эквивалентно локальной потенциальности и независимости интеграла от пути.", formula:String.raw`\frac{\partial P}{\partial y}=\frac{\partial Q}{\partial x}` },
      { kind:"summary", title:"Итог", body:"I род измеряет скалярную плотность вдоль длины кривой. II род чувствителен к ориентации и взаимодействию кривой с векторным полем." }
    ],
  };

export default topic;
