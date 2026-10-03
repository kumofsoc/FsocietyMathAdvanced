import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
    id: "first-order-ode",
    number: "48",
    title: "Дифференциальные уравнения первого порядка",
    chapterId: "ode",
    summary: "Поле направлений, изоклины, разделяющиеся, однородные, линейные уравнения, Бернулли, Лагранжа и Клеро.",
    prerequisites: ["ode-basics", "integration-methods"],
    blocks: [
      { kind:"definition", title:"48.1 · ДУ первого порядка", body:"В общем виде уравнение первого порядка записывают F(x,y,y')=0. Если оно разрешимо относительно производной, удобно использовать форму y'=f(x,y).", formula:String.raw`y'=f(x,y)` },
      { kind:"geometry", title:"Поле направлений", body:"В точке (x,y) величина f(x,y) задаёт угловой коэффициент касательной к интегральной кривой. Поэтому уравнение y'=f(x,y) определяет поле направлений." },
      { kind:"definition", title:"Изоклина", body:"Кривая, на которой наклон y' постоянен, называется изоклиной.", formula:String.raw`f(x,y)=c` },
      { kind:"definition", title:"Уравнение с разделяющимися переменными", body:"Если уравнение можно привести к виду M(y)dy=N(x)dx, обе части интегрируются отдельно.", formula:String.raw`\int M(y)dy=\int N(x)dx+C` },
      { kind:"example", title:"Пример · y'=xy", body:"Разделяем переменные dy/y=x dx и интегрируем.", formula:String.raw`y=Ce^{x^2/2}` },
      { kind:"definition", title:"Однородное ДУ первого порядка", body:"Уравнение y'=F(y/x) сводится к разделяющимся подстановкой y=ux.", formula:String.raw`y=ux,\qquad y'=u+xu'` },
      { kind:"definition", title:"Линейное ДУ первого порядка", body:"Линейное уравнение имеет вид y'+p(x)y=q(x). Его можно решать, например, методом подстановки y=uv.", formula:String.raw`y'+p(x)y=q(x)` },
      { kind:"algorithm", title:"Метод Бернулли для линейного уравнения", body:"Полагают y=uv, затем выбирают v так, чтобы коэффициент при u упростился, после чего интегрируют уравнение для u." },
      { kind:"definition", title:"Уравнение Бернулли", body:"Уравнение y'+p(x)y=q(x)y^n при n≠0,1 сводится к линейному заменой z=y^(1−n).", formula:String.raw`z=y^{1-n}` },
      { kind:"definition", title:"Уравнение Клеро", body:"Частный случай уравнения Лагранжа y=xy'+ψ(y'). Оно имеет семейство прямых и, возможно, особое решение-огибающую.", formula:String.raw`y=cx+\psi(c)` },
      { kind:"example", title:"Пример Клеро", body:"Для y=xy'+(y')² общее решение y=cx+c², а особое решение получается из параметрических условий.", formula:String.raw`y=cx+c^2` },
      { kind:"summary", title:"Итог", body:"Главная задача в ДУ первого порядка — распознать структуру уравнения и выбрать замену, превращающую его в уже знакомый тип." }
    ],
  };

export default topic;
