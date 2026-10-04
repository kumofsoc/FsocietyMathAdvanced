import { readLocalStorage, readLocalStorageJson, writeLocalStorage } from "@/shared/lib/browserStorage";

export const SAVED_TOPICS_KEY = "visualmath-saved-topics-v1";
export const SAVED_TOPICS_EVENT = "visualmath:saved-topics-change";
export const SAVED_TOPICS_DIRTY_KEY = "visualmath-saved-topics-dirty-v1";

export function loadSavedTopicIds() {
  return readLocalStorageJson<string[]>(SAVED_TOPICS_KEY, []).filter(
    (id, index, list) => typeof id === "string" && id.length > 0 && list.indexOf(id) === index,
  );
}

function persistSavedTopicIds(ids: string[], markDirty = true) {
  const saved = writeLocalStorage(SAVED_TOPICS_KEY, JSON.stringify(ids));
  if (saved && markDirty) {
    writeLocalStorage(SAVED_TOPICS_DIRTY_KEY, "1");
  }
  if (saved && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SAVED_TOPICS_EVENT, { detail: ids }));
  }
  return saved;
}

export function setTopicSaved(topicId: string, saved: boolean) {
  const current = loadSavedTopicIds();
  const next = saved
    ? current.includes(topicId)
      ? current
      : [...current, topicId]
    : current.filter((id) => id !== topicId);

  persistSavedTopicIds(next, true);
  return next;
}

export function toggleSavedTopic(topicId: string) {
  const current = loadSavedTopicIds();
  const saved = !current.includes(topicId);
  return {
    ids: setTopicSaved(topicId, saved),
    saved,
  };
}


export function replaceSavedTopicIds(ids: string[]) {
  const normalized = ids.filter(
    (id, index, list) => typeof id === "string" && id.length > 0 && list.indexOf(id) === index,
  );
  persistSavedTopicIds(normalized, false);
  writeLocalStorage(SAVED_TOPICS_DIRTY_KEY, "0");
  return normalized;
}


export function savedTopicsAreDirty() {
  return readLocalStorage(SAVED_TOPICS_DIRTY_KEY) === "1";
}
