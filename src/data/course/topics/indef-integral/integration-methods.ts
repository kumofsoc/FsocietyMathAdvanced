import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
    id: "integration-methods",
    number: "30",
    title: "Основные методы интегрирования",
    chapterId: "indef-integral",
    summary: "Непосредственное интегрирование, замена переменной и интегрирование по частям.",
    prerequisites: ["antiderivative"],
    blocks: [
      { kind: "algorithm", title: "30.1 · Непосредственное интегрирование", body: "Подынтегральную функцию преобразуют так, чтобы она распалась на сумму табличных интегралов: раскрывают скобки, делят почленно, выделяют полный дифференциал внутренней функции." },
      { kind: "example", title: "Пример · Узнать внутренний дифференциал", body: "Если в интеграле присутствуют функция g(x) и её производная g'(x), полезно рассматривать g(x) как новую переменную.", formula: String.raw`\int g'(x)g(x)^n dx=\frac{g(x)^{n+1}}{n+1}+C` },
      { kind: "definition", title: "30.2 · Замена переменной", body: "Подстановка u=φ(x) заменяет сложную внутреннюю структуру одной переменной u. Вместе с переменной обязательно преобразуется дифференциал.", formula: String.raw`u=\varphi(x),\qquad du=\varphi'(x)dx` },
      { kind: "formula", title: "Формула подстановки", body: "Если после замены весь интеграл выражен через u и du, вычисляем его в новой переменной, затем возвращаемся к x.", formula: String.raw`\int f(\varphi(x))\varphi'(x)dx=F(\varphi(x))+C` },
      { kind: "example", title: "Пример 30.4 · Подстановка x+2=t", body: "В интеграле x(x+2)^100 dx естественно взять t=x+2. Тогда x=t−2, dx=dt, и интеграл становится суммой степенных.", formula: String.raw`\int x(x+2)^{100}dx=\int(t-2)t^{100}dt` },
      { kind: "definition", title: "30.3 · Интегрирование по частям", body: "Формула получается из дифференциала произведения d(uv)=u dv+v du.", formula: String.raw`\int u\,dv=uv-\int v\,du`, proofs: [{ label: "Доказательство", body: "Интегрируем равенство d(uv)=u dv+v du и переносим интеграл ∫v du в другую часть." }] },
      { kind: "concepts", title: "Как выбирать u и dv", body: "Удачный выбор делает новый интеграл проще исходного.", items: ["Для P(x)e^{kx}, P(x)sin kx, P(x)cos kx обычно берут u=P(x).","Для ln x, arctg x, arcsin x удобно брать u равным этой функции, а dv=dx.","Иногда интегрирование по частям применяется несколько раз."] },
      { kind: "example", title: "Пример · ∫x²eˣdx", body: "Дважды применяем интегрирование по частям: степень многочлена уменьшается на единицу на каждом шаге.", formula: String.raw`\int x^2e^x dx=e^x(x^2-2x+2)+C` },
      { kind: "example", title: "Пример · ∫arctg x dx", body: "Берём u=arctg x, dv=dx. Тогда du=dx/(1+x²), v=x.", formula: String.raw`\int\arctan x\,dx=x\arctan x-\frac12\ln(1+x^2)+C` },
      { kind: "summary", title: "Итог", body: "Есть три базовых режима: привести к таблице напрямую, заменить сложную внутреннюю функцию новой переменной или перенести производную с одного множителя на другой методом по частям." }
    ],
  };

export default topic;
