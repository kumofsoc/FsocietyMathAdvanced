import { api, isBackendConfigured } from "@/shared/api/client";
import { getLocalStorageItem } from "@/shared/lib/browserStorage";
import {
  SAVED_THEOREMS_KEY,
  SOLVED_KEY,
  THEORY_KEY,
  loadSavedTheorems,
  loadSet,
} from "@/features/learning/model/learning";
import type { ProgressSyncRequest } from "@/shared/api/types";

const LAST_TOPIC_KEY = "fsociety-last-topic-v1";

export function buildLocalProgressSyncPayload(): ProgressSyncRequest {
  const theoryRead = [...loadSet(THEORY_KEY)];
  const solvedTaskIds = [...loadSet(SOLVED_KEY)];
  const savedTheoremIds = loadSavedTheorems().map((item) => item.id);

  let lastTopicId: string | null = null;
  try {
    lastTopicId = getLocalStorageItem(LAST_TOPIC_KEY);
  } catch {
    lastTopicId = null;
  }

  return {
    theoryRead,
    solvedTaskIds,
    savedTheoremIds,
    lastTopicId,
    clientUpdatedAt: new Date().toISOString(),
  };
}

export async function syncProgressToBackend() {
  if (!isBackendConfigured()) return null;
  return api.progress.sync(buildLocalProgressSyncPayload());
}

// Reserved for the future server-first bootstrap. Keeping this separate from
// UI components lets us add conflict resolution without rewriting TopicPage.
export const progressStorageKeys = {
  theory: THEORY_KEY,
  solved: SOLVED_KEY,
  savedTheorems: SAVED_THEOREMS_KEY,
  lastTopic: LAST_TOPIC_KEY,
} as const;
