import { chapters } from "../data/course";
import { practiceByTopic } from "../data/practice";
import { loadSet, SOLVED_KEY, THEORY_KEY } from "./learning";

export const TRACKED_CHAPTER_IDS = new Set([
  "linear",
  "vectors",
  "plane-geometry",
  "space-geometry",
  "plane-transformations",
  "abstract-linear",
  "euclidean",
  "affine-general",
  "tensor-algebra",
  "analysis-intro",
  "indef-integral",
  "def-integral",
  "multivariable",
  "ode",
]);

export interface LearningSnapshot {
  theory: Set<string>;
  solved: Set<string>;
}

export function isTrackedChapter(id: string) {
  return TRACKED_CHAPTER_IDS.has(id);
}

export function getLearningSnapshot(): LearningSnapshot {
  return {
    theory: loadSet(THEORY_KEY),
    solved: loadSet(SOLVED_KEY),
  };
}

export function getTopicProgress(
  topicId: string,
  snapshot: LearningSnapshot = getLearningSnapshot(),
) {
  const theory = snapshot.theory.has(topicId) ? 50 : 0;
  const tasks = practiceByTopic[topicId] ?? [];
  if (!tasks.length) return theory;

  const solvedCount = tasks.reduce(
    (count, task) => count + (snapshot.solved.has(task.id) ? 1 : 0),
    0,
  );

  return Math.round(theory + (solvedCount / tasks.length) * 50);
}

export function getChapterProgress(
  chapterId: string,
  snapshot: LearningSnapshot = getLearningSnapshot(),
) {
  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter || !isTrackedChapter(chapter.id) || !chapter.topicIds.length) return 0;

  return Math.round(
    chapter.topicIds.reduce(
      (sum, topicId) => sum + getTopicProgress(topicId, snapshot),
      0,
    ) / chapter.topicIds.length,
  );
}

export function getCourseProgress(snapshot: LearningSnapshot = getLearningSnapshot()) {
  const tracked = chapters.filter((chapter) => isTrackedChapter(chapter.id));
  if (!tracked.length) return 0;

  const topicIds = tracked.flatMap((chapter) => chapter.topicIds);
  if (!topicIds.length) return 0;

  return Math.round(
    topicIds.reduce(
      (sum, topicId) => sum + getTopicProgress(topicId, snapshot),
      0,
    ) / topicIds.length,
  );
}
