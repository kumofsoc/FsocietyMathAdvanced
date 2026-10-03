import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    { id:"int-032-1", title:"Универсальная подстановка", prompt:"Какая подстановка называется универсальной тригонометрической?", type:"choice", answer:"t=tg(x/2)", options:["t=tg(x/2)","t=sin 2x","t=cos x","t=e^x"], difficulty:"base" },
    { id:"int-032-2", title:"Нечётная степень cos", prompt:"Для ∫sin^4 x cos^5 x dx какая замена естественна?", type:"choice", answer:"t=sin x", options:["t=sin x","t=cos x","t=tg(x/2) обязательно","t=x²"], difficulty:"base" },
    { id:"int-032-3", title:"Обе степени чётные", prompt:"Для ∫sin^4 x cos^2 x dx какой основной приём?", type:"choice", answer:"Формулы понижения степени", options:["Формулы понижения степени","Интегрирование по частям","Разложение на простейшие дроби","Подстановка e^x=t"], difficulty:"base" },
    { id:"int-032-4", title:"Произведение частот", prompt:"Что удобно применить к sin(8x)cos(2x)?", type:"choice", answer:"Формулу произведение-в-сумму", options:["Формулу произведение-в-сумму","Формулу Крамера","Правило Лопиталя","Формулу Тейлора"], difficulty:"base" },
  ];

export default tasks;
