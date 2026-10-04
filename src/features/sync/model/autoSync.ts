import { useAuthStore } from "@/features/auth/model/authSession";
import {
  LEARNING_EVENT,
  SOLVED_KEY,
  THEORY_KEY,
  type LearningEventDetail,
  type SavedTheorem,
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
  type ReadingWidth,
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
import type { PreferencesDto } from "@/shared/api/types";
import {
  readLocalStorageJson,
  writeLocalStorage,
} from "@/shared/lib/browserStorage";
import {
  hydratePreferencesSnapshot,
  hydrateWorkspaceSnapshot,
  syncPendingBlockNotes,
  syncPendingImportantBlocks,
} from "@/features/sync/model/userStateSync";

export const GENERAL_SYNC_PENDING_KEY = "visualmath-general-sync-pending-v1";

type PendingGeneralMutationBase = {
  userId: string;
  updatedAt: number;
};

type PendingGeneralMutation =
  | (PendingGeneralMutationBase & {
      kind: "reading-block";
      topicId: string;
      blockIndex: number;
    })
  | (PendingGeneralMutationBase & {
      kind: "reading-progress";
      topicId: string;
      ratio: number;
    })
  | (PendingGeneralMutationBase & {
      kind: "theorem";
      theorem: SavedTheorem;
      saved: boolean;
    })
  | (PendingGeneralMutationBase & {
      kind: "theory";
      topicId: string;
      complete: boolean;
    })
  | (PendingGeneralMutationBase & {
      kind: "exercise";
      exerciseId: string;
      solved: boolean;
    })
  | (PendingGeneralMutationBase & {
      kind: "saved-topic";
      topicId: string;
      saved: boolean;
    })
  | (PendingGeneralMutationBase & {
      kind: "topic-resume";
      topicId: string;
      blockIndex: number;
    })
  | (PendingGeneralMutationBase & {
      kind: "reading-width";
      value: ReadingWidth;
    })
  | (PendingGeneralMutationBase & {
      kind: "preferences";
      value: PreferencesDto;
    });

type PendingGeneralState = Record<string, PendingGeneralMutation>;

let installed = false;
const timers = new Map<string, number>();
let mutationChain: Promise<void> = Promise.resolve();
let mutationSequence = 0;

function currentUserId() {
  const state = useAuthStore.getState();
  return state.status === "authenticated" ? state.user?.id ?? null : null;
}

function nextMutationVersion() {
  mutationSequence = (mutationSequence + 1) % 1000;
  return Date.now() * 1000 + mutationSequence;
}

function loadPendingGeneralMutations() {
  return readLocalStorageJson<PendingGeneralState>(GENERAL_SYNC_PENDING_KEY, {});
}

function persistPendingGeneralMutation(
  storageKey: string,
  mutation: Omit<PendingGeneralMutation, "updatedAt">,
) {
  const state = loadPendingGeneralMutations();
  const fullMutation = {
    ...mutation,
    updatedAt: nextMutationVersion(),
  } as PendingGeneralMutation;
  const saved = writeLocalStorage(
    GENERAL_SYNC_PENDING_KEY,
    JSON.stringify({
      ...state,
      [storageKey]: fullMutation,
    }),
  );
  return saved ? fullMutation : null;
}

function clearPendingGeneralMutation(storageKey: string, updatedAt: number) {
  const state = loadPendingGeneralMutations();
  const current = state[storageKey];
  if (!current || current.updatedAt !== updatedAt) return false;
  const { [storageKey]: _removed, ...next } = state;
  return writeLocalStorage(GENERAL_SYNC_PENDING_KEY, JSON.stringify(next));
}

function enqueue(
  label: string,
  userId: string,
  work: () => Promise<void>,
) {
  mutationChain = mutationChain
    .then(async () => {
      if (currentUserId() !== userId) return;
      await work();
    })
    .catch((error) => {
      console.warn("[VisualMath] " + label + " sync failed; local cache kept", error);
    });
  return mutationChain;
}

function schedule(
  key: string,
  userId: string,
  work: () => Promise<void>,
  delay = 650,
) {
  const timerKey = userId + "::" + key;
  const existing = timers.get(timerKey);
  if (existing !== undefined) window.clearTimeout(existing);
  const timer = window.setTimeout(() => {
    timers.delete(timerKey);
    void enqueue(key, userId, work);
  }, delay);
  timers.set(timerKey, timer);
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

async function syncSavedTheorem(theorem: SavedTheorem) {
  const response = await api.bookmarks.list();
  const exists = response.bookmarks.some(
    (bookmark) =>
      bookmark.kind === "theorem" &&
      bookmark.contentBlockId === theorem.id,
  );
  if (exists) return;
  await api.bookmarks.create({
    topicId: theorem.topicId,
    contentBlockId: theorem.id,
    kind: "theorem",
    title: theorem.title || theorem.id,
  });
}

async function executeGeneralMutation(mutation: PendingGeneralMutation) {
  switch (mutation.kind) {
    case "reading-block":
      await api.progress.markReadingBlock(
        mutation.topicId,
        mutation.blockIndex,
      );
      await api.progress.setResume(mutation.topicId);
      return;

    case "reading-progress":
      await api.progress.patchTopic(mutation.topicId, {
        readingRatio: mutation.ratio,
      });
      return;

    case "theorem":
      if (mutation.saved) {
        await syncSavedTheorem(mutation.theorem);
      } else {
        await syncSavedTheoremRemoval(mutation.theorem.id);
      }
      return;

    case "theory":
      if (mutation.complete) {
        await api.progress.completeTheory(mutation.topicId);
      } else {
        await api.progress.uncompleteTheory(mutation.topicId);
      }
      return;

    case "exercise":
      if (mutation.solved) {
        await api.progress.solveExercise(mutation.exerciseId);
      } else {
        await api.progress.unsolveExercise(mutation.exerciseId);
      }
      return;

    case "saved-topic": {
      const workspace = await api.workspace.saveTopic(
        mutation.topicId,
        mutation.saved,
      );
      hydrateWorkspaceSnapshot(workspace);
      return;
    }

    case "topic-resume": {
      const workspace = await api.workspace.setResume(
        mutation.topicId,
        mutation.blockIndex,
      );
      hydrateWorkspaceSnapshot(workspace);
      await api.progress.setResume(mutation.topicId);
      return;
    }

    case "reading-width": {
      const workspace = await api.workspace.setReadingWidth(mutation.value);
      hydrateWorkspaceSnapshot(workspace);
      return;
    }

    case "preferences": {
      const canonical = await api.preferences.replace(mutation.value);
      hydratePreferencesSnapshot(canonical);
      return;
    }
  }
}

async function flushGeneralMutation(
  userId: string,
  storageKey: string,
) {
  if (currentUserId() !== userId) return;
  const mutation = loadPendingGeneralMutations()[storageKey];
  if (!mutation || mutation.userId !== userId) return;
  await executeGeneralMutation(mutation);
  clearPendingGeneralMutation(storageKey, mutation.updatedAt);
}

export async function flushPendingGeneralMutations(userId: string) {
  const pending = Object.entries(loadPendingGeneralMutations())
    .filter(([, mutation]) => mutation.userId === userId)
    .sort((a, b) => a[1].updatedAt - b[1].updatedAt);

  for (const [storageKey, mutation] of pending) {
    if (currentUserId() !== userId) return;
    try {
      await executeGeneralMutation(mutation);
      clearPendingGeneralMutation(storageKey, mutation.updatedAt);
    } catch (error) {
      console.warn(
        "[VisualMath] pending " + mutation.kind + " retry failed; keeping mutation",
        error,
      );
    }
  }
}

function queueMutation(
  userId: string,
  semanticKey: string,
  mutation: Omit<PendingGeneralMutation, "updatedAt" | "userId">,
  delay?: number,
) {
  const storageKey = userId + "::" + semanticKey;
  const persisted = persistPendingGeneralMutation(storageKey, {
    ...mutation,
    userId,
  } as Omit<PendingGeneralMutation, "updatedAt">);

  const sync = () => flushGeneralMutation(userId, storageKey);
  if (delay === undefined) {
    void enqueue("pending:" + semanticKey, userId, sync);
  } else {
    schedule("pending:" + semanticKey, userId, sync, delay);
  }

  if (!persisted) {
    console.warn(
      "[VisualMath] could not durably queue " + semanticKey + "; attempting immediate sync",
    );
  }
}

function queueLearningMutation(
  userId: string,
  detail: LearningEventDetail,
) {
  if (detail.source !== "local") return;

  if (detail.kind === "reading-block") {
    queueMutation(userId, "reading-block:" + detail.topicId + ":" + detail.blockIndex, {
      kind: "reading-block",
      topicId: detail.topicId,
      blockIndex: detail.blockIndex,
    });
    return;
  }

  if (detail.kind === "reading-progress") {
    queueMutation(userId, "reading-progress:" + detail.topicId, {
      kind: "reading-progress",
      topicId: detail.topicId,
      ratio: detail.ratio,
    });
    return;
  }

  if (detail.kind === "theorems") {
    for (const theorem of detail.added) {
      queueMutation(userId, "theorem:" + theorem.id, {
        kind: "theorem",
        theorem,
        saved: true,
      });
    }
    for (const theorem of detail.removed) {
      queueMutation(userId, "theorem:" + theorem.id, {
        kind: "theorem",
        theorem,
        saved: false,
      });
    }
    return;
  }

  if (detail.kind === "set" && detail.key === THEORY_KEY) {
    for (const topicId of detail.added) {
      queueMutation(userId, "theory:" + topicId, {
        kind: "theory",
        topicId,
        complete: true,
      });
    }
    for (const topicId of detail.removed) {
      queueMutation(userId, "theory:" + topicId, {
        kind: "theory",
        topicId,
        complete: false,
      });
    }
    return;
  }

  if (detail.kind === "set" && detail.key === SOLVED_KEY) {
    for (const exerciseId of detail.added) {
      queueMutation(userId, "exercise:" + exerciseId, {
        kind: "exercise",
        exerciseId,
        solved: true,
      });
    }
    for (const exerciseId of detail.removed) {
      queueMutation(userId, "exercise:" + exerciseId, {
        kind: "exercise",
        exerciseId,
        solved: false,
      });
    }
  }
}

function authenticatedEvent<T extends { source: "local" | "hydrate" }>(
  event: Event,
) {
  const detail = (event as CustomEvent<T>).detail;
  const userId = currentUserId();
  if (!detail || detail.source !== "local" || !userId) return null;
  return { detail, userId };
}

export function installUserStateAutoSync() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener(LEARNING_EVENT, (event) => {
    const authenticated = authenticatedEvent<LearningEventDetail>(event);
    if (!authenticated) return;
    queueLearningMutation(authenticated.userId, authenticated.detail);
  });

  window.addEventListener(SAVED_TOPICS_EVENT, (event) => {
    const authenticated = authenticatedEvent<SavedTopicsEventDetail>(event);
    const detail = authenticated?.detail;
    if (!authenticated || !detail?.topicId || detail.saved === undefined) return;
    queueMutation(authenticated.userId, "saved-topic:" + detail.topicId, {
      kind: "saved-topic",
      topicId: detail.topicId,
      saved: detail.saved,
    });
  });

  window.addEventListener(TOPIC_RESUME_EVENT, (event) => {
    const authenticated = authenticatedEvent<TopicResumeEventDetail>(event);
    const detail = authenticated?.detail;
    if (!authenticated || !detail?.topicId || detail.blockIndex === undefined) {
      return;
    }
    queueMutation(
      authenticated.userId,
      "resume:" + detail.topicId,
      {
        kind: "topic-resume",
        topicId: detail.topicId,
        blockIndex: detail.blockIndex,
      },
      900,
    );
  });

  window.addEventListener(READING_WIDTH_EVENT, (event) => {
    const authenticated = authenticatedEvent<ReadingWidthEventDetail>(event);
    if (!authenticated) return;
    queueMutation(
      authenticated.userId,
      "reading-width",
      {
        kind: "reading-width",
        value: authenticated.detail.value,
      },
      650,
    );
  });

  window.addEventListener(PREFERENCES_EVENT, (event) => {
    const authenticated = authenticatedEvent<PreferencesEventDetail>(event);
    if (!authenticated) return;
    queueMutation(
      authenticated.userId,
      "preferences",
      {
        kind: "preferences",
        value: loadLocalPreferences(),
      },
      800,
    );
  });

  window.addEventListener(BLOCK_NOTES_EVENT, (event) => {
    const authenticated = authenticatedEvent<BlockNotesEventDetail>(event);
    if (!authenticated) return;
    schedule(
      "block-notes",
      authenticated.userId,
      () => syncPendingBlockNotes(authenticated.userId),
      850,
    );
  });

  window.addEventListener(IMPORTANT_BLOCKS_EVENT, (event) => {
    const authenticated = authenticatedEvent<ImportantBlocksEventDetail>(event);
    if (!authenticated) return;
    schedule(
      "important-blocks",
      authenticated.userId,
      () => syncPendingImportantBlocks(authenticated.userId),
      350,
    );
  });

  window.addEventListener("online", () => {
    const userId = currentUserId();
    if (!userId) return;
    schedule(
      "general-online",
      userId,
      () => flushPendingGeneralMutations(userId),
      100,
    );
    schedule(
      "block-notes-online",
      userId,
      () => syncPendingBlockNotes(userId),
      100,
    );
    schedule(
      "important-blocks-online",
      userId,
      () => syncPendingImportantBlocks(userId),
      100,
    );
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") return;
    const userId = currentUserId();
    if (!userId) return;
    void enqueue(
      "general-hidden",
      userId,
      () => flushPendingGeneralMutations(userId),
    );
    void enqueue(
      "block-notes-hidden",
      userId,
      () => syncPendingBlockNotes(userId),
    );
    void enqueue(
      "important-blocks-hidden",
      userId,
      () => syncPendingImportantBlocks(userId),
    );
  });
}
