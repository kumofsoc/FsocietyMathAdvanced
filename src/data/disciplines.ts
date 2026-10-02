import type {
  CourseDefinition,
  DisciplineDefinition,
} from "@/entities/course/model/learning-architecture/types";

export interface DisciplineCatalogEntry extends DisciplineDefinition {
  status: "active" | "planned";
}

export const disciplines: DisciplineCatalogEntry[] = [
  {
    id: "mathematics",
    kind: "mathematics",
    title: "Математика",
    description:
      "Высшая математика: от понятного первого объяснения до строгих доказательств, визуализаций и исследовательских расширений.",
    icon: "∑",
    status: "active",
  },
  {
    id: "physics",
    kind: "physics",
    title: "Физика",
    description:
      "Будущая дисциплина платформы: модели, законы, выводы, измерения, эксперименты, симуляции и задачи.",
    icon: "φ",
    status: "planned",
  },
];

export const scienceCourses: CourseDefinition[] = [
  {
    id: "higher-mathematics",
    disciplineId: "mathematics",
    title: "Высшая математика",
    description:
      "Текущий основной курс VisualMath с картой зависимостей, теорией, доказательствами, практикой и визуализациями.",
    chapterIds: [],
  },
];

export function getDiscipline(id: string) {
  return disciplines.find((discipline) => discipline.id === id);
}

export function getCoursesForDiscipline(disciplineId: string) {
  return scienceCourses.filter((course) => course.disciplineId === disciplineId);
}
