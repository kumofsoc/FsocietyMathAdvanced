import { readLocalStorageJson, writeLocalStorage } from "@/shared/lib/browserStorage";

export const TOPIC_RESUME_KEY = "visualmath-topic-resume-v1";
export const TOPIC_RESUME_EVENT = "visualmath:topic-resume-change";

export type TopicResumeEntry = {
  blockIndex: number;
  updatedAt: number;
};

type TopicResumeState = Record<string, TopicResumeEntry>;

export function loadTopicResumeState(): TopicResumeState {
  return readLocalStorageJson<TopicResumeState>(TOPIC_RESUME_KEY, {});
}

export function loadTopicResume(topicId: string): TopicResumeEntry | null {
  const entry = loadTopicResumeState()[topicId];
  if (!entry || !Number.isInteger(entry.blockIndex) || entry.blockIndex < 0) {
    return null;
  }
  return entry;
}

export function saveTopicResume(topicId: string, blockIndex: number) {
  if (!Number.isInteger(blockIndex) || blockIndex < 0) return false;

  const state = loadTopicResumeState();
  const next: TopicResumeState = {
    ...state,
    [topicId]: {
      blockIndex,
      updatedAt: Date.now(),
    },
  };

  const saved = writeLocalStorage(TOPIC_RESUME_KEY, JSON.stringify(next));
  if (saved && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOPIC_RESUME_EVENT));
  }
  return saved;
}

export function replaceTopicResumeState(state: TopicResumeState) {
  const normalized = Object.fromEntries(
    Object.entries(state).filter(
      ([topicId, entry]) =>
        Boolean(topicId) &&
        Number.isInteger(entry.blockIndex) &&
        entry.blockIndex >= 0 &&
        Number.isFinite(entry.updatedAt),
    ),
  );
  const saved = writeLocalStorage(TOPIC_RESUME_KEY, JSON.stringify(normalized));
  if (saved && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(TOPIC_RESUME_EVENT));
  }
  return saved;
}
