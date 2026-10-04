import { api, isBackendConfigured } from "@/shared/api/client";
import type {
  BlockNoteDto,
  BookmarkDto,
  BootstrapDto,
  ImportantBlockDto,
  PreferencesDto,
  ProgressSyncRequest,
  WorkspaceDto,
} from "@/shared/api/types";
import type { BlockKind } from "@/entities/course/model/types";
import {
  readLocalStorage,
  readLocalStorageJson,
  removeLocalStorage,
  writeLocalStorage,
} from "@/shared/lib/browserStorage";
import {
  buildLocalProgressSyncPayload,
  hydrateCanonicalProgress,
} from "@/features/learning/model/progressSync";
import {
  loadReadingBlocks,
  loadSavedTheorems,
  replaceLearningCache,
  replaceReadingBlocks,
  type SavedTheorem,
} from "@/features/learning/model/learning";
import {
  loadSavedTopicIds,
  replaceSavedTopicIds,
} from "@/features/saved-topics/model/savedTopics";
import {
  loadTopicResumeState,
  replaceTopicResumeState,
  type TopicResumeEntry,
} from "@/features/learning/model/topicResume";
import {
  hydrateReadingWidth,
  loadReadingWidth,
  type ReadingWidth,
} from "@/features/reading-width/model/readingWidth";
import {
  applyCanonicalBlockNote,
  clearPendingBlockNoteMutation,
  hydrateBlockNotes,
  loadBlockNoteEntries,
  loadPendingBlockNoteMutations,
  type BlockNoteEntry,
} from "@/features/block-notes/model/blockNotes";
import {
  applyCanonicalImportantBlock,
  clearPendingImportantBlockMutation,
  hydrateImportantBlocks,
  loadImportantBlocks,
  loadPendingImportantBlockMutations,
  type ImportantBlock,
} from "@/features/important-blocks/model/importantBlocks";
import {
  clearLocalPreferencesDirty,
  hydrateLocalPreferences,
  isDefaultPreferences,
  loadLocalPreferences,
  localPreferencesAreDirty,
} from "@/features/personalization/model/preferencesStorage";
import { useAppShellStore } from "@/app/store/useAppShellStore";
import { useAuthStore } from "@/features/auth/model/authSession";

const MIGRATION_VERSION = 2;
const CORE_MIGRATION_PREFIX =
  "visualmath-backend-migration-v" + MIGRATION_VERSION + "::";
const NOTES_MIGRATION_PREFIX =
  "visualmath-notes-migration-v" + MIGRATION_VERSION + "::";
const IMPORTANT_MIGRATION_PREFIX =
  "visualmath-important-blocks-migration-v" + MIGRATION_VERSION + "::";
const MIGRATION_STAGE_PREFIX =
  "visualmath-backend-migration-stage-v" + MIGRATION_VERSION + "::";

export const ACCOUNT_CACHE_OWNER_KEY = "visualmath-account-cache-owner-v1";

const syncInFlightByUser = new Map<string, Promise<UserStateSyncResult>>();
let syncChain: Promise<void> = Promise.resolve();
let syncing = false;

class SyncSupersededError extends Error {
  constructor(userId: string) {
    super("Authenticated sync no longer belongs to " + userId);
    this.name = "SyncSupersededError";
  }
}

const EMPTY_SYNC_RESULT: UserStateSyncResult = {
  bootstrapHydrated: false,
  coreMigrated: false,
  notesMigrated: false,
  importantBlocksMigrated: false,
};

function assertSyncUser(userId: string) {
  const state = useAuthStore.getState();

  // Unit-level sync helpers can run before the auth store is bootstrapped.
  if (state.status === "booting" && !state.user) return;

  if (state.status !== "authenticated" || state.user?.id !== userId) {
    throw new SyncSupersededError(userId);
  }
}

async function forSyncUser<T>(userId: string, request: () => Promise<T>) {
  assertSyncUser(userId);
  const result = await request();
  assertSyncUser(userId);
  return result;
}

export type UserStateSyncResult = {
  bootstrapHydrated: boolean;
  coreMigrated: boolean;
  notesMigrated: boolean;
  importantBlocksMigrated: boolean;
};

type MigrationSeed = {
  progress: ProgressSyncRequest;
  readingBlocks: Array<{ topicId: string; blockIndex: number }>;
  savedTopicIds: string[];
  topicResume: Record<string, TopicResumeEntry>;
  readingWidth: ReadingWidth;
  preferences: PreferencesDto;
  preferencesDirty: boolean;
  savedTheorems: SavedTheorem[];
};

export type NoteConflictWinner = "local" | "remote";

export function isUserStateSyncing() {
  return syncing;
}

function key(prefix: string, userId: string) {
  return prefix + userId;
}

function migrationComplete(prefix: string, userId: string) {
  return readLocalStorage(key(prefix, userId)) === "1";
}

function markMigrationComplete(prefix: string, userId: string) {
  return writeLocalStorage(key(prefix, userId), "1");
}

export function isPristineWorkspace(workspace: WorkspaceDto) {
  return (
    workspace.savedTopicIds.length === 0 &&
    Object.keys(workspace.topicResume).length === 0 &&
    workspace.readingWidth === "normal"
  );
}

export function shouldMigrateAnonymousState(userId: string) {
  if (migrationComplete(CORE_MIGRATION_PREFIX, userId)) return false;
  const owner = readLocalStorage(ACCOUNT_CACHE_OWNER_KEY);
  return !owner || owner === userId;
}

export function resolveNoteConflict(
  local: Pick<BlockNoteEntry, "updatedAt">,
  remote: Pick<BlockNoteDto, "updatedAt">,
): NoteConflictWinner {
  return local.updatedAt > remote.updatedAt ? "local" : "remote";
}

export function planNoteMigration(
  local: BlockNoteEntry[],
  remote: BlockNoteDto[],
) {
  const remoteById = new Map(remote.map((item) => [item.id, item]));
  return local.filter((note) => {
    const serverNote = remoteById.get(note.id);
    return (
      !serverNote ||
      resolveNoteConflict(note, serverNote) === "local"
    );
  });
}

export function collectImportantMigrationTargets(
  local: ImportantBlock[],
  remote: ImportantBlockDto[],
  bookmarks: BookmarkDto[],
) {
  const remoteIds = new Set(remote.map((item) => item.id));
  const targets = new Map<string, { topicId: string; blockIndex: number }>();

  for (const item of local) {
    if (!remoteIds.has(item.id)) {
      targets.set(item.id, {
        topicId: item.topicId,
        blockIndex: item.blockIndex,
      });
    }
  }

  for (const bookmark of bookmarks) {
    if (!bookmark.kind.startsWith("important:")) continue;
    const address = parseContentBlockId(bookmark.contentBlockId);
    if (!address) continue;
    targets.set(
      address.topicId + "::" + String(address.blockIndex),
      address,
    );
  }

  return [...targets.values()];
}

export function parseContentBlockId(contentBlockId: string) {
  const separator = contentBlockId.lastIndexOf("::");
  if (separator <= 0) return null;
  const topicId = contentBlockId.slice(0, separator);
  const blockIndex = Number(contentBlockId.slice(separator + 2));
  if (!topicId || !Number.isInteger(blockIndex) || blockIndex < 0) return null;
  return { topicId, blockIndex };
}

function parseReadingBlockId(value: string) {
  return parseContentBlockId(value);
}

function captureMigrationSeed(userId: string): MigrationSeed {
  const stageKey = key(MIGRATION_STAGE_PREFIX, userId);
  const existing = readLocalStorageJson<MigrationSeed | null>(stageKey, null);
  if (existing) return existing;

  const seed: MigrationSeed = {
    progress: buildLocalProgressSyncPayload(),
    readingBlocks: [...loadReadingBlocks()]
      .map(parseReadingBlockId)
      .filter(
        (item): item is { topicId: string; blockIndex: number } => Boolean(item),
      ),
    savedTopicIds: loadSavedTopicIds(),
    topicResume: loadTopicResumeState(),
    readingWidth: loadReadingWidth(),
    preferences: loadLocalPreferences(),
    preferencesDirty: localPreferencesAreDirty(),
    savedTheorems: loadSavedTheorems(),
  };

  writeLocalStorage(stageKey, JSON.stringify(seed));
  return seed;
}

function toNoteEntry(item: BlockNoteDto): BlockNoteEntry {
  return {
    id: item.id,
    topicId: item.topicId,
    blockIndex: item.blockIndex,
    text: item.text,
    updatedAt: item.updatedAt,
  };
}

function toImportantBlock(item: ImportantBlockDto): ImportantBlock {
  return {
    id: item.id,
    topicId: item.topicId,
    blockIndex: item.blockIndex,
    topicTitle: item.topicTitle,
    blockTitle: item.blockTitle,
    kind: item.kind as BlockKind,
    updatedAt: item.updatedAt,
  };
}

async function listAllNotes(userId: string) {
  const notes: BlockNoteDto[] = [];
  let offset = 0;

  for (;;) {
    const page = await forSyncUser(userId, () => api.notes.list(100, offset));
    notes.push(...page.notes);
    if (!page.hasMore) return notes;
    offset += page.notes.length;
    if (!page.notes.length) return notes;
  }
}

export function hydrateWorkspaceSnapshot(workspace: WorkspaceDto) {
  replaceSavedTopicIds(workspace.savedTopicIds);
  replaceTopicResumeState(workspace.topicResume);
  hydrateReadingWidth(workspace.readingWidth);
}

export function hydratePreferencesSnapshot(preferences: PreferencesDto) {
  hydrateLocalPreferences(preferences);
  useAppShellStore.setState({
    sidebarCollapsed: preferences.sidebarCollapsed,
  });
}

export function hydrateBootstrapSnapshot(
  snapshot: BootstrapDto,
  bookmarks: BookmarkDto[] = [],
) {
  hydrateCanonicalProgress(snapshot.learning, bookmarks);
  replaceReadingBlocks(snapshot.learning.readingBlockIds ?? []);
  hydrateWorkspaceSnapshot(snapshot.workspace);
  hydratePreferencesSnapshot(snapshot.preferences);
}

function union<T>(a: T[], b: T[]) {
  return [...new Set([...a, ...b])];
}

function mergeReading(
  remote: Record<string, number>,
  local: Record<string, number> | undefined,
) {
  const result = { ...remote };
  for (const [topicId, ratio] of Object.entries(local ?? {})) {
    result[topicId] = Math.max(result[topicId] ?? 0, ratio);
  }
  return result;
}

function restoreMigrationSeedLocally(seed: MigrationSeed, snapshot: BootstrapDto) {
  const currentSaved = loadSavedTheorems();
  const savedById = new Map<string, SavedTheorem>();
  for (const item of [...currentSaved, ...seed.savedTheorems]) {
    savedById.set(item.id, item);
  }
  for (const id of snapshot.learning.savedTheoremIds) {
    if (!savedById.has(id)) {
      const topicId = id.split("::")[0] ?? "";
      savedById.set(id, {
        id,
        topicId,
        topicTitle: topicId,
        title: id,
        body: "",
      });
    }
  }

  replaceLearningCache({
    theoryRead: union(snapshot.learning.theoryRead, seed.progress.theoryRead),
    solvedTaskIds: union(
      snapshot.learning.solvedTaskIds,
      seed.progress.solvedTaskIds,
    ),
    savedTheorems: [...savedById.values()],
    readingProgress: mergeReading(
      snapshot.learning.readingProgress ?? snapshot.learning.reading,
      seed.progress.readingProgress ?? seed.progress.reading,
    ),
  });
  replaceReadingBlocks(
    union(
      snapshot.learning.readingBlockIds ?? [],
      seed.readingBlocks.map(
        (block) => block.topicId + "::" + String(block.blockIndex),
      ),
    ),
  );

  const savedTopicIds = union(
    snapshot.workspace.savedTopicIds,
    seed.savedTopicIds,
  );
  const topicResume = { ...snapshot.workspace.topicResume };
  for (const [topicId, local] of Object.entries(seed.topicResume)) {
    const remote = topicResume[topicId];
    if (!remote || local.updatedAt > remote.updatedAt) {
      topicResume[topicId] = local;
    }
  }
  replaceSavedTopicIds(savedTopicIds);
  replaceTopicResumeState(topicResume);
  hydrateReadingWidth(
    isPristineWorkspace(snapshot.workspace)
      ? seed.readingWidth
      : snapshot.workspace.readingWidth,
  );

  if (seed.preferencesDirty) {
    hydratePreferencesSnapshot(seed.preferences);
  }
}

async function createMissingTheoremBookmarks(
  userId: string,
  localTheorems: SavedTheorem[],
  bookmarks: BookmarkDto[],
) {
  const byKindAndContentId = new Map(
    bookmarks.map((item) => [item.kind + "::" + item.contentBlockId, item]),
  );

  for (const theorem of localTheorems) {
    const key = "theorem::" + theorem.id;
    if (!theorem.id || !theorem.topicId || byKindAndContentId.has(key)) continue;
    const created = await forSyncUser(userId, () =>
      api.bookmarks.create({
        topicId: theorem.topicId,
        contentBlockId: theorem.id,
        kind: "theorem",
        title: theorem.title || theorem.id,
      }),
    );
    bookmarks.push(created);
    byKindAndContentId.set(created.kind + "::" + created.contentBlockId, created);
  }
  return bookmarks;
}

async function migrateCore(
  userId: string,
  snapshot: BootstrapDto,
  seed: MigrationSeed,
) {
  let progress = await forSyncUser(userId, () => api.progress.sync(seed.progress));
  if (seed.readingBlocks.length) {
    progress = await forSyncUser(userId, () =>
      api.progress.syncReadingBlocks(seed.readingBlocks),
    );
  }

  let workspace = snapshot.workspace;
  const remoteWasPristine = isPristineWorkspace(snapshot.workspace);

  for (const topicId of seed.savedTopicIds) {
    if (!workspace.savedTopicIds.includes(topicId)) {
      workspace = await forSyncUser(userId, () =>
        api.workspace.saveTopic(topicId, true),
      );
    }
  }

  for (const [topicId, localEntry] of Object.entries(seed.topicResume)) {
    const remoteEntry = workspace.topicResume[topicId];
    if (!remoteEntry || localEntry.updatedAt > remoteEntry.updatedAt) {
      workspace = await forSyncUser(userId, () =>
        api.workspace.setResume(topicId, localEntry.blockIndex),
      );
    }
  }

  if (
    remoteWasPristine &&
    seed.readingWidth !== snapshot.workspace.readingWidth
  ) {
    workspace = await forSyncUser(userId, () =>
      api.workspace.setReadingWidth(seed.readingWidth),
    );
  }

  let preferences = snapshot.preferences;
  if (
    seed.preferencesDirty ||
    (isDefaultPreferences(preferences) &&
      !isDefaultPreferences(seed.preferences))
  ) {
    preferences = await forSyncUser(userId, () =>
      api.preferences.replace(seed.preferences),
    );
  }

  let bookmarks = (await forSyncUser(userId, () => api.bookmarks.list())).bookmarks;
  bookmarks = await createMissingTheoremBookmarks(userId, seed.savedTheorems, bookmarks);

  hydrateCanonicalProgress(progress, bookmarks);
  replaceReadingBlocks(progress.readingBlockIds ?? []);
  hydrateWorkspaceSnapshot(workspace);
  hydratePreferencesSnapshot(preferences);
  clearLocalPreferencesDirty();

  markMigrationComplete(CORE_MIGRATION_PREFIX, userId);
  writeLocalStorage(ACCOUNT_CACHE_OWNER_KEY, userId);
  removeLocalStorage(key(MIGRATION_STAGE_PREFIX, userId));
  return bookmarks;
}

async function hydrateOrdinaryCore(
  userId: string,
  snapshot: BootstrapDto,
  localPreferences: PreferencesDto,
  preferencesWereDirty: boolean,
) {
  let preferences = snapshot.preferences;

  if (preferencesWereDirty) {
    preferences = await forSyncUser(userId, () =>
      api.preferences.replace(localPreferences),
    );
    hydratePreferencesSnapshot(preferences);
  }

  let bookmarks: BookmarkDto[] = [];
  if (snapshot.learning.savedTheoremIds.length) {
    bookmarks = (await forSyncUser(userId, () => api.bookmarks.list())).bookmarks;
    hydrateCanonicalProgress(snapshot.learning, bookmarks);
  }

  writeLocalStorage(ACCOUNT_CACHE_OWNER_KEY, userId);
  return bookmarks;
}

function pendingBelongsToUser(
  ownerId: string | null | undefined,
  userId: string,
  allowAnonymous: boolean,
) {
  if (ownerId === userId) return true;
  return allowAnonymous && !ownerId;
}

export async function syncPendingBlockNotes(
  userId: string,
  allowAnonymous = false,
) {
  const pending = Object.values(loadPendingBlockNoteMutations())
    .filter((item) => pendingBelongsToUser(item.ownerId, userId, allowAnonymous))
    .sort((a, b) => a.updatedAt - b.updatedAt);

  for (const mutation of pending) {
    if (mutation.text === null) {
      await forSyncUser(userId, () =>
        api.notes.remove(mutation.topicId, mutation.blockIndex),
      );
      const latest = loadPendingBlockNoteMutations()[
        mutation.topicId + "::" + mutation.blockIndex
      ];
      if (latest?.updatedAt === mutation.updatedAt) {
        clearPendingBlockNoteMutation(mutation.topicId, mutation.blockIndex);
        applyCanonicalBlockNote(
          null,
          mutation.topicId,
          mutation.blockIndex,
        );
      }
      continue;
    }

    const canonical = await forSyncUser(userId, () =>
      api.notes.put(
        mutation.topicId,
        mutation.blockIndex,
        mutation.text,
      ),
    );
    const latest = loadPendingBlockNoteMutations()[
      mutation.topicId + "::" + mutation.blockIndex
    ];
    if (latest?.updatedAt === mutation.updatedAt) {
      clearPendingBlockNoteMutation(mutation.topicId, mutation.blockIndex);
      if (canonical) applyCanonicalBlockNote(toNoteEntry(canonical));
    }
  }
}

export async function syncPendingImportantBlocks(
  userId: string,
  allowAnonymous = false,
) {
  const pending = Object.values(loadPendingImportantBlockMutations())
    .filter((item) => pendingBelongsToUser(item.ownerId, userId, allowAnonymous))
    .sort((a, b) => a.updatedAt - b.updatedAt);

  for (const mutation of pending) {
    if (mutation.important) {
      const canonical = await forSyncUser(userId, () =>
        api.importantBlocks.put(
          mutation.topicId,
          mutation.blockIndex,
        ),
      );
      const latest = loadPendingImportantBlockMutations()[
        mutation.topicId + "::" + mutation.blockIndex
      ];
      if (latest?.updatedAt === mutation.updatedAt) {
        clearPendingImportantBlockMutation(
          mutation.topicId,
          mutation.blockIndex,
        );
        applyCanonicalImportantBlock(toImportantBlock(canonical));
      }
      continue;
    }

    await forSyncUser(userId, () =>
      api.importantBlocks.remove(
        mutation.topicId,
        mutation.blockIndex,
      ),
    );
    const latest = loadPendingImportantBlockMutations()[
      mutation.topicId + "::" + mutation.blockIndex
    ];
    if (latest?.updatedAt === mutation.updatedAt) {
      clearPendingImportantBlockMutation(
        mutation.topicId,
        mutation.blockIndex,
      );
      applyCanonicalImportantBlock(
        null,
        mutation.topicId,
        mutation.blockIndex,
      );
    }
  }
}

async function migrateNotes(userId: string, includeLocal: boolean) {
  if (migrationComplete(NOTES_MIGRATION_PREFIX, userId)) {
    await syncPendingBlockNotes(userId);
    const remote = await listAllNotes(userId);
    hydrateBlockNotes(remote.map(toNoteEntry));
    return false;
  }

  const local = includeLocal ? loadBlockNoteEntries() : [];
  const remote = await listAllNotes(userId);
  const canonical = new Map(remote.map((item) => [item.id, item]));

  const toUpload = new Set(planNoteMigration(local, remote).map((note) => note.id));
  for (const note of local) {
    if (toUpload.has(note.id)) {
      const saved = await forSyncUser(userId, () =>
        api.notes.put(
          note.topicId,
          note.blockIndex,
          note.text,
        ),
      );
      if (saved) canonical.set(saved.id, saved);
    }
    const latest = loadPendingBlockNoteMutations()[note.id];
    if (latest && latest.updatedAt <= note.updatedAt) {
      clearPendingBlockNoteMutation(note.topicId, note.blockIndex);
    }
  }

  await syncPendingBlockNotes(userId, includeLocal);
  const finalRemote = await listAllNotes(userId);
  hydrateBlockNotes(finalRemote.map(toNoteEntry));
  markMigrationComplete(NOTES_MIGRATION_PREFIX, userId);
  return includeLocal;
}

function isLegacyImportantBookmark(bookmark: BookmarkDto) {
  return bookmark.kind.startsWith("important:");
}

async function migrateImportantBlocks(
  userId: string,
  includeLocal: boolean,
  initialBookmarks: BookmarkDto[] | null,
) {
  if (migrationComplete(IMPORTANT_MIGRATION_PREFIX, userId)) {
    await syncPendingImportantBlocks(userId);
    const remote = await forSyncUser(userId, () => api.importantBlocks.list());
    hydrateImportantBlocks(remote.blocks.map(toImportantBlock));
    return false;
  }

  const local = includeLocal ? loadImportantBlocks() : [];
  const remote = await forSyncUser(userId, () => api.importantBlocks.list());
  const remoteIds = new Set(remote.blocks.map((item) => item.id));

  for (const item of local) {
    if (!remoteIds.has(item.id)) {
      const saved = await forSyncUser(userId, () =>
        api.importantBlocks.put(
          item.topicId,
          item.blockIndex,
        ),
      );
      remoteIds.add(saved.id);
    }
    const latest = loadPendingImportantBlockMutations()[item.id];
    if (latest && latest.updatedAt <= item.updatedAt) {
      clearPendingImportantBlockMutation(item.topicId, item.blockIndex);
    }
  }

  const bookmarks =
    initialBookmarks ??
    (await forSyncUser(userId, () => api.bookmarks.list())).bookmarks;
  for (const bookmark of bookmarks.filter(isLegacyImportantBookmark)) {
    const address = parseContentBlockId(bookmark.contentBlockId);
    if (!address) continue;

    await forSyncUser(userId, () =>
      api.importantBlocks.put(address.topicId, address.blockIndex),
    );
    await forSyncUser(userId, () => api.bookmarks.remove(bookmark.id));
  }

  await syncPendingImportantBlocks(userId, includeLocal);
  const canonical = await forSyncUser(userId, () => api.importantBlocks.list());
  hydrateImportantBlocks(canonical.blocks.map(toImportantBlock));
  markMigrationComplete(IMPORTANT_MIGRATION_PREFIX, userId);
  return includeLocal || bookmarks.some(isLegacyImportantBookmark);
}

async function performSync(
  userId: string,
  snapshot: BootstrapDto,
): Promise<UserStateSyncResult> {
  if (!isBackendConfigured()) {
    return {
      bootstrapHydrated: false,
      coreMigrated: false,
      notesMigrated: false,
      importantBlocksMigrated: false,
    };
  }

  assertSyncUser(userId);
  syncing = true;
  const previousOwner = readLocalStorage(ACCOUNT_CACHE_OWNER_KEY);
  const includeAnonymousLocal = shouldMigrateAnonymousState(userId);
  const localPreferences = loadLocalPreferences();
  const preferencesWereDirty =
    previousOwner === userId && localPreferencesAreDirty();
  const seed = includeAnonymousLocal
    ? captureMigrationSeed(userId)
    : null;

  hydrateBootstrapSnapshot(snapshot);

  let bookmarks: BookmarkDto[] | null = null;
  let coreMigrated = false;

  try {
    if (seed) {
      try {
        bookmarks = await migrateCore(userId, snapshot, seed);
        coreMigrated = true;
      } catch (error) {
        if (!(error instanceof SyncSupersededError)) {
          restoreMigrationSeedLocally(seed, snapshot);
        }
        throw error;
      }
    } else {
      bookmarks = await hydrateOrdinaryCore(
        userId,
        snapshot,
        localPreferences,
        preferencesWereDirty,
      );
      if (!migrationComplete(CORE_MIGRATION_PREFIX, userId)) {
        markMigrationComplete(CORE_MIGRATION_PREFIX, userId);
      }
    }

    assertSyncUser(userId);

    let notesMigrated = false;
    let importantBlocksMigrated = false;

    const includeNotesLocal =
      includeAnonymousLocal ||
      (!migrationComplete(NOTES_MIGRATION_PREFIX, userId) &&
        previousOwner === userId);
    const includeImportantLocal =
      includeAnonymousLocal ||
      (!migrationComplete(IMPORTANT_MIGRATION_PREFIX, userId) &&
        previousOwner === userId);

    const [notesResult, importantResult] = await Promise.allSettled([
      migrateNotes(userId, includeNotesLocal),
      migrateImportantBlocks(userId, includeImportantLocal, bookmarks),
    ]);

    if (notesResult.status === "fulfilled") {
      notesMigrated = notesResult.value;
    } else {
      console.warn("[VisualMath] block-note hydration/migration failed", notesResult.reason);
    }

    if (importantResult.status === "fulfilled") {
      importantBlocksMigrated = importantResult.value;
    } else {
      console.warn(
        "[VisualMath] important-block hydration/migration failed",
        importantResult.reason,
      );
    }

    assertSyncUser(userId);
    writeLocalStorage(ACCOUNT_CACHE_OWNER_KEY, userId);

    return {
      bootstrapHydrated: true,
      coreMigrated,
      notesMigrated,
      importantBlocksMigrated,
    };
  } finally {
    syncing = false;
  }
}

export function syncAuthenticatedUserState(
  userId: string,
  snapshot: BootstrapDto,
) {
  const existing = syncInFlightByUser.get(userId);
  if (existing) return existing;

  const run = syncChain
    .catch(() => undefined)
    .then(() => performSync(userId, snapshot))
    .catch((error) => {
      if (error instanceof SyncSupersededError) {
        return { ...EMPTY_SYNC_RESULT };
      }
      throw error;
    });

  let tracked!: Promise<UserStateSyncResult>;
  tracked = run.finally(() => {
    if (syncInFlightByUser.get(userId) === tracked) {
      syncInFlightByUser.delete(userId);
    }
  });

  syncInFlightByUser.set(userId, tracked);
  syncChain = tracked.then(
    () => undefined,
    () => undefined,
  );

  return tracked;
}
