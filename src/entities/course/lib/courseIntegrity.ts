import { chapters, topics } from "@/data/course";
import { chapters as metaChapters, topicMeta } from "@/data/courseMeta";
import { practiceByTopic } from "@/data/practice";
import { practiceTaskIdsByTopic } from "@/data/practiceMeta";
import { courseSearchIndex } from "@/data/courseSearchIndex";

export interface CourseIntegrityIssue {
  kind:
    | "chapter-topic"
    | "chapter-mismatch"
    | "prerequisite"
    | "practice-topic"
    | "task-id"
    | "course-meta"
    | "practice-meta"
    | "planned-prerequisite"
    | "practice-missing"
    | "search-index"
    | "topic-orphan"
    | "chapter-duplicate-topic"
    | "prerequisite-cycle"
    | "practice-meta-orphan"
    | "search-index-extra";
  message: string;
}

export function validateCourseIntegrity(): CourseIntegrityIssue[] {
  const issues: CourseIntegrityIssue[] = [];
  const topicIds = new Set(Object.keys(topics));
  const chapterOwners = new Map<string, string>();

  for (const chapter of chapters) {
    for (const topicId of chapter.topicIds) {
      const previousOwner = chapterOwners.get(topicId);
      if (previousOwner) {
        issues.push({
          kind: "chapter-duplicate-topic",
          message:
            `Тема ${topicId} одновременно указана в главах ${previousOwner} и ${chapter.id}.`,
        });
      } else {
        chapterOwners.set(topicId, chapter.id);
      }

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


  for (const topicId of topicIds) {
    if (!chapterOwners.has(topicId)) {
      issues.push({
        kind: "topic-orphan",
        message: `Тема ${topicId} существует в course.ts, но не включена ни в одну главу.`,
      });
    }
  }

  const visitState = new Map<string, 0 | 1 | 2>();
  const stack: string[] = [];

  const visitPrerequisites = (topicId: string) => {
    const state = visitState.get(topicId) ?? 0;
    if (state === 2) return;
    if (state === 1) {
      const cycleStart = stack.lastIndexOf(topicId);
      const cycle = [...stack.slice(Math.max(0, cycleStart)), topicId];
      issues.push({
        kind: "prerequisite-cycle",
        message: `Цикл prerequisite: ${cycle.join(" → ")}.`,
      });
      return;
    }

    visitState.set(topicId, 1);
    stack.push(topicId);

    for (const prerequisite of topics[topicId]?.prerequisites ?? []) {
      if (topicIds.has(prerequisite)) visitPrerequisites(prerequisite);
    }

    stack.pop();
    visitState.set(topicId, 2);
  };

  for (const topicId of topicIds) visitPrerequisites(topicId);

  for (const topic of Object.values(topics)) {
    const meta = topicMeta[topic.id];

    for (const prerequisite of topic.prerequisites) {
      if (!topicIds.has(prerequisite)) {
        issues.push({
          kind: "prerequisite",
          message: `Тема ${topic.id} ссылается на отсутствующий prerequisite ${prerequisite}.`,
        });
        continue;
      }

      if (!meta?.isStub && topicMeta[prerequisite]?.isStub) {
        issues.push({
          kind: "planned-prerequisite",
          message:
            `READY-тема ${topic.id} зависит от PLANNED-темы ${prerequisite}. ` +
            "Такой маршрут нельзя считать завершённым.",
        });
      }
    }

    if (!meta?.isStub && !(practiceByTopic[topic.id]?.length)) {
      issues.push({
        kind: "practice-missing",
        message:
          `READY-тема ${topic.id} не имеет банка задач и не сможет достичь 100% mastery.`,
      });
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


  const fullTopicIds = Object.keys(topics).sort();
  const metaTopicIds = Object.keys(topicMeta).sort();
  if (JSON.stringify(fullTopicIds) !== JSON.stringify(metaTopicIds)) {
    issues.push({
      kind: "course-meta",
      message: "courseMeta.ts не совпадает со списком тем из course.ts.",
    });
  }

  if (chapters.length !== metaChapters.length) {
    issues.push({
      kind: "course-meta",
      message: "courseMeta.ts не совпадает с количеством глав из course.ts.",
    });
  }

  chapters.forEach((chapter, index) => {
    const metaChapter = metaChapters[index];
    if (
      !metaChapter ||
      metaChapter.id !== chapter.id ||
      metaChapter.number !== chapter.number ||
      metaChapter.title !== chapter.title ||
      metaChapter.disciplineId !== chapter.disciplineId ||
      JSON.stringify(metaChapter.topicIds) !== JSON.stringify(chapter.topicIds)
    ) {
      issues.push({
        kind: "course-meta",
        message: `Metadata главы ${chapter.id} устарела относительно course.ts.`,
      });
    }
  });

  for (const topic of Object.values(topics)) {
    const meta = topicMeta[topic.id];
    if (!meta) continue;
    if (
      meta.number !== topic.number ||
      meta.title !== topic.title ||
      meta.chapterId !== topic.chapterId ||
      meta.summary !== topic.summary ||
      JSON.stringify(meta.prerequisites) !== JSON.stringify(topic.prerequisites)
    ) {
      issues.push({
        kind: "course-meta",
        message: `Metadata темы ${topic.id} устарела относительно course.ts.`,
      });
    }
  }

  for (const [topicId, tasks] of Object.entries(practiceByTopic)) {
    const fullIds = tasks.map((task) => task.id);
    const metaIds = practiceTaskIdsByTopic[topicId] ?? [];
    if (JSON.stringify(fullIds) !== JSON.stringify(metaIds)) {
      issues.push({
        kind: "practice-meta",
        message: `practiceMeta.ts устарел для темы ${topicId}.`,
      });
    }
  }

  for (const topicId of Object.keys(practiceTaskIdsByTopic)) {
    if (!(topicId in practiceByTopic)) {
      issues.push({
        kind: "practice-meta-orphan",
        message: `practiceMeta.ts содержит лишнюю запись для темы ${topicId}.`,
      });
    }
  }

  const searchKeys = new Set<string>();
  for (const entry of courseSearchIndex) {
    const topic = topics[entry.topicId];
    const key = entry.topicId + "::" + entry.index;

    if (!topic || topicMeta[entry.topicId]?.isStub || !topic.blocks[entry.index]) {
      issues.push({
        kind: "search-index-extra",
        message: `Deep search index содержит лишнюю запись ${key}.`,
      });
    }

    if (searchKeys.has(key)) {
      issues.push({
        kind: "search-index-extra",
        message: `Deep search index содержит дубликат ${key}.`,
      });
    } else {
      searchKeys.add(key);
    }
  }

  for (const topic of Object.values(topics)) {
    const meta = topicMeta[topic.id];
    if (meta?.isStub) continue;

    const indexed = courseSearchIndex
      .filter((entry) => entry.topicId === topic.id)
      .sort((a, b) => a.index - b.index);

    if (indexed.length !== topic.blocks.length) {
      issues.push({
        kind: "search-index",
        message:
          `Deep search index устарел для ${topic.id}: ` +
          `${indexed.length} блоков вместо ${topic.blocks.length}.`,
      });
      continue;
    }

    topic.blocks.forEach((block, index) => {
      const entry = indexed[index];
      if (entry.title !== block.title || entry.kind !== block.kind) {
        issues.push({
          kind: "search-index",
          message:
            `Deep search index устарел для ${topic.id}::${index} (${block.title}).`,
        });
      }
    });
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
