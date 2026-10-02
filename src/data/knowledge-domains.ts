import type { Discipline, KnowledgeDomain } from "@/entities/course/model/types";

export const knowledgeDomains: KnowledgeDomain[] = [
  {
    id: "mathematics",
    title: "Математика",
    description: "Фундаментальная математика от линейной алгебры и анализа до геометрии, тензоров и дальнейших разделов.",
    disciplineIds: ["higher-mathematics"],
  },
];

export const disciplines: Discipline[] = [
  {
    id: "higher-mathematics",
    domainId: "mathematics",
    title: "Высшая математика",
    description: "Связанный маршрут по алгебре, геометрии, анализу, дифференциальным уравнениям и смежным областям.",
    chapterIds: [],
  },
];

export const futureDomainBlueprints = [
  {
    id: "physics",
    title: "Физика",
    status: "planned" as const,
    dependsOnDomains: ["mathematics"],
  },
  {
    id: "computer-science",
    title: "Computer Science",
    status: "planned" as const,
    dependsOnDomains: ["mathematics"],
  },
  {
    id: "philosophy",
    title: "Философия и эпистемология",
    status: "planned" as const,
    dependsOnDomains: [],
  },
];
