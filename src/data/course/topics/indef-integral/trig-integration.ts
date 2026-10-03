import type { Topic } from "@/entities/course/model/types";

const topic: Topic = {
    id: "trig-integration",
    number: "32",
    title: "Интегрирование тригонометрических функций",
    chapterId: "indef-integral",
    summary: "Универсальная подстановка t=tg(x/2), специальные подстановки для sin/cos и формулы преобразования произведений.",
    prerequisites: ["integration-methods"],
    blocks: [
      { kind: "definition", title: "32.1 · Универсальная тригонометрическая подстановка", body: "Любая рациональная функция от sin x и cos x рационализируется заменой t=tg(x/2).", formula: String.raw`t=\tan\frac x2,\quad \sin x=\frac{2t}{1+t^2},\quad \cos x=\frac{1-t^2}{1+t^2},\quad dx=\frac{2dt}{1+t^2}` },
      { kind: "note", title: "Когда универсальная подстановка избыточна", body: "Она гарантированно работает, но часто приводит к громоздкой рациональной дроби. Сначала стоит проверить симметрию подынтегральной функции." },
      { kind: "property", title: "Нечётность по sin x", body: "Если R(−sin x,cos x)=−R(sin x,cos x), удобно положить cos x=t." },
      { kind: "property", title: "Нечётность по cos x", body: "Если R(sin x,−cos x)=−R(sin x,cos x), удобно положить sin x=t." },
      { kind: "property", title: "Совместная чётность", body: "Если R(−sin x,−cos x)=R(sin x,cos x), часто рационализирует подстановка tg x=t." },
      { kind: "concepts", title: "32.2 · Интегралы ∫sin^m x cos^n x dx", body: "Выбор метода определяется чётностью степеней.", items: ["n нечётно → отделить cos x dx и положить t=sin x","m нечётно → отделить sin x dx и положить t=cos x","m,n чётны и неотрицательны → применять формулы понижения степени","m+n — чётное отрицательное целое → использовать t=tg x"] },
      { kind: "formula", title: "Формулы понижения степени", body: "Квадраты синуса и косинуса заменяются выражениями через двойной угол.", formula: String.raw`\sin^2x=\frac{1-\cos2x}{2},\qquad \cos^2x=\frac{1+\cos2x}{2}` },
      { kind: "concepts", title: "32.3 · Преобразование произведений", body: "Произведения синусов и косинусов разных частот превращаются в суммы.", items: ["sin α cos β = 1/2[sin(α+β)+sin(α−β)]","cos α cos β = 1/2[cos(α−β)+cos(α+β)]","sin α sin β = 1/2[cos(α−β)−cos(α+β)]"] },
      { kind: "example", title: "Пример · ∫sin⁴x cos⁵x dx", body: "Степень cos нечётна: отделяем cos x dx, остальные cos⁴x заменяем через 1−sin²x и кладём t=sin x." },
      { kind: "summary", title: "Итог", body: "Тригонометрический интеграл почти всегда решается выбором рационализирующей замены. Универсальная подстановка — страховка, но симметрия часто даёт намного более короткий путь." }
    ],
  };

export default topic;
