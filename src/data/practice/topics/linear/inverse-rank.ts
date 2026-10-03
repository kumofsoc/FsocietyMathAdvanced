import type { PracticeTask } from "@/entities/course/model/types";

const tasks: PracticeTask[] = [
    {
      id: "rank-608",
      title: "Ранг методом миноров",
      prompt: "Найди ранг матрицы [[2, −1, 3, −2, 4], [4, −2, 5, 1, 7], [2, −1, 1, 8, 2]].",
      type: "number",
      answer: "2",
      hint: "Проверь существование ненулевого минора 2-го порядка и затем — 3-го.",
      difficulty: "medium",
    },
    {
      id: "rank-610",
      title: "Ранг 4×5",
      prompt: "Найди ранг [[3,−1,3,2,5],[5,−3,2,3,4],[1,−3,−5,0,−7],[7,−5,1,4,1]].",
      type: "number",
      answer: "3",
      difficulty: "hard",
    },
    {
      id: "rank-611",
      title: "Ранг 5×5",
      prompt: "Найди ранг [[4,3,−5,2,3],[8,6,−7,4,2],[4,3,−8,2,7],[4,3,1,2,−5],[8,6,−1,4,−6]].",
      type: "number",
      answer: "2",
      hint: "Ищи линейные зависимости строк через элементарные преобразования.",
      difficulty: "hard",
    },
    {
      id: "rank-609",
      title: "Ранг матрицы 4×4",
      prompt: "Найди ранг [[1,3,5,−1],[2,−1,−3,4],[5,1,−1,7],[7,7,9,1]].",
      type: "number",
      answer: "3",
      hint: "Удобнее привести матрицу к ступенчатому виду.",
      difficulty: "hard",
    },
  ];

export default tasks;
