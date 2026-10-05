import {
  READING_BLOCKS_KEY,
  READING_PROGRESS_KEY,
  SAVED_THEOREMS_KEY,
  SOLVED_KEY,
  THEORY_KEY,
} from "@/features/learning/model/learning";
import { LAST_TOPIC_KEY } from "@/features/learning/model/progressSync";
import {
  TOPIC_RESUME_KEY,
  replaceTopicResumeState,
} from "@/features/learning/model/topicResume";
import {
  READING_WIDTH_KEY,
  hydrateReadingWidth,
} from "@/features/reading-width/model/readingWidth";
import {
  SAVED_TOPICS_KEY,
  replaceSavedTopicIds,
} from "@/features/saved-topics/model/savedTopics";
import {
  BLOCK_NOTES_KEY,
  hydrateBlockNotes,
} from "@/features/block-notes/model/blockNotes";
import {
  IMPORTANT_BLOCKS_KEY,
  hydrateImportantBlocks,
} from "@/features/important-blocks/model/importantBlocks";
import {
  CURSOR_KEY,
  DEFAULT_PREFERENCES,
  MOTION_KEY,
  PREFERENCES_DIRTY_KEY,
  SIDEBAR_COLLAPSED_KEY,
  THEME_CUSTOM_KEY,
  THEME_NAME_KEY,
  hydrateLocalPreferences,
} from "@/features/personalization/model/preferencesStorage";
import { useAppShellStore } from "@/app/store/useAppShellStore";
import {
  readLocalStorage,
  readLocalStorageJson,
  removeLocalStorage,
  writeLocalStorage,
} from "@/shared/lib/browserStorage";

export const ACCOUNT_CACHE_OWNER_KEY = "visualmath-account-cache-owner-v1";

const visibleAccountKeys = [
  THEORY_KEY,
  SOLVED_KEY,
  SAVED_THEOREMS_KEY,
  READING_PROGRESS_KEY,
  READING_BLOCKS_KEY,
  SAVED_TOPICS_KEY,
  TOPIC_RESUME_KEY,
  READING_WIDTH_KEY,
  BLOCK_NOTES_KEY,
  IMPORTANT_BLOCKS_KEY,
  THEME_NAME_KEY,
  THEME_CUSTOM_KEY,
  CURSOR_KEY,
  MOTION_KEY,
  SIDEBAR_COLLAPSED_KEY,
  PREFERENCES_DIRTY_KEY,
  LAST_TOPIC_KEY,
] as const;

export function clearVisibleAccountCacheIfOwned() {
  const ownerId = readLocalStorage(ACCOUNT_CACHE_OWNER_KEY);
  if (!ownerId) return false;

  // Remove the raw values first so no stale account data survives if one of the
  // hydration helpers cannot persist in a constrained browser environment.
  for (const key of visibleAccountKeys) {
    removeLocalStorage(key);
  }
  removeLocalStorage(ACCOUNT_CACHE_OWNER_KEY);

  // Rehydrate anonymous defaults through the normal feature boundaries so the
  // mounted UI updates immediately without producing authenticated write-back.
  replaceSavedTopicIds([]);
  replaceTopicResumeState({});
  hydrateReadingWidth("normal");
  hydrateBlockNotes([]);
  hydrateImportantBlocks([]);
  hydrateLocalPreferences(DEFAULT_PREFERENCES);

  try {
    localStorage.setItem(THEORY_KEY, "[]");
    localStorage.setItem(SOLVED_KEY, "[]");
    localStorage.setItem(SAVED_THEOREMS_KEY, "[]");
    localStorage.setItem(READING_PROGRESS_KEY, "{}");
    localStorage.setItem(READING_BLOCKS_KEY, "[]");
    localStorage.removeItem(LAST_TOPIC_KEY);
  } catch {
    // Anonymous mode can still operate in-memory when storage is unavailable.
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("fsociety-learning-change", {
        detail: { source: "hydrate", kind: "snapshot" },
      }),
    );
  }

  useAppShellStore.setState({
    sidebarOpen: false,
    sidebarCollapsed: DEFAULT_PREFERENCES.sidebarCollapsed,
    readingFocusMode: false,
    sidebarTopicToc: null,
    activeSidebarTopicTocKey: null,
  });

  return true;
}


const GENERAL_SYNC_PENDING_KEY = "visualmath-general-sync-pending-v1";
const deletionScopedPrefixes = [
  "visualmath-backend-migration-v2::",
  "visualmath-notes-migration-v2::",
  "visualmath-important-blocks-migration-v2::",
  "visualmath-backend-migration-stage-v2::",
  "visualmath-media-imported-v1::",
] as const;

function removePendingOwnedBy(
  key: string,
  ownerField: "userId" | "ownerId",
  userId: string,
) {
  const state = readLocalStorageJson<Record<string, Record<string, unknown>>>(
    key,
    {},
  );
  const next = Object.fromEntries(
    Object.entries(state).filter(([, value]) => value?.[ownerField] !== userId),
  );
  return writeLocalStorage(key, JSON.stringify(next));
}

export function clearDeletedAccountState(userId: string) {
  if (!userId) return false;

  const visibleCleared = clearVisibleAccountCacheIfOwned();

  removePendingOwnedBy(GENERAL_SYNC_PENDING_KEY, "userId", userId);
  removePendingOwnedBy("visualmath-block-notes-pending-v1", "ownerId", userId);
  removePendingOwnedBy("visualmath-important-blocks-pending-v1", "ownerId", userId);

  for (const prefix of deletionScopedPrefixes) {
    removeLocalStorage(prefix + userId);
  }

  return visibleCleared;
}
