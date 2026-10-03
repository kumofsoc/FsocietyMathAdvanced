import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
    id: "complex-operations",
    number: "28",
    title: "Действия над комплексными числами",
    chapterId: "complex",
    summary: "Сложение, вычитание, умножение, деление, формула Муавра и решения уравнения w^n=z.",
    prerequisites: ["complex-numbers"],
    blocks: [
      {
        kind: "definition",
        title: "28.1 · Сложение",
        body: "При сложении отдельно складываются действительные и мнимые части.",
        formula: String.raw`z_1+z_2=(x_1+x_2)+i(y_1+y_2)`,
      },
      {
        kind: "geometry",
        title: "Геометрия сложения",
        body: "На комплексной плоскости сложение совпадает со сложением обычных двумерных векторов.",
      },
      {
        kind: "property",
        title: "Неравенство треугольника",
        body: "Модуль суммы не превосходит суммы модулей.",
        formula: String.raw`|z_1+z_2|\le |z_1|+|z_2|`,
      },
      {
        kind: "definition",
        title: "28.2 · Вычитание",
        body: "Разность находится покомпонентно; её модуль равен расстоянию между соответствующими точками комплексной плоскости.",
        formula: String.raw`|z_1-z_2|=\sqrt{(x_1-x_2)^2+(y_1-y_2)^2}`,
      },
      {
        kind: "definition",
        title: "28.3 · Умножение",
        body: "В алгебраической форме раскрываются скобки и используется соотношение i²=−1.",
        formula: String.raw`(x_1+iy_1)(x_2+iy_2)=(x_1x_2-y_1y_2)+i(x_1y_2+y_1x_2)`,
      },
      {
        kind: "property",
        title: "Умножение в полярной форме",
        body: "Модули перемножаются, аргументы складываются.",
        formula: String.raw`r_1e^{i\varphi_1}r_2e^{i\varphi_2}=r_1r_2e^{i(\varphi_1+\varphi_2)}`,
      },
      {
        kind: "geometry",
        title: "Умножение = масштаб + поворот",
        body: "Множитель re^{iφ} растягивает все модули в r раз и поворачивает все аргументы на φ.",
      },
      {
        kind: "theorem",
        title: "Формула Муавра",
        body: "При возведении в натуральную степень модуль возводится в ту же степень, а аргумент умножается на показатель.",
        formula: String.raw`[r(\cos\varphi+i\sin\varphi)]^n=r^n(\cos n\varphi+i\sin n\varphi)`,
      },
      {
        kind: "definition",
        title: "28.4 · Деление",
        body: "В алгебраической записи знаменатель рационализуют сопряжённым числом. В полярной форме модули делятся, аргументы вычитаются.",
        formula: String.raw`\frac{z_1}{z_2}=\frac{z_1\overline{z_2}}{|z_2|^2},\qquad z_2\ne0`,
      },
      {
        kind: "definition",
        title: "28.5 · Решения w^n=z",
        body: "Для ненулевого z существуют ровно n различных комплексных решений. Их модули одинаковы, а аргументы отличаются на 2π/n.",
        formula: String.raw`w_k=\sqrt[n]{r}\,e^{i(\varphi+2\pi k)/n},\qquad k=0,\dots,n-1`,
      },
      {
        kind: "geometry",
        title: "Геометрия решений",
        body: "Все решения лежат на одной окружности и образуют вершины правильного n-угольника.",
      },
      {
        kind: "summary",
        title: "Итог",
        body: "Для сложения удобна алгебраическая форма; для произведений, степеней, деления и решения w^n=z — полярная форма.",
      },
    ],
  };

export default topic;
