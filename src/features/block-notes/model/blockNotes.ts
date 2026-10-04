import { readLocalStorageJson, writeLocalStorage } from "@/shared/lib/browserStorage";

export const BLOCK_NOTES_KEY = "visualmath-block-notes-v1";
export const BLOCK_NOTES_PENDING_KEY = "visualmath-block-notes-pending-v1";
export const BLOCK_NOTES_EVENT = "visualmath:block-notes-change";

export type BlockNote = {
  text: string;
  updatedAt: number;
};

type BlockNotesState = Record<string, BlockNote>;

export type BlockNoteEntry = BlockNote & {
  id: string;
  topicId: string;
  blockIndex: number;
};

export type PendingBlockNoteMutation = {
  topicId: string;
  blockIndex: number;
  text: string | null;
  updatedAt: number;
};

export type BlockNotesEventDetail = {
  source: "local" | "hydrate";
  topicId?: string;
  blockIndex?: number;
};

type PendingBlockNotesState = Record<string, PendingBlockNoteMutation>;

export function blockNoteId(topicId: string, blockIndex: number) {
  return topicId + "::" + Math.max(0, Math.trunc(blockIndex));
}

export function loadBlockNotes(): BlockNotesState {
  return readLocalStorageJson<BlockNotesState>(BLOCK_NOTES_KEY, {});
}

export function loadBlockNote(topicId: string, blockIndex: number): BlockNote | null {
  const note = loadBlockNotes()[blockNoteId(topicId, blockIndex)];
  if (!note || typeof note.text !== "string" || !note.text.trim()) return null;
  return note;
}

export function loadBlockNoteEntries(): BlockNoteEntry[] {
  return Object.entries(loadBlockNotes()).flatMap(([id, note]) => {
    if (!note || typeof note.text !== "string" || !note.text.trim()) return [];
    const separator = id.lastIndexOf("::");
    if (separator <= 0) return [];

    const topicId = id.slice(0, separator);
    const blockIndex = Number(id.slice(separator + 2));
    if (!topicId || !Number.isInteger(blockIndex) || blockIndex < 0) return [];

    return [{
      id,
      topicId,
      blockIndex,
      text: note.text,
      updatedAt: Number.isFinite(note.updatedAt) ? note.updatedAt : 0,
    }];
  });
}

export function loadPendingBlockNoteMutations(): PendingBlockNotesState {
  return readLocalStorageJson<PendingBlockNotesState>(BLOCK_NOTES_PENDING_KEY, {});
}

function persistPendingBlockNoteMutation(mutation: PendingBlockNoteMutation) {
  const state = loadPendingBlockNoteMutations();
  return writeLocalStorage(
    BLOCK_NOTES_PENDING_KEY,
    JSON.stringify({
      ...state,
      [blockNoteId(mutation.topicId, mutation.blockIndex)]: mutation,
    }),
  );
}

export function clearPendingBlockNoteMutation(topicId: string, blockIndex: number) {
  const id = blockNoteId(topicId, blockIndex);
  const state = loadPendingBlockNoteMutations();
  if (!(id in state)) return true;
  const { [id]: _removed, ...next } = state;
  return writeLocalStorage(BLOCK_NOTES_PENDING_KEY, JSON.stringify(next));
}

function persistBlockNotes(
  state: BlockNotesState,
  detail: BlockNotesEventDetail,
) {
  const saved = writeLocalStorage(BLOCK_NOTES_KEY, JSON.stringify(state));
  if (saved && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<BlockNotesEventDetail>(BLOCK_NOTES_EVENT, {
      detail,
    }));
  }
  return saved;
}

export function hydrateBlockNotes(entries: BlockNoteEntry[]) {
  const state = Object.fromEntries(
    entries
      .filter(
        (entry) =>
          entry &&
          typeof entry.topicId === "string" &&
          Number.isInteger(entry.blockIndex) &&
          entry.blockIndex >= 0 &&
          typeof entry.text === "string" &&
          entry.text.trim(),
      )
      .map((entry) => [
        blockNoteId(entry.topicId, entry.blockIndex),
        {
          text: entry.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n"),
          updatedAt: Number.isFinite(entry.updatedAt) ? entry.updatedAt : 0,
        },
      ]),
  );
  return persistBlockNotes(state, { source: "hydrate" });
}

export function applyCanonicalBlockNote(entry: BlockNoteEntry | null, topicId?: string, blockIndex?: number) {
  const state = loadBlockNotes();
  const resolvedTopicId = entry?.topicId ?? topicId;
  const resolvedBlockIndex = entry?.blockIndex ?? blockIndex;
  if (!resolvedTopicId || resolvedBlockIndex === undefined) return false;
  const id = blockNoteId(resolvedTopicId, resolvedBlockIndex);

  if (!entry) {
    if (!(id in state)) return true;
    const { [id]: _removed, ...next } = state;
    return persistBlockNotes(next, {
      source: "hydrate",
      topicId: resolvedTopicId,
      blockIndex: resolvedBlockIndex,
    });
  }

  return persistBlockNotes(
    {
      ...state,
      [id]: {
        text: entry.text,
        updatedAt: entry.updatedAt,
      },
    },
    {
      source: "hydrate",
      topicId: resolvedTopicId,
      blockIndex: resolvedBlockIndex,
    },
  );
}

export function saveBlockNote(topicId: string, blockIndex: number, text: string) {
  const id = blockNoteId(topicId, blockIndex);
  const state = loadBlockNotes();
  const clean = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const updatedAt = Date.now();

  if (!clean.trim()) {
    if (!(id in state)) {
      persistPendingBlockNoteMutation({
        topicId,
        blockIndex,
        text: null,
        updatedAt,
      });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent<BlockNotesEventDetail>(BLOCK_NOTES_EVENT, {
          detail: { source: "local", topicId, blockIndex },
        }));
      }
      return true;
    }
    const { [id]: _removed, ...next } = state;
    const saved = persistBlockNotes(next, {
      source: "local",
      topicId,
      blockIndex,
    });
    if (saved) {
      persistPendingBlockNoteMutation({
        topicId,
        blockIndex,
        text: null,
        updatedAt,
      });
    }
    return saved;
  }

  const saved = persistBlockNotes(
    {
      ...state,
      [id]: {
        text: clean,
        updatedAt,
      },
    },
    { source: "local", topicId, blockIndex },
  );

  if (saved) {
    persistPendingBlockNoteMutation({
      topicId,
      blockIndex,
      text: clean,
      updatedAt,
    });
  }
  return saved;
}

export function deleteBlockNote(topicId: string, blockIndex: number) {
  return saveBlockNote(topicId, blockIndex, "");
}
