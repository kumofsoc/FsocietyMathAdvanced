import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"int-033-1", title:"Корень a²−x²", prompt:"Какая подстановка стандартна для √(a²−x²)?", type:"choice", answer:"x=a sin t", options:["x=a sin t","x=a tg t","x=a cosh t только","x=e^t"], difficulty:"base" },
    { id:"int-033-2", title:"Корень x²+a²", prompt:"Какая подстановка стандартна для √(x²+a²)?", type:"choice", answer:"x=a tg t", options:["x=a tg t","x=a sin t","x=a cos t","x=t²"], difficulty:"base" },
    { id:"int-033-3", title:"Неэлементарный интеграл", prompt:"Что означает фраза «интеграл не берётся» в §34?", type:"choice", answer:"Первообразная не выражается элементарными функциями", options:["Первообразная не выражается элементарными функциями","Первообразной не существует","Интеграл расходится","Функция разрывна"], difficulty:"medium" },
    { id:"int-033-4", title:"Пример специальной функции", prompt:"Какой из интегралов приводится в источнике как неэлементарный?", type:"choice", answer:"∫e^(−x²)dx", options:["∫e^(−x²)dx","∫x²dx","∫cos x dx","∫dx/x"], difficulty:"base" },
  ];

export default tasks;
