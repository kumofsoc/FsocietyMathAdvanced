import type { PracticeTask } from "@/entities/course/model/types";
import { linearAcademyPracticeByTopic } from "@/data/linearAcademyPractice";
import { linearAcademyExamPracticeByTopic } from "@/data/linearAcademyExamPractice";
import { linearAcademyProofPracticeByTopic } from "@/data/linearAcademyProofPractice";

type PracticeRegistry = Record<string, PracticeTask[]>;

export function enrichPracticeForTopic(
  topicId: string,
  baseTasks: PracticeTask[],
): PracticeTask[] {
  return [
    ...baseTasks,
    ...(linearAcademyPracticeByTopic[topicId] ?? []),
    ...(linearAcademyExamPracticeByTopic[topicId] ?? []),
    ...(linearAcademyProofPracticeByTopic[topicId] ?? []),
  ];
}

export function enrichPracticeRegistry(basePractice: PracticeRegistry): PracticeRegistry {
  return Object.fromEntries(
    Object.entries(basePractice).map(([topicId, tasks]) => [
      topicId,
      enrichPracticeForTopic(topicId, tasks),
    ]),
  );
}
