import { useAuthStore } from "@/features/auth/model/authSession";
import { LEARNING_EVENT } from "@/features/learning/model/learning";
import { SAVED_TOPICS_EVENT } from "@/features/saved-topics/model/savedTopics";
import { TOPIC_RESUME_EVENT } from "@/features/learning/model/topicResume";
import { READING_WIDTH_EVENT } from "@/features/reading-width/model/readingWidth";
import { IMPORTANT_BLOCKS_EVENT } from "@/features/important-blocks/model/importantBlocks";
import {
  isUserStateSyncing,
  syncAuthenticatedUserState,
} from "@/features/sync/model/userStateSync";

let installed = false;
let timer: number | null = null;

function scheduleSync(delay = 1600) {
  if (isUserStateSyncing()) return;
  const state = useAuthStore.getState();
  if (state.status !== "authenticated" || !state.user) return;

  if (timer !== null) window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    timer = null;
    const latest = useAuthStore.getState();
    if (latest.status !== "authenticated" || !latest.user) return;
    void syncAuthenticatedUserState(latest.user.id).catch((error) => {
      console.warn("[VisualMath] background user-state sync failed", error);
    });
  }, delay);
}

export function installUserStateAutoSync() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  [
    LEARNING_EVENT,
    SAVED_TOPICS_EVENT,
    TOPIC_RESUME_EVENT,
    READING_WIDTH_EVENT,
    IMPORTANT_BLOCKS_EVENT,
  ].forEach((eventName) => window.addEventListener(eventName, () => scheduleSync()));

  window.addEventListener("online", () => scheduleSync(250));
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") scheduleSync(0);
  });
}
