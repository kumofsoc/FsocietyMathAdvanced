import { api, isBackendConfigured } from "@/shared/api/client";
import type {
  BookmarkDto,
  ImportantBlockDto,
  NoteDto,
  WorkspaceDto,
} from "@/shared/api/types";
import type { BlockKind } from "@/entities/course/model/types";
import { readLocalStorage, writeLocalStorage } from "@/shared/lib/browserStorage";
import {
  hydrateCanonicalProgress,
  syncProgressToBackend,
} from "@/features/learning/model/progressSync";
import {
  clearLearningMutation,
  loadLearningMutations,
  loadReadingBlocks,
  loadSavedTheorems,
} from "@/features/learning/model/learning";
import {
  loadSavedTopicIds,
  replaceSavedTopicIds,
  savedTopicsAreDirty,
} from "@/features/saved-topics/model/savedTopics";
import {
  loadTopicResumeState,
  replaceTopicResumeState,
} from "@/features/learning/model/topicResume";
import {
  hydrateReadingWidth,
  loadReadingWidth,
  readingWidthIsDirty,
} from "@/features/reading-width/model/readingWidth";
import {
  clearBlockNoteTombstone,
  loadBlockNoteEntries,
  loadBlockNoteTombstones,
  replaceBlockNoteEntries,
  type BlockNoteEntry,
} from "@/features/block-notes/model/blockNotes";
import {
  clearImportantBlockTombstone,
  loadImportantBlocks,
  loadImportantBlockTombstones,
  replaceImportantBlocks,
  type ImportantBlock,
} from "@/features/important-blocks/model/importantBlocks";
import {
  hydrateLocalPreferences,
  isDefaultPreferences,
  loadLocalPreferences,
  localPreferencesAreDirty,
} from "@/features/personalization/model/preferencesStorage";
import { useAppShellStore } from "@/app/store/useAppShellStore";

const MIGRATION_VERSION = 2;
const MIGRATION_PREFIX =
  "visualmath-backend-migration-v" + MIGRATION_VERSION + "::";
const PREFERENCES_MIGRATION_PREFIX = "visualmath-preferences-migration-v1::";

let syncInFlight: Promise<UserStateSyncResult> | null = null;
let syncing = false;

const blockKinds = new Set<BlockKind>([
  "definition",
  "concepts",
  "property",
  "theorem",
  "proof",
  "corollary",
  "formula",
  "example",
  "solution",
  "note",
  "algorithm",
  "geometry",
  "summary",
]);

export type UserStateSyncResult = {
  progressSynced: boolean;
  readingBlocksSynced: boolean;
  workspaceSynced: boolean;
  bookmarksSynced: boolean;
  learningMutationsSynced: boolean;
  notesSynced: boolean;
  importantBlocksSynced: boolean;
  preferencesSynced: boolean;
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

function toBlockKind(value: string): BlockKind {
  return blockKinds.has(value as BlockKind) ? (value as BlockKind) : "note";
}

async function syncWorkspace(userId: string) {
  const localSaved = loadSavedTopicIds();
  const localResume = loadTopicResumeState();
  const localWidth = loadReadingWidth();
  const migrated = readLocalStorage(migrationKey(userId)) === "1";

  let remote = await api.workspace.get();
  const remoteWasPristine = isPristineWorkspace(remote);
  const reconcileSavedTopics =
    savedTopicsAreDirty() || (!migrated && remoteWasPristine);

  if (reconcileSavedTopics) {
    const localSet = new Set(localSaved);
    const remoteSet = new Set(remote.savedTopicIds);

    for (const topicId of localSet) {
      if (!remoteSet.has(topicId)) {
        remote = await api.workspace.saveTopic(topicId, true);
      }
    }
    for (const topicId of remoteSet) {
      if (!localSet.has(topicId)) {
        remote = await api.workspace.saveTopic(topicId, false);
      }
    }
  }

  for (const [topicId, localEntry] of Object.entries(localResume)) {
    const remoteEntry = remote.topicResume[topicId];
    if (!remoteEntry || localEntry.updatedAt > remoteEntry.updatedAt) {
      remote = await api.workspace.setResume(topicId, localEntry.blockIndex);
    }
  }

  const shouldPushReadingWidth =
    readingWidthIsDirty() || (!migrated && remoteWasPristine);
  if (shouldPushReadingWidth && localWidth !== remote.readingWidth) {
    remote = await api.workspace.setReadingWidth(localWidth);
  }

  replaceSavedTopicIds(remote.savedTopicIds);
  replaceTopicResumeState(remote.topicResume);
  hydrateReadingWidth(remote.readingWidth);
  writeLocalStorage(migrationKey(userId), "1");

  return {
    workspace: remote,
    migratedAnonymousState: !migrated,
  };
}

async function syncReadingBlocks() {
  const refs = [...loadReadingBlocks()].flatMap((id) => {
    const parsed = parseContentBlockId(id);
    return parsed ? [parsed] : [];
  });
  if (!refs.length) return null;
  return api.progress.syncReadingBlocks(refs);
}

async function syncLearningMutations() {
  const queue = loadLearningMutations();

  for (const [topicId, completed] of Object.entries(queue.theory)) {
    await api.progress.setTheory(topicId, completed);
    clearLearningMutation("theory", topicId);
  }

  for (const [taskId, solved] of Object.entries(queue.solved)) {
    await api.progress.setExercise(taskId, solved);
    clearLearningMutation("solved", taskId);
  }

  for (const [theoremId, mutation] of Object.entries(queue.theorems)) {
    await api.progress.setTheorem(
      theoremId,
      mutation.topicId,
      mutation.saved,
    );
    clearLearningMutation("theorems", theoremId);
  }

  return true;
}

async function createLocalTheoremBookmarks() {
  for (const theorem of loadSavedTheorems()) {
    if (!theorem.topicId || !theorem.id) continue;
    await api.bookmarks.create({
      topicId: theorem.topicId,
      contentBlockId: theorem.id,
      kind: "theorem",
      title: theorem.title || theorem.id,
    });
  }
}

async function syncBookmarks() {
  await createLocalTheoremBookmarks();
  return (await api.bookmarks.list()).bookmarks;
}

async function listAllRemoteNotes() {
  const out: NoteDto[] = [];
  let offset = 0;
  while (true) {
    const page = await api.notes.list(100, offset);
    out.push(...page.notes);
    if (!page.hasMore) return out;
    offset += page.notes.length;
    if (!page.notes.length) return out;
  }
}

function noteEntry(item: NoteDto): BlockNoteEntry {
  return {
    id: item.id,
    topicId: item.topicId,
    blockIndex: item.blockIndex,
    text: item.text,
    updatedAt: item.updatedAt,
  };
}

async function syncNotes() {
  const local = new Map(loadBlockNoteEntries().map((item) => [item.id, item]));
  const tombstones = loadBlockNoteTombstones();
  let remote = await listAllRemoteNotes();
  let remoteById = new Map(remote.map((item) => [item.id, item]));

  for (const [id, deletedAt] of Object.entries(tombstones)) {
    const item = remoteById.get(id);
    const parsed = parseContentBlockId(id);
    if (!parsed) {
      clearBlockNoteTombstone(id);
      continue;
    }
    if (!item || deletedAt >= item.updatedAt) {
      if (item) await api.notes.remove(parsed.topicId, parsed.blockIndex);
      clearBlockNoteTombstone(id);
    } else {
      clearBlockNoteTombstone(id);
    }
  }

  for (const item of local.values()) {
    const server = remoteById.get(item.id);
    if (!server || item.updatedAt > server.updatedAt) {
      await api.notes.put(item.topicId, item.blockIndex, item.text);
    }
  }

  remote = await listAllRemoteNotes();
  remoteById = new Map(remote.map((item) => [item.id, item]));

  const canonical = new Map<string, BlockNoteEntry>();
  for (const item of remote) canonical.set(item.id, noteEntry(item));
  for (const item of local.values()) {
    const server = remoteById.get(item.id);
    if (!server || item.updatedAt > server.updatedAt) {
      canonical.set(item.id, item);
    }
  }
  replaceBlockNoteEntries([...canonical.values()]);
  return [...canonical.values()];
}

function importantEntry(item: ImportantBlockDto): ImportantBlock {
  return {
    id: item.id,
    topicId: item.topicId,
    blockIndex: item.blockIndex,
    topicTitle: item.topicTitle,
    blockTitle: item.blockTitle,
    kind: toBlockKind(item.kind),
    updatedAt: item.updatedAt,
  };
}

async function syncImportantBlocks() {
  const local = new Map(loadImportantBlocks().map((item) => [item.id, item]));
  const tombstones = loadImportantBlockTombstones();
  let remote = (await api.importantBlocks.list()).blocks;
  let remoteById = new Map(remote.map((item) => [item.id, item]));

  for (const [id, deletedAt] of Object.entries(tombstones)) {
    const item = remoteById.get(id);
    const parsed = parseContentBlockId(id);
    if (!parsed) {
      clearImportantBlockTombstone(id);
      continue;
    }
    if (!item || deletedAt >= item.updatedAt) {
      if (item) {
        await api.importantBlocks.remove(parsed.topicId, parsed.blockIndex);
      }
      clearImportantBlockTombstone(id);
    } else {
      clearImportantBlockTombstone(id);
    }
  }

  for (const item of local.values()) {
    const server = remoteById.get(item.id);
    if (!server || item.updatedAt > server.updatedAt) {
      await api.importantBlocks.put(item.topicId, item.blockIndex);
    }
  }

  remote = (await api.importantBlocks.list()).blocks;
  remoteById = new Map(remote.map((item) => [item.id, item]));

  const canonical = new Map<string, ImportantBlock>();
  for (const item of remote) canonical.set(item.id, importantEntry(item));
  for (const item of local.values()) {
    const server = remoteById.get(item.id);
    if (!server || item.updatedAt > server.updatedAt) {
      canonical.set(item.id, item);
    }
  }
  replaceImportantBlocks([...canonical.values()]);
  return [...canonical.values()];
}

async function syncPreferences(userId: string) {
  const key = PREFERENCES_MIGRATION_PREFIX + userId;
  const migrated = readLocalStorage(key) === "1";
  const local = loadLocalPreferences();
  let remote = await api.preferences.get();

  if (
    localPreferencesAreDirty() ||
    (!migrated && isDefaultPreferences(remote))
  ) {
    remote = await api.preferences.replace(local);
  }

  hydrateLocalPreferences(remote);
  useAppShellStore.getState().setSidebarCollapsed(remote.sidebarCollapsed);
  writeLocalStorage(key, "1");
  return remote;
}

async function performSync(userId: string): Promise<UserStateSyncResult> {
  if (!isBackendConfigured()) {
    return {
      progressSynced: false,
      readingBlocksSynced: false,
      workspaceSynced: false,
      bookmarksSynced: false,
      learningMutationsSynced: false,
      notesSynced: false,
      importantBlocksSynced: false,
      preferencesSynced: false,
      migratedAnonymousState: false,
    };
  }

  syncing = true;
  try {
    const progress = await syncProgressToBackend();
    await syncLearningMutations();
    const readingSnapshot = await syncReadingBlocks();
    const workspace = await syncWorkspace(userId);
    const bookmarks = await syncBookmarks();
    await syncNotes();
    await syncImportantBlocks();
    await syncPreferences(userId);

    if (progress || readingSnapshot) {
      const canonical = await api.progress.get();
      hydrateCanonicalProgress(canonical, bookmarks);
    }

    return {
      progressSynced: Boolean(progress),
      readingBlocksSynced: Boolean(readingSnapshot),
      workspaceSynced: true,
      bookmarksSynced: true,
      learningMutationsSynced: true,
      notesSynced: true,
      importantBlocksSynced: true,
      preferencesSynced: true,
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
