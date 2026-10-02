import { chapters, topicMeta } from "@/data/courseMeta";
import { practiceTaskIdsByTopic } from "@/data/practiceMeta";
import {
  loadReadingProgress,
  loadSet,
  SOLVED_KEY,
  THEORY_KEY,
} from "@/features/learning/model/learning";

export const THEORY_CHECKPOINT_THRESHOLD = 0.75;

export function isTrackedTopic(topicId: string) {
  const topic = topicMeta[topicId];
  return Boolean(topic && !topic.isStub);
}

export function isTrackedChapter(chapterId: string) {
  const chapter = chapters.find((item) => item.id === chapterId);
  return Boolean(chapter?.topicIds.some(isTrackedTopic));
}

export interface LearningSnapshot {
  theory: Set<string>;
  solved: Set<string>;
  reading?: Record<string, number>;
}

export interface TopicProgressBreakdown {
  total: number;
  reading: number;
  theoryCheckpoint: number;
  practice: number;
  readingRatio: number;
  practiceRatio: number;
  canCompleteTheory: boolean;
  theoryComplete: boolean;
  solvedCount: number;
  taskCount: number;
  stage: "not-started" | "reading" | "checkpoint-ready" | "practice" | "mastered";
}

export function getLearningSnapshot(): LearningSnapshot {
  return {
    theory: loadSet(THEORY_KEY),
    solved: loadSet(SOLVED_KEY),
    reading: loadReadingProgress(),
  };
}

function clampRatio(value: number | undefined) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value ?? 0));
}

export function getTopicProgressBreakdown(
  topicId: string,
  snapshot: LearningSnapshot = getLearningSnapshot(),
): TopicProgressBreakdown {
  if (!isTrackedTopic(topicId)) {
    return {
      total: 0,
      reading: 0,
      theoryCheckpoint: 0,
      practice: 0,
      readingRatio: 0,
      practiceRatio: 0,
      canCompleteTheory: false,
      theoryComplete: false,
      solvedCount: 0,
      taskCount: 0,
      stage: "not-started",
    };
  }

  const theoryComplete = snapshot.theory.has(topicId);
  const storedReadingRatio = clampRatio(snapshot.reading?.[topicId]);
  const readingRatio = theoryComplete ? Math.max(1, storedReadingRatio) : storedReadingRatio;
  const taskIds = practiceTaskIdsByTopic[topicId] ?? [];
  const solvedCount = taskIds.reduce(
    (count, taskId) => count + (snapshot.solved.has(taskId) ? 1 : 0),
    0,
  );
  const practiceRatio = taskIds.length ? solvedCount / taskIds.length : 0;

  const hasPractice = taskIds.length > 0;
  const readingMax = hasPractice ? 35 : 70;
  const checkpointMax = hasPractice ? 15 : 30;
  const reading = Math.round(readingRatio * readingMax);
  const theoryCheckpoint = theoryComplete ? checkpointMax : 0;
  const practice = hasPractice ? Math.round(practiceRatio * 50) : 0;
  const total = Math.min(100, reading + theoryCheckpoint + practice);
  const canCompleteTheory = readingRatio >= THEORY_CHECKPOINT_THRESHOLD;

  const stage: TopicProgressBreakdown["stage"] =
    total >= 100
      ? "mastered"
      : theoryComplete
        ? "practice"
        : canCompleteTheory
          ? "checkpoint-ready"
          : readingRatio > 0
            ? "reading"
            : "not-started";

  return {
    total,
    reading,
    theoryCheckpoint,
    practice,
    readingRatio,
    practiceRatio,
    canCompleteTheory,
    theoryComplete,
    solvedCount,
    taskCount: taskIds.length,
    stage,
  };
}

export function getTopicProgress(
  topicId: string,
  snapshot: LearningSnapshot = getLearningSnapshot(),
) {
  return getTopicProgressBreakdown(topicId, snapshot).total;
}

export function getChapterProgress(
  chapterId: string,
  snapshot: LearningSnapshot = getLearningSnapshot(),
) {
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) return 0;

  const topicIds = chapter.topicIds.filter(isTrackedTopic);
  if (!topicIds.length) return 0;

  return Math.round(
    topicIds.reduce(
      (sum, topicId) => sum + getTopicProgress(topicId, snapshot),
      0,
    ) / topicIds.length,
  );
}

export function getCourseProgress(snapshot: LearningSnapshot = getLearningSnapshot()) {
  const topicIds = chapters
    .flatMap((chapter) => chapter.topicIds)
    .filter(isTrackedTopic);
  if (!topicIds.length) return 0;

  return Math.round(
    topicIds.reduce(
      (sum, topicId) => sum + getTopicProgress(topicId, snapshot),
      0,
    ) / topicIds.length,
  );
}
