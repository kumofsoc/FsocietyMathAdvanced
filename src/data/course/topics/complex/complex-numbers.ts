import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
    id: "complex-numbers",
    number: "27",
    title: "Комплексные числа",
    chapterId: "complex",
    summary: "Алгебраическая, геометрическая, тригонометрическая и показательная формы комплексного числа; модуль, аргумент и сопряжение.",
    prerequisites: ["taylor"],
    blocks: [
      {
        kind: "definition",
        title: "27.1 · Комплексное число",
        body: "Комплексное число записывается как z=x+iy, где x,y∈ℝ, а i²=−1. x называется действительной частью, y — мнимой.",
        formula: String.raw`z=x+iy,\qquad i^2=-1,\qquad \operatorname{Re}z=x,\ \operatorname{Im}z=y`,
      },
      {
        kind: "property",
        title: "Действительные числа внутри ℂ",
        body: "При y=0 комплексное число совпадает с обычным действительным числом, поэтому ℝ естественно вложено в ℂ.",
        formula: String.raw`\mathbb R\subset\mathbb C`,
      },
      {
        kind: "definition",
        title: "Равенство комплексных чисел",
        body: "Два комплексных числа равны тогда и только тогда, когда отдельно совпадают их действительные и мнимые части.",
        formula: String.raw`x_1+iy_1=x_2+iy_2\iff x_1=x_2,\ y_1=y_2`,
      },
      {
        kind: "note",
        title: "Порядок на ℂ",
        body: "Для комплексных чисел в курсе не вводятся отношения «больше» и «меньше» в том смысле, в каком они используются на действительной прямой.",
      },
      {
        kind: "definition",
        title: "Сопряжённое число",
        body: "Сопряжённое к z=x+iy число получается заменой знака мнимой части.",
        formula: String.raw`\overline z=x-iy`,
      },
      {
        kind: "definition",
        title: "27.2 · Комплексная плоскость",
        body: "Числу z=x+iy соответствует точка M(x,y) и радиус-вектор OM. Горизонтальная ось — действительная, вертикальная — мнимая.",
      },
      {
        kind: "definition",
        title: "Модуль",
        body: "Модуль комплексного числа — длина его радиус-вектора.",
        formula: String.raw`|z|=\sqrt{x^2+y^2}`,
      },
      {
        kind: "definition",
        title: "Аргумент",
        body: "Аргумент ненулевого комплексного числа — угол радиус-вектора с положительным направлением действительной оси. Он определён с точностью до 2πk.",
        formula: String.raw`\operatorname{Arg}z=\arg z+2\pi k,\qquad k\in\mathbb Z`,
      },
      {
        kind: "note",
        title: "Главное значение аргумента",
        body: "Главное значение обычно выбирается в интервале (−π,π]. Для z=0 аргумент не определён.",
      },
      {
        kind: "definition",
        title: "27.3 · Алгебраическая форма",
        body: "Исходная запись z=x+iy называется алгебраической формой комплексного числа.",
        formula: String.raw`z=x+iy`,
      },
      {
        kind: "definition",
        title: "Тригонометрическая форма",
        body: "Если r=|z| и φ — аргумент, то x=r cosφ, y=r sinφ.",
        formula: String.raw`z=r(\cos\varphi+i\sin\varphi)`,
      },
      {
        kind: "definition",
        title: "Показательная форма",
        body: "По формуле Эйлера cosφ+i sinφ=e^{iφ}, поэтому комплексное число можно записывать через модуль и фазу.",
        formula: String.raw`e^{i\varphi}=\cos\varphi+i\sin\varphi,\qquad z=re^{i\varphi}`,
      },
      {
        kind: "algorithm",
        title: "Переход из x+iy в r,φ",
        body: "Сначала вычисляют r=√(x²+y²). Затем определяют четверть точки и выбирают правильное главное значение аргумента; одной формулы arctan(y/x) без учёта четверти недостаточно.",
      },
      {
        kind: "example",
        title: "Пример 27.1 · z=−1+i",
        body: "Модуль равен √2. Точка лежит во II четверти, поэтому главное значение аргумента равно 3π/4.",
        formula: String.raw`-1+i=\sqrt2\left(\cos\frac{3\pi}4+i\sin\frac{3\pi}4\right)=\sqrt2e^{3\pi i/4}`,
      },
      {
        kind: "summary",
        title: "Итог",
        body: "Алгебраическая форма удобна для сложения, а полярные формы — для умножения, деления, степеней и корней. Геометрически комплексное число — точка или вектор на плоскости.",
      },
    ],
  };

export default topic;
