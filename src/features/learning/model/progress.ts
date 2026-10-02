import { chapters, topicMeta } from "@/data/courseMeta";
import { practiceTaskIdsByTopic } from "@/data/practiceMeta";
import { loadSet, SOLVED_KEY, THEORY_KEY } from "@/features/learning/model/learning";

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
  if (!isTrackedTopic(topicId)) return 0;
  const theory = snapshot.theory.has(topicId) ? 50 : 0;
  const taskIds = practiceTaskIdsByTopic[topicId] ?? [];
  if (!taskIds.length) return theory;

  const solvedCount = taskIds.reduce(
    (count, taskId) => count + (snapshot.solved.has(taskId) ? 1 : 0),
    0,
  );

  return Math.round(theory + (solvedCount / taskIds.length) * 50);
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
