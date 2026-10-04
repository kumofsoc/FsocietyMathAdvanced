import { api, isBackendConfigured } from "@/shared/api/client";
import {
  READING_PROGRESS_KEY,
  SAVED_THEOREMS_KEY,
  SOLVED_KEY,
  THEORY_KEY,
  loadReadingProgress,
  loadSavedTheorems,
  loadSet,
  replaceLearningCache,
  type SavedTheorem,
} from "@/features/learning/model/learning";
import { topicMeta } from "@/data/courseMeta";
import type {
  BookmarkDto,
  LearningProgressDto,
  ProgressSyncRequest,
} from "@/shared/api/types";

export const LAST_TOPIC_KEY = "fsociety-last-topic-v1";

function readLastTopicId() {
  try {
    return localStorage.getItem(LAST_TOPIC_KEY);
  } catch {
    return null;
  }
}

export function buildLocalProgressSyncPayload(): ProgressSyncRequest {
  const readingProgress = loadReadingProgress();
  return {
    theoryRead: [...loadSet(THEORY_KEY)],
    solvedTaskIds: [...loadSet(SOLVED_KEY)],
    savedTheoremIds: loadSavedTheorems().map((item) => item.id),
    reading: readingProgress,
    readingProgress,
    lastTopicId: readLastTopicId(),
    clientUpdatedAt: new Date().toISOString(),
  };
}

function fallbackSavedTheorem(
  id: string,
  bookmark?: BookmarkDto,
): SavedTheorem {
  const parsedTopicId = bookmark?.topicId ?? id.split("::")[0] ?? "";
  const meta = topicMeta[parsedTopicId];
  return {
    id,
    topicId: parsedTopicId,
    topicTitle: meta?.title ?? parsedTopicId,
    title: bookmark?.title ?? id,
    body: "",
  };
}

export function hydrateCanonicalProgress(
  snapshot: LearningProgressDto,
  bookmarks: BookmarkDto[] = [],
) {
  const localSaved = new Map(loadSavedTheorems().map((item) => [item.id, item]));
  const bookmarkByContentId = new Map(
    bookmarks.map((item) => [item.contentBlockId, item]),
  );

  const savedTheorems = snapshot.savedTheoremIds.map(
    (id) =>
      localSaved.get(id) ??
      fallbackSavedTheorem(id, bookmarkByContentId.get(id)),
  );

  const hydrated = replaceLearningCache({
    theoryRead: snapshot.theoryRead,
    solvedTaskIds: snapshot.solvedTaskIds,
    savedTheorems,
    readingProgress: snapshot.readingProgress ?? snapshot.reading ?? {},
    readingBlocks: snapshot.readingBlockIds ?? [],
  });

  try {
    if (snapshot.lastTopicId) {
      localStorage.setItem(LAST_TOPIC_KEY, snapshot.lastTopicId);
    } else {
      localStorage.removeItem(LAST_TOPIC_KEY);
    }
  } catch {
    // Resume remains optional if browser storage is unavailable.
  }

  return hydrated;
}

export async function syncProgressToBackend() {
  if (!isBackendConfigured()) return null;
  const snapshot = await api.progress.sync(buildLocalProgressSyncPayload());
  let bookmarks: BookmarkDto[] = [];
  try {
    bookmarks = (await api.bookmarks.list()).bookmarks;
  } catch {
    // Learning sync must not fail only because rich bookmark metadata is unavailable.
  }
  hydrateCanonicalProgress(snapshot, bookmarks);
  return snapshot;
}

export const progressStorageKeys = {
  theory: THEORY_KEY,
  solved: SOLVED_KEY,
  savedTheorems: SAVED_THEOREMS_KEY,
  readingProgress: READING_PROGRESS_KEY,
  lastTopic: LAST_TOPIC_KEY,
} as const;
