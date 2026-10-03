import { readLocalStorageJson, writeLocalStorage } from "@/shared/lib/browserStorage";

export const BLOCK_NOTES_KEY = "visualmath-block-notes-v1";
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

function persistBlockNotes(state: BlockNotesState) {
  const saved = writeLocalStorage(BLOCK_NOTES_KEY, JSON.stringify(state));
  if (saved && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BLOCK_NOTES_EVENT));
  }
  return saved;
}

export function saveBlockNote(topicId: string, blockIndex: number, text: string) {
  const id = blockNoteId(topicId, blockIndex);
  const state = loadBlockNotes();
  const clean = text.replace(/\r\n/g, "\n");

  if (!clean.trim()) {
    if (!(id in state)) return true;
    const { [id]: _removed, ...next } = state;
    return persistBlockNotes(next);
  }

  return persistBlockNotes({
    ...state,
    [id]: {
      text: clean,
      updatedAt: Date.now(),
    },
  });
}

export function deleteBlockNote(topicId: string, blockIndex: number) {
  return saveBlockNote(topicId, blockIndex, "");
}
