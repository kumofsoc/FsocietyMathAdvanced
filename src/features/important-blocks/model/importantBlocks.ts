import { readLocalStorageJson, writeLocalStorage } from "@/shared/lib/browserStorage";
import type { BlockKind } from "@/entities/course/model/types";

export const IMPORTANT_BLOCKS_KEY = "visualmath-important-blocks-v1";
export const IMPORTANT_BLOCKS_EVENT = "visualmath:important-blocks-change";
export const IMPORTANT_BLOCKS_TOMBSTONES_KEY = "visualmath-important-block-tombstones-v1";

export type ImportantBlock = {
  id: string;
  topicId: string;
  blockIndex: number;
  topicTitle: string;
  blockTitle: string;
  kind: BlockKind;
  updatedAt: number;
};

export function importantBlockId(topicId: string, blockIndex: number) {
  return topicId + "::" + Math.max(0, Math.trunc(blockIndex));
}

export function loadImportantBlocks() {
  return readLocalStorageJson<ImportantBlock[]>(IMPORTANT_BLOCKS_KEY, [])
    .filter(
      (item, index, list) =>
        item &&
        typeof item.id === "string" &&
        typeof item.topicId === "string" &&
        Number.isInteger(item.blockIndex) &&
        item.blockIndex >= 0 &&
        list.findIndex((candidate) => candidate.id === item.id) === index,
    );
}

export function loadImportantBlockTombstones() {
  return readLocalStorageJson<Record<string, number>>(
    IMPORTANT_BLOCKS_TOMBSTONES_KEY,
    {},
  );
}

export function clearImportantBlockTombstone(id: string) {
  const current = loadImportantBlockTombstones();
  if (!(id in current)) return true;
  const { [id]: _removed, ...next } = current;
  return writeLocalStorage(IMPORTANT_BLOCKS_TOMBSTONES_KEY, JSON.stringify(next));
}

function markImportantBlockTombstone(id: string, updatedAt = Date.now()) {
  const current = loadImportantBlockTombstones();
  return writeLocalStorage(
    IMPORTANT_BLOCKS_TOMBSTONES_KEY,
    JSON.stringify({ ...current, [id]: updatedAt }),
  );
}

export function replaceImportantBlocks(items: ImportantBlock[]) {
  return persistImportantBlocks(items);
}

export function isBlockImportant(topicId: string, blockIndex: number) {
  const id = importantBlockId(topicId, blockIndex);
  return loadImportantBlocks().some((item) => item.id === id);
}

function persistImportantBlocks(items: ImportantBlock[]) {
  const saved = writeLocalStorage(IMPORTANT_BLOCKS_KEY, JSON.stringify(items));
  if (saved && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ImportantBlock[]>(IMPORTANT_BLOCKS_EVENT, {
        detail: items,
      }),
    );
  }
  return saved;
}

export function setBlockImportant(
  input: Omit<ImportantBlock, "id" | "updatedAt">,
  important: boolean,
) {
  const id = importantBlockId(input.topicId, input.blockIndex);
  const current = loadImportantBlocks();
  const withoutCurrent = current.filter((item) => item.id !== id);

  if (!important) {
    const tombstoned = markImportantBlockTombstone(id);
    return {
      saved: persistImportantBlocks(withoutCurrent) && tombstoned,
      important: false,
    };
  }

  clearImportantBlockTombstone(id);

  const next: ImportantBlock[] = [
    ...withoutCurrent,
    {
      ...input,
      id,
      updatedAt: Date.now(),
    },
  ];

  return {
    saved: persistImportantBlocks(next),
    important: true,
  };
}

export function toggleImportantBlock(
  input: Omit<ImportantBlock, "id" | "updatedAt">,
) {
  const important = !isBlockImportant(input.topicId, input.blockIndex);
  return setBlockImportant(input, important);
}
