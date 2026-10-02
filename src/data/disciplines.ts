import type {
  CourseDefinition,
  DisciplineDefinition,
  KnowledgeDomainDefinition,
} from "@/entities/course/model/learning-architecture/types";
import { chapters } from "@/data/courseMeta";

export interface DisciplineCatalogEntry extends DisciplineDefinition {
  status: "active" | "planned";
}

export const knowledgeDomains: KnowledgeDomainDefinition[] = [
  {
    id: "fundamental-sciences",
    title: "Фундаментальные науки",
    description:
      "Единая карта фундаментальных дисциплин, где междисциплинарные зависимости могут связывать математику, физику и будущие научные курсы.",
    disciplineIds: ["mathematics", "physics"],
  },
];

export const disciplines: DisciplineCatalogEntry[] = [
  {
    id: "mathematics",
    domainId: "fundamental-sciences",
    kind: "mathematics",
    title: "Математика",
    description:
      "Высшая математика: от понятного первого объяснения до строгих доказательств, визуализаций и исследовательских расширений.",
    icon: "∑",
    status: "active",
  },
  {
    id: "physics",
    domainId: "fundamental-sciences",
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
    chapterIds: chapters.map((chapter) => chapter.id),
  },
];

export function getDiscipline(id: string) {
  return disciplines.find((discipline) => discipline.id === id);
}

export function getCoursesForDiscipline(disciplineId: string) {
  return scienceCourses.filter((course) => course.disciplineId === disciplineId);
}


export function getKnowledgeDomain(id: string) {
  return knowledgeDomains.find((domain) => domain.id === id);
}

export function getDisciplinesForDomain(domainId: string) {
  const domain = getKnowledgeDomain(domainId);
  if (!domain) return [];
  const allowed = new Set(domain.disciplineIds);
  return disciplines.filter((discipline) => allowed.has(discipline.id));
}
