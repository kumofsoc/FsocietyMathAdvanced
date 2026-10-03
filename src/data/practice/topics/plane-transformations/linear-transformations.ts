import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "lintr-001",
      title: "Определитель линейной части",
      prompt: "Для x*=2x+y, y*=x+3y вычисли определитель линейной части.",
      type: "number",
      answer: "5",
      hint: "det [[2,1],[1,3]]=2·3−1·1.",
      difficulty: "base",
    },
    {
      id: "lintr-002",
      title: "Взаимная однозначность",
      prompt: "Является ли преобразование x*=x+y, y*=2x+2y взаимно однозначным?",
      type: "choice",
      answer: "Нет, потому что det=0",
      options: [
        "Нет, потому что det=0",
        "Да, потому что коэффициенты ненулевые",
        "Да, потому что есть две формулы",
        "Нельзя определить"
      ],
      difficulty: "base",
    },
    {
      id: "lintr-003",
      title: "Образ вектора",
      prompt: "Матрица линейной части A=[[2,1],[0,3]]. Найди образ вектора v=(1,2).",
      type: "choice",
      answer: "(4, 6)",
      options: ["(4, 6)", "(3, 6)", "(2, 7)", "(5, 3)"],
      difficulty: "base",
    },
    {
      id: "lintr-004",
      title: "Ортогональное преобразование",
      prompt: "Что обязательно сохраняет ортогональное преобразование?",
      type: "choice",
      answer: "Расстояние между любыми двумя точками",
      options: [
        "Расстояние между любыми двумя точками",
        "Координаты каждой точки",
        "Площадь только треугольников",
        "Только направление оси x"
      ],
      difficulty: "base",
    },
  ];

export default tasks;
