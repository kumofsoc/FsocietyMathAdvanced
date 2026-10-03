import { create } from "zustand";
import { getAccessTokenSnapshot, isBackendConfigured, api } from "@/shared/api/client";
import { LEARNING_EVENT } from "@/features/learning/model/learning";
import { syncProgressToBackend } from "@/features/learning/model/progressSync";
import {
  SAVED_TOPICS_EVENT,
  loadSavedTopicIds,
  replaceSavedTopicIds,
} from "@/features/saved-topics/model/savedTopics";
import {
  TOPIC_RESUME_EVENT,
  loadTopicResumeState,
  replaceTopicResumeState,
} from "@/features/learning/model/topicResume";
import {
  READING_WIDTH_EVENT,
  loadReadingWidth,
  saveReadingWidth,
} from "@/features/reading-width/model/readingWidth";
import {
  PREFERENCES_EVENT,
  hydrateLocalPreferences,
  isDefaultPreferences,
  loadLocalPreferences,
  localPreferencesAreDirty,
} from "@/features/personalization/model/preferencesStorage";
import { useAppShellStore } from "@/app/store/useAppShellStore";

type SyncStatus = "idle" | "syncing" | "synced" | "error";

type SyncState = {
  status: SyncStatus;
  lastSyncedAt: number | null;
  error: string | null;
};

export const useUserDataSyncStore = create<SyncState>(() => ({
  status: "idle",
  lastSyncedAt: null,
  error: null,
}));

let syncInFlight: Promise<void> | null = null;
let syncQueued = false;
let syncTimer: number | null = null;
let hydrating = false;
let listenersInstalled = false;

function authenticated() {
  return Boolean(getAccessTokenSnapshot().accessToken);
}

async function syncWorkspace() {
  let remote = await api.workspace.get();
  const localSaved = loadSavedTopicIds();

  for (const topicId of localSaved) {
    if (!remote.savedTopicIds.includes(topicId)) {
      remote = await api.workspace.saveTopic(topicId, true);
    }
  }

  const localResume = loadTopicResumeState();
  for (const [topicId, localEntry] of Object.entries(localResume)) {
    const remoteEntry = remote.topicResume[topicId];
    if (!remoteEntry || localEntry.updatedAt > remoteEntry.updatedAt) {
      remote = await api.workspace.setResume(topicId, localEntry.blockIndex);
    }
  }

  const localReadingWidth = loadReadingWidth();
  if (remote.readingWidth === "normal" && localReadingWidth !== "normal") {
    remote = await api.workspace.setReadingWidth(localReadingWidth);
  }

  hydrating = true;
  try {
    replaceSavedTopicIds(remote.savedTopicIds);
    replaceTopicResumeState(remote.topicResume);
    saveReadingWidth(remote.readingWidth);
  } finally {
    hydrating = false;
  }
}

async function syncPreferences() {
  const local = loadLocalPreferences();
  let remote = await api.preferences.get();

  if (
    localPreferencesAreDirty() ||
    (isDefaultPreferences(remote) && !isDefaultPreferences(local))
  ) {
    remote = await api.preferences.replace(local);
  }

  hydrating = true;
  try {
    hydrateLocalPreferences(remote);
    useAppShellStore.setState({
      sidebarCollapsed: remote.sidebarCollapsed,
    });
  } finally {
    hydrating = false;
  }
}

async function runSync() {
  if (!isBackendConfigured() || !authenticated()) return;

  useUserDataSyncStore.setState({ status: "syncing", error: null });
  try {
    hydrating = true;
    try {
      await syncProgressToBackend();
    } finally {
      hydrating = false;
    }

    await syncWorkspace();
    await syncPreferences();
    useUserDataSyncStore.setState({
      status: "synced",
      lastSyncedAt: Date.now(),
      error: null,
    });
  } catch (error) {
    useUserDataSyncStore.setState({
      status: "error",
      error: error instanceof Error ? error.message : "User data sync failed.",
    });
    throw error;
  }
}

export function syncAuthenticatedUserData() {
  if (!isBackendConfigured() || !authenticated()) return Promise.resolve();
  if (syncInFlight) {
    syncQueued = true;
    return syncInFlight;
  }

  syncInFlight = runSync()
    .catch((error) => {
      console.warn("[VisualMath] user data sync failed", error);
    })
    .finally(async () => {
      syncInFlight = null;
      if (syncQueued) {
        syncQueued = false;
        await syncAuthenticatedUserData();
      }
    });

  return syncInFlight;
}

export function scheduleAuthenticatedUserDataSync(delay = 700) {
  if (hydrating || !authenticated()) return;
  if (syncTimer !== null) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void syncAuthenticatedUserData();
  }, delay);
}

export function installUserDataSyncListeners() {
  if (listenersInstalled || typeof window === "undefined") return;
  listenersInstalled = true;

  const onChange = () => {
    if (!hydrating) scheduleAuthenticatedUserDataSync();
  };

  window.addEventListener(LEARNING_EVENT, onChange);
  window.addEventListener(SAVED_TOPICS_EVENT, onChange);
  window.addEventListener(TOPIC_RESUME_EVENT, onChange);
  window.addEventListener(READING_WIDTH_EVENT, onChange);
  window.addEventListener(PREFERENCES_EVENT, onChange);
}
