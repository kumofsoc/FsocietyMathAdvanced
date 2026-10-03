import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
    id: "surface-integrals",
    number: "57–58",
    title: "Поверхностные интегралы",
    chapterId: "line-surface-integrals",
    summary: "Поверхностные интегралы I и II рода, вычисление через проекцию, поток поля, формулы Гаусса и Стокса.",
    prerequisites: ["line-integrals", "triple-integral"],
    blocks: [
      { kind:"definition", title:"57.1 · Поверхностный интеграл I рода", body:"Поверхность S разбивают на малые части площадей ΔSᵢ, выбирают точки Mᵢ и берут предел сумм f(Mᵢ)ΔSᵢ.", formula:String.raw`\iint_S f\,dS=\lim\sum f(M_i)\Delta S_i` },
      { kind:"theorem", title:"Существование", body:"Для гладкой поверхности и непрерывной функции поверхностный интеграл I рода существует." },
      { kind:"algorithm", title:"57.2 · Вычисление через проекцию", body:"Если S задана z=z(x,y), то элемент площади выражается через двойной интеграл по проекции D.", formula:String.raw`dS=\sqrt{1+z_x^2+z_y^2}\,dxdy` },
      { kind:"concepts", title:"57.3 · Приложения I рода", body:"Используется для массы тонкой оболочки, статических моментов, координат центра тяжести и площади поверхности.", items:["S=∬_S dS","m=∬_S ρ dS"] },
      { kind:"definition", title:"58.1 · Ориентированная поверхность", body:"Для интеграла II рода выбирается сторона двусторонней поверхности, то есть непрерывное направление нормали." },
      { kind:"definition", title:"Поверхностный интеграл II рода", body:"Он строится из ориентированных проекций площадок поверхности на координатные плоскости.", formula:String.raw`\iint_S P\,dydz+Q\,dzdx+R\,dxdy` },
      { kind:"property", title:"Смена стороны поверхности", body:"При изменении ориентации поверхности поверхностный интеграл II рода меняет знак." },
      { kind:"algorithm", title:"58.2 · Сведение к двойному интегралу", body:"Для поверхности z=z(x,y) и выбранной ориентации соответствующие проекции заменяются двойными интегралами по D." },
      { kind:"geometry", title:"Поток векторного поля", body:"Для F=(P,Q,R) поверхностный интеграл II рода выражает поток поля через ориентированную поверхность.", formula:String.raw`\Phi=\iint_S \mathbf F\cdot\mathbf n\,dS` },
      { kind:"theorem", title:"58.3 · Формула Остроградского—Гаусса", body:"Поток через замкнутую поверхность равен тройному интегралу дивергенции по заключённому объёму.", formula:String.raw`\iint_{\partial V}\mathbf F\cdot\mathbf n\,dS=\iiint_V \operatorname{div}\mathbf F\,dV` },
      { kind:"theorem", title:"58.4 · Формула Стокса", body:"Циркуляция поля по границе поверхности равна потоку ротора через эту поверхность.", formula:String.raw`\oint_{\partial S}\mathbf F\cdot d\mathbf r=\iint_S (\operatorname{rot}\mathbf F)\cdot\mathbf n\,dS` },
      { kind:"summary", title:"Итог", body:"I род интегрирует скаляр по площади поверхности. II род интегрирует ориентированный поток поля. Грин, Гаусс и Стокс связывают интегралы по границе с производными поля внутри области." }
    ],
  };

export default topic;
