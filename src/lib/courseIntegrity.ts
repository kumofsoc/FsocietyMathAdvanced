import { chapters, topics } from "../data/course";
import { practiceByTopic } from "../data/practice";

export interface CourseIntegrityIssue {
  kind: "chapter-topic" | "chapter-mismatch" | "prerequisite" | "practice-topic" | "task-id";
  message: string;
}

export function validateCourseIntegrity(): CourseIntegrityIssue[] {
  const issues: CourseIntegrityIssue[] = [];
  const topicIds = new Set(Object.keys(topics));

  for (const chapter of chapters) {
    for (const topicId of chapter.topicIds) {
      const topic = topics[topicId];
      if (!topic) {
        issues.push({
          kind: "chapter-topic",
          message: `Глава ${chapter.id} ссылается на отсутствующую тему ${topicId}.`,
        });
        continue;
      }

      if (topic.chapterId !== chapter.id) {
        issues.push({
          kind: "chapter-mismatch",
          message:
            `Тема ${topicId} находится в главе ${chapter.id}, ` +
            `но topic.chapterId = ${topic.chapterId}.`,
        });
      }
    }
  }

  for (const topic of Object.values(topics)) {
    for (const prerequisite of topic.prerequisites) {
      if (!topicIds.has(prerequisite)) {
        issues.push({
          kind: "prerequisite",
          message: `Тема ${topic.id} ссылается на отсутствующий prerequisite ${prerequisite}.`,
        });
      }
    }
  }

  const taskOwners = new Map<string, string>();
  for (const [topicId, tasks] of Object.entries(practiceByTopic)) {
    if (!topicIds.has(topicId)) {
      issues.push({
        kind: "practice-topic",
        message: `Практика существует для отсутствующей темы ${topicId}.`,
      });
    }

    for (const task of tasks) {
      const previousOwner = taskOwners.get(task.id);
      if (previousOwner) {
        issues.push({
          kind: "task-id",
          message:
            `Task id ${task.id} используется и в ${previousOwner}, и в ${topicId}. ` +
            "Это ломает независимый учёт прогресса.",
        });
      } else {
        taskOwners.set(task.id, topicId);
      }
    }
  }

  return issues;
}

export function reportCourseIntegrity() {
  if (!import.meta.env.DEV) return;
  const issues = validateCourseIntegrity();
  if (!issues.length) {
    console.info("[FsocietyMath] course integrity: OK");
    return;
  }

  console.groupCollapsed(
    `[FsocietyMath] course integrity: ${issues.length} issue(s)`,
  );
  issues.forEach((issue) => console.warn(issue.kind, issue.message));
  console.groupEnd();
}
