import { useAuthStore } from "@/features/auth/model/authSession";
import {
  LEARNING_EVENT,
  SOLVED_KEY,
  THEORY_KEY,
  type LearningEventDetail,
} from "@/features/learning/model/learning";
import {
  SAVED_TOPICS_EVENT,
  type SavedTopicsEventDetail,
} from "@/features/saved-topics/model/savedTopics";
import {
  TOPIC_RESUME_EVENT,
  type TopicResumeEventDetail,
} from "@/features/learning/model/topicResume";
import {
  READING_WIDTH_EVENT,
  type ReadingWidthEventDetail,
} from "@/features/reading-width/model/readingWidth";
import {
  BLOCK_NOTES_EVENT,
  type BlockNotesEventDetail,
} from "@/features/block-notes/model/blockNotes";
import {
  IMPORTANT_BLOCKS_EVENT,
  type ImportantBlocksEventDetail,
} from "@/features/important-blocks/model/importantBlocks";
import {
  PREFERENCES_EVENT,
  loadLocalPreferences,
  type PreferencesEventDetail,
} from "@/features/personalization/model/preferencesStorage";
import { api } from "@/shared/api/client";
import {
  hydratePreferencesSnapshot,
  hydrateWorkspaceSnapshot,
  syncPendingBlockNotes,
  syncPendingImportantBlocks,
} from "@/features/sync/model/userStateSync";

let installed = false;
const timers = new Map<string, number>();
let mutationChain: Promise<void> = Promise.resolve();

function currentUserId() {
  const state = useAuthStore.getState();
  return state.status === "authenticated" ? state.user?.id ?? null : null;
}

function enqueue(label: string, work: () => Promise<void>) {
  mutationChain = mutationChain
    .then(work)
    .catch((error) => {
      console.warn("[VisualMath] " + label + " sync failed; local cache kept", error);
    });
  return mutationChain;
}

function schedule(key: string, work: () => Promise<void>, delay = 650) {
  const existing = timers.get(key);
  if (existing !== undefined) window.clearTimeout(existing);
  const timer = window.setTimeout(() => {
    timers.delete(key);
    void enqueue(key, work);
  }, delay);
  timers.set(key, timer);
}

async function syncSavedTheoremRemoval(contentBlockId: string) {
  const response = await api.bookmarks.list();
  const matches = response.bookmarks.filter(
    (bookmark) =>
      bookmark.kind === "theorem" &&
      bookmark.contentBlockId === contentBlockId,
  );
  if (matches.length) {
    for (const bookmark of matches) {
      await api.bookmarks.remove(bookmark.id);
    }
    return;
  }
  await api.progress.removeTheorem(contentBlockId);
}

async function syncLearningMutation(detail: LearningEventDetail) {
  if (detail.source !== "local") return;

  if (detail.kind === "reading-block") {
    await api.progress.markReadingBlock(detail.topicId, detail.blockIndex);
    await api.progress.setResume(detail.topicId);
    return;
  }

  if (detail.kind === "reading-progress") {
    await api.progress.patchTopic(detail.topicId, {
      readingRatio: detail.ratio,
    });
    return;
  }

  if (detail.kind === "theorems") {
    for (const theorem of detail.added) {
      await api.bookmarks.create({
        topicId: theorem.topicId,
        contentBlockId: theorem.id,
        kind: "theorem",
        title: theorem.title || theorem.id,
      });
    }
    for (const theorem of detail.removed) {
      await syncSavedTheoremRemoval(theorem.id);
    }
    return;
  }

  if (detail.kind === "set" && detail.key === THEORY_KEY) {
    for (const topicId of detail.added) {
      await api.progress.completeTheory(topicId);
    }
    for (const topicId of detail.removed) {
      await api.progress.uncompleteTheory(topicId);
    }
    return;
  }

  if (detail.kind === "set" && detail.key === SOLVED_KEY) {
    for (const taskId of detail.added) {
      await api.progress.solveExercise(taskId);
    }
    for (const taskId of detail.removed) {
      await api.progress.unsolveExercise(taskId);
    }
  }
}

function authenticatedEvent<T extends { source: "local" | "hydrate" }>(
  event: Event,
) {
  const detail = (event as CustomEvent<T>).detail;
  if (!detail || detail.source !== "local" || !currentUserId()) return null;
  return detail;
}

export function installUserStateAutoSync() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener(LEARNING_EVENT, (event) => {
    const detail = authenticatedEvent<LearningEventDetail>(event);
    if (!detail) return;
    enqueue("learning", () => syncLearningMutation(detail));
  });

  window.addEventListener(SAVED_TOPICS_EVENT, (event) => {
    const detail = authenticatedEvent<SavedTopicsEventDetail>(event);
    if (!detail?.topicId || detail.saved === undefined) return;
    enqueue("saved-topic", async () => {
      const workspace = await api.workspace.saveTopic(
        detail.topicId!,
        detail.saved!,
      );
      hydrateWorkspaceSnapshot(workspace);
    });
  });

  window.addEventListener(TOPIC_RESUME_EVENT, (event) => {
    const detail = authenticatedEvent<TopicResumeEventDetail>(event);
    if (!detail?.topicId || detail.blockIndex === undefined) return;
    schedule("resume:" + detail.topicId, async () => {
      const workspace = await api.workspace.setResume(
        detail.topicId!,
        detail.blockIndex!,
      );
      hydrateWorkspaceSnapshot(workspace);
      await api.progress.setResume(detail.topicId!);
    }, 900);
  });

  window.addEventListener(READING_WIDTH_EVENT, (event) => {
    const detail = authenticatedEvent<ReadingWidthEventDetail>(event);
    if (!detail) return;
    schedule("reading-width", async () => {
      const workspace = await api.workspace.setReadingWidth(detail.value);
      hydrateWorkspaceSnapshot(workspace);
    });
  });

  window.addEventListener(PREFERENCES_EVENT, (event) => {
    const detail = authenticatedEvent<PreferencesEventDetail>(event);
    if (!detail) return;
    schedule("preferences", async () => {
      const canonical = await api.preferences.replace(loadLocalPreferences());
      hydratePreferencesSnapshot(canonical);
    }, 800);
  });

  window.addEventListener(BLOCK_NOTES_EVENT, (event) => {
    const detail = authenticatedEvent<BlockNotesEventDetail>(event);
    const userId = currentUserId();
    if (!detail || !userId) return;
    schedule("block-notes", () => syncPendingBlockNotes(userId), 850);
  });

  window.addEventListener(IMPORTANT_BLOCKS_EVENT, (event) => {
    const detail = authenticatedEvent<ImportantBlocksEventDetail>(event);
    const userId = currentUserId();
    if (!detail || !userId) return;
    schedule(
      "important-blocks",
      () => syncPendingImportantBlocks(userId),
      350,
    );
  });

  window.addEventListener("online", () => {
    const userId = currentUserId();
    if (!userId) return;
    schedule("block-notes-online", () => syncPendingBlockNotes(userId), 100);
    schedule(
      "important-blocks-online",
      () => syncPendingImportantBlocks(userId),
      100,
    );
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") return;
    const userId = currentUserId();
    if (!userId) return;
    void enqueue("block-notes-hidden", () => syncPendingBlockNotes(userId));
    void enqueue(
      "important-blocks-hidden",
      () => syncPendingImportantBlocks(userId),
    );
  });
}
