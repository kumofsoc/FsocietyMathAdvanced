import { readLocalStorageJson, writeLocalStorage } from "@/shared/lib/browserStorage";

const TOPIC_RESUME_KEY = "visualmath-topic-resume-v1";

export type TopicResumeEntry = {
  blockIndex: number;
  updatedAt: number;
};

type TopicResumeState = Record<string, TopicResumeEntry>;

function loadResumeState(): TopicResumeState {
  return readLocalStorageJson<TopicResumeState>(TOPIC_RESUME_KEY, {});
}

export function loadTopicResume(topicId: string): TopicResumeEntry | null {
  const entry = loadResumeState()[topicId];
  if (!entry || !Number.isInteger(entry.blockIndex) || entry.blockIndex < 0) {
    return null;
  }
  return entry;
}

export function saveTopicResume(topicId: string, blockIndex: number) {
  if (!Number.isInteger(blockIndex) || blockIndex < 0) return false;

  const state = loadResumeState();
  const next: TopicResumeState = {
    ...state,
    [topicId]: {
      blockIndex,
      updatedAt: Date.now(),
    },
  };

  return writeLocalStorage(TOPIC_RESUME_KEY, JSON.stringify(next));
}
