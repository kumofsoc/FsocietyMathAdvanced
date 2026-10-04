import { api, isBackendConfigured } from "@/shared/api/client";
import type { BookmarkDto, WorkspaceDto } from "@/shared/api/types";
import { readLocalStorage, writeLocalStorage } from "@/shared/lib/browserStorage";
import {
  hydrateCanonicalProgress,
  syncProgressToBackend,
} from "@/features/learning/model/progressSync";
import {
  loadSavedTopicIds,
  replaceSavedTopicIds,
} from "@/features/saved-topics/model/savedTopics";
import {
  loadTopicResumeState,
  replaceTopicResumeState,
} from "@/features/learning/model/topicResume";
import {
  loadReadingWidth,
  saveReadingWidth,
} from "@/features/reading-width/model/readingWidth";
import { loadSavedTheorems } from "@/features/learning/model/learning";
import {
  loadImportantBlocks,
  setBlockImportant,
} from "@/features/important-blocks/model/importantBlocks";

const MIGRATION_VERSION = 1;
const MIGRATION_PREFIX = "visualmath-backend-migration-v" + MIGRATION_VERSION + "::";

let syncInFlight: Promise<UserStateSyncResult> | null = null;
let syncing = false;

export type UserStateSyncResult = {
  progressSynced: boolean;
  workspaceSynced: boolean;
  bookmarksSynced: boolean;
  migratedAnonymousState: boolean;
};

export function isUserStateSyncing() {
  return syncing;
}

function migrationKey(userId: string) {
  return MIGRATION_PREFIX + userId;
}

function isPristineWorkspace(workspace: WorkspaceDto) {
  return (
    workspace.savedTopicIds.length === 0 &&
    Object.keys(workspace.topicResume).length === 0 &&
    workspace.readingWidth === "normal"
  );
}

function parseContentBlockId(contentBlockId: string) {
  const separator = contentBlockId.lastIndexOf("::");
  if (separator <= 0) return null;
  const topicId = contentBlockId.slice(0, separator);
  const blockIndex = Number(contentBlockId.slice(separator + 2));
  if (!topicId || !Number.isInteger(blockIndex) || blockIndex < 0) return null;
  return { topicId, blockIndex };
}

async function syncWorkspace(userId: string) {
  const localSaved = loadSavedTopicIds();
  const localResume = loadTopicResumeState();
  const localWidth = loadReadingWidth();
  const migrated = readLocalStorage(migrationKey(userId)) === "1";

  let remote = await api.workspace.get();
  const remoteWasPristine = isPristineWorkspace(remote);

  const missingSaved = localSaved.filter(
    (topicId) => !remote.savedTopicIds.includes(topicId),
  );
  for (const topicId of missingSaved) {
    remote = await api.workspace.saveTopic(topicId, true);
  }

  for (const [topicId, localEntry] of Object.entries(localResume)) {
    const remoteEntry = remote.topicResume[topicId];
    if (!remoteEntry || localEntry.updatedAt > remoteEntry.updatedAt) {
      remote = await api.workspace.setResume(topicId, localEntry.blockIndex);
    }
  }

  if (!migrated && remoteWasPristine && localWidth !== remote.readingWidth) {
    remote = await api.workspace.setReadingWidth(localWidth);
  }

  replaceSavedTopicIds(remote.savedTopicIds);
  replaceTopicResumeState(remote.topicResume);
  saveReadingWidth(remote.readingWidth);
  writeLocalStorage(migrationKey(userId), "1");

  return {
    workspace: remote,
    migratedAnonymousState: !migrated,
  };
}

async function createLocalBookmarks() {
  for (const theorem of loadSavedTheorems()) {
    if (!theorem.topicId || !theorem.id) continue;
    await api.bookmarks.create({
      topicId: theorem.topicId,
      contentBlockId: theorem.id,
      kind: "theorem",
      title: theorem.title || theorem.id,
    });
  }

  for (const item of loadImportantBlocks()) {
    await api.bookmarks.create({
      topicId: item.topicId,
      contentBlockId: item.id,
      kind: "important:" + item.kind,
      title: item.blockTitle,
    });
  }
}

function hydrateImportantBookmarks(bookmarks: BookmarkDto[]) {
  for (const bookmark of bookmarks) {
    if (!bookmark.kind.startsWith("important:")) continue;
    const parsed = parseContentBlockId(bookmark.contentBlockId);
    if (!parsed) continue;

    setBlockImportant(
      {
        topicId: parsed.topicId,
        blockIndex: parsed.blockIndex,
        topicTitle: bookmark.topicId ?? parsed.topicId,
        blockTitle: bookmark.title,
        kind: bookmark.kind.slice("important:".length) as Parameters<
          typeof setBlockImportant
        >[0]["kind"],
      },
      true,
    );
  }
}

async function syncBookmarks() {
  await createLocalBookmarks();
  const response = await api.bookmarks.list();
  hydrateImportantBookmarks(response.bookmarks);
  return response.bookmarks;
}

async function performSync(userId: string): Promise<UserStateSyncResult> {
  if (!isBackendConfigured()) {
    return {
      progressSynced: false,
      workspaceSynced: false,
      bookmarksSynced: false,
      migratedAnonymousState: false,
    };
  }

  syncing = true;
  try {
    const progress = await syncProgressToBackend();
    const workspace = await syncWorkspace(userId);
    const bookmarks = await syncBookmarks();

    if (progress) {
      const canonical = await api.progress.get();
      hydrateCanonicalProgress(canonical, bookmarks);
    }

    return {
      progressSynced: Boolean(progress),
      workspaceSynced: true,
      bookmarksSynced: true,
      migratedAnonymousState: workspace.migratedAnonymousState,
    };
  } finally {
    syncing = false;
  }
}

export function syncAuthenticatedUserState(userId: string) {
  if (syncInFlight) return syncInFlight;
  syncInFlight = performSync(userId).finally(() => {
    syncInFlight = null;
  });
  return syncInFlight;
}
