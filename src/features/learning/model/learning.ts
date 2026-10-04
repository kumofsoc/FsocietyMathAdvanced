export const THEORY_KEY = "fsociety-theory-read-v2";
export const SOLVED_KEY = "fsociety-solved-tasks-v2";
export const SAVED_THEOREMS_KEY = "fsociety-saved-theorems-v1";
export const READING_PROGRESS_KEY = "visualmath-reading-progress-v1";
export const READING_BLOCKS_KEY = "visualmath-reading-blocks-v1";
export const LEARNING_EVENT = "fsociety-learning-change";
export const LEARNING_MUTATIONS_KEY = "visualmath-learning-mutations-v1";

export interface SavedTheorem {
  id: string;
  topicId: string;
  topicTitle: string;
  title: string;
  body: string;
  formula?: string;
}

export type LearningMutationQueue = {
  theory: Record<string, boolean>;
  solved: Record<string, boolean>;
  theorems: Record<string, { saved: boolean; topicId: string | null }>;
};

function emptyLearningMutations(): LearningMutationQueue {
  return { theory: {}, solved: {}, theorems: {} };
}

export function loadLearningMutations(): LearningMutationQueue {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(LEARNING_MUTATIONS_KEY) || "{}",
    ) as Partial<LearningMutationQueue>;
    return {
      theory: parsed.theory ?? {},
      solved: parsed.solved ?? {},
      theorems: parsed.theorems ?? {},
    };
  } catch {
    return emptyLearningMutations();
  }
}

function persistLearningMutations(queue: LearningMutationQueue) {
  try {
    localStorage.setItem(LEARNING_MUTATIONS_KEY, JSON.stringify(queue));
  } catch (error) {
    console.warn("[VisualMath] could not persist learning mutation queue", error);
  }
}

function queueSetDiff(
  key: string,
  previous: Set<string>,
  next: Set<string>,
) {
  if (key !== THEORY_KEY && key !== SOLVED_KEY) return;
  const queue = loadLearningMutations();
  const target = key === THEORY_KEY ? queue.theory : queue.solved;

  for (const id of new Set([...previous, ...next])) {
    const before = previous.has(id);
    const after = next.has(id);
    if (before !== after) target[id] = after;
  }
  persistLearningMutations(queue);
}

export function clearLearningMutation(
  kind: "theory" | "solved" | "theorems",
  id: string,
) {
  const queue = loadLearningMutations();
  delete queue[kind][id];
  persistLearningMutations(queue);
}

export function loadSet(key: string): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

export function saveSet(key: string, value: Set<string>) {
  const previous = loadSet(key);
  try {
    localStorage.setItem(key, JSON.stringify([...value]));
  } catch (error) {
    console.warn("[FsocietyMath] could not persist learning set", error);
  }
  queueSetDiff(key, previous, value);
  window.dispatchEvent(new CustomEvent(LEARNING_EVENT));
}

export function loadSavedTheorems(): SavedTheorem[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_THEOREMS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveTheorems(value: SavedTheorem[]) {
  const previous = loadSavedTheorems();
  try {
    localStorage.setItem(SAVED_THEOREMS_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn("[FsocietyMath] could not persist saved theorems", error);
  }

  const previousById = new Map(previous.map((item) => [item.id, item]));
  const nextById = new Map(value.map((item) => [item.id, item]));
  const queue = loadLearningMutations();
  for (const id of new Set([...previousById.keys(), ...nextById.keys()])) {
    const before = previousById.get(id);
    const after = nextById.get(id);
    if (Boolean(before) === Boolean(after)) continue;
    queue.theorems[id] = {
      saved: Boolean(after),
      topicId: after?.topicId ?? before?.topicId ?? null,
    };
  }
  persistLearningMutations(queue);
  window.dispatchEvent(new CustomEvent(LEARNING_EVENT));
}


export function loadReadingProgress(): Record<string, number> {
  try {
    const parsed = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || "{}") as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => typeof value === "number" && Number.isFinite(value))
        .map(([topicId, value]) => [topicId, Math.min(1, Math.max(0, Number(value)))]),
    );
  } catch {
    return {};
  }
}

export function saveReadingProgress(topicId: string, ratio: number) {
  const nextRatio = Math.min(1, Math.max(0, ratio));
  const current = loadReadingProgress();
  const previous = current[topicId] ?? 0;
  if (nextRatio <= previous) return previous;

  const next = { ...current, [topicId]: nextRatio };
  try {
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("[VisualMath] could not persist reading progress", error);
  }
  window.dispatchEvent(new CustomEvent(LEARNING_EVENT));
  return nextRatio;
}


export function getReadingCoverageFromBlocks(
  topicId: string,
  totalBlocks: number,
  seenBlocks: Set<string>,
) {
  if (totalBlocks <= 0) return 0;
  const prefix = topicId + "::";
  const count = [...seenBlocks].filter((key) => key.startsWith(prefix)).length;
  return Math.min(1, count / totalBlocks);
}

export function loadReadingBlocks() {
  return loadSet(READING_BLOCKS_KEY);
}

export function markReadingBlock(topicId: string, blockIndex: number, totalBlocks: number) {
  const current = loadReadingBlocks();
  const key = topicId + "::" + blockIndex;
  if (!current.has(key)) {
    current.add(key);
    saveSet(READING_BLOCKS_KEY, current);
  }

  const ratio = getReadingCoverageFromBlocks(topicId, totalBlocks, current);
  saveReadingProgress(topicId, ratio);
  return ratio;
}


export type CanonicalLearningCache = {
  theoryRead: string[];
  solvedTaskIds: string[];
  savedTheorems: SavedTheorem[];
  readingProgress: Record<string, number>;
  readingBlocks?: string[];
};

export function replaceLearningCache(snapshot: CanonicalLearningCache) {
  try {
    localStorage.setItem(THEORY_KEY, JSON.stringify([...new Set(snapshot.theoryRead)]));
    localStorage.setItem(SOLVED_KEY, JSON.stringify([...new Set(snapshot.solvedTaskIds)]));
    localStorage.setItem(SAVED_THEOREMS_KEY, JSON.stringify(snapshot.savedTheorems));
    if (snapshot.readingBlocks) {
      localStorage.setItem(
        READING_BLOCKS_KEY,
        JSON.stringify([...new Set(snapshot.readingBlocks)]),
      );
    }

    const reading = Object.fromEntries(
      Object.entries(snapshot.readingProgress)
        .filter(([, value]) => typeof value === "number" && Number.isFinite(value))
        .map(([topicId, value]) => [topicId, Math.min(1, Math.max(0, value))]),
    );
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(reading));
  } catch (error) {
    console.warn("[VisualMath] could not hydrate canonical learning cache", error);
    return false;
  }

  window.dispatchEvent(new CustomEvent(LEARNING_EVENT));
  return true;
}
