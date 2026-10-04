import { readLocalStorageJson, writeLocalStorage } from "@/shared/lib/browserStorage";
import type { BlockKind } from "@/entities/course/model/types";

export const IMPORTANT_BLOCKS_KEY = "visualmath-important-blocks-v1";
export const IMPORTANT_BLOCKS_PENDING_KEY = "visualmath-important-blocks-pending-v1";
export const IMPORTANT_BLOCKS_EVENT = "visualmath:important-blocks-change";

export type ImportantBlock = {
  id: string;
  topicId: string;
  blockIndex: number;
  topicTitle: string;
  blockTitle: string;
  kind: BlockKind;
  updatedAt: number;
};

export type PendingImportantBlockMutation = {
  topicId: string;
  blockIndex: number;
  important: boolean;
  updatedAt: number;
};

export type ImportantBlocksEventDetail = {
  source: "local" | "hydrate";
  topicId?: string;
  blockIndex?: number;
};

type PendingImportantBlocksState = Record<string, PendingImportantBlockMutation>;

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

export function loadPendingImportantBlockMutations(): PendingImportantBlocksState {
  return readLocalStorageJson<PendingImportantBlocksState>(
    IMPORTANT_BLOCKS_PENDING_KEY,
    {},
  );
}

function persistPendingImportantBlockMutation(
  mutation: PendingImportantBlockMutation,
) {
  const state = loadPendingImportantBlockMutations();
  return writeLocalStorage(
    IMPORTANT_BLOCKS_PENDING_KEY,
    JSON.stringify({
      ...state,
      [importantBlockId(mutation.topicId, mutation.blockIndex)]: mutation,
    }),
  );
}

export function clearPendingImportantBlockMutation(
  topicId: string,
  blockIndex: number,
) {
  const id = importantBlockId(topicId, blockIndex);
  const state = loadPendingImportantBlockMutations();
  if (!(id in state)) return true;
  const { [id]: _removed, ...next } = state;
  return writeLocalStorage(IMPORTANT_BLOCKS_PENDING_KEY, JSON.stringify(next));
}

export function isBlockImportant(topicId: string, blockIndex: number) {
  const id = importantBlockId(topicId, blockIndex);
  return loadImportantBlocks().some((item) => item.id === id);
}

function persistImportantBlocks(
  items: ImportantBlock[],
  detail: ImportantBlocksEventDetail,
) {
  const saved = writeLocalStorage(IMPORTANT_BLOCKS_KEY, JSON.stringify(items));
  if (saved && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ImportantBlocksEventDetail>(IMPORTANT_BLOCKS_EVENT, {
        detail,
      }),
    );
  }
  return saved;
}

export function hydrateImportantBlocks(items: ImportantBlock[]) {
  const normalized = items.filter(
    (item, index, list) =>
      item &&
      typeof item.id === "string" &&
      typeof item.topicId === "string" &&
      Number.isInteger(item.blockIndex) &&
      item.blockIndex >= 0 &&
      list.findIndex((candidate) => candidate.id === item.id) === index,
  );
  return persistImportantBlocks(normalized, { source: "hydrate" });
}

export function setBlockImportant(
  input: Omit<ImportantBlock, "id" | "updatedAt">,
  important: boolean,
) {
  const id = importantBlockId(input.topicId, input.blockIndex);
  const current = loadImportantBlocks();
  const withoutCurrent = current.filter((item) => item.id !== id);
  const updatedAt = Date.now();

  if (!important) {
    const saved = persistImportantBlocks(withoutCurrent, {
      source: "local",
      topicId: input.topicId,
      blockIndex: input.blockIndex,
    });
    if (saved) {
      persistPendingImportantBlockMutation({
        topicId: input.topicId,
        blockIndex: input.blockIndex,
        important: false,
        updatedAt,
      });
    }
    return {
      saved,
      important: false,
    };
  }

  const next: ImportantBlock[] = [
    ...withoutCurrent,
    {
      ...input,
      id,
      updatedAt,
    },
  ];

  const saved = persistImportantBlocks(next, {
    source: "local",
    topicId: input.topicId,
    blockIndex: input.blockIndex,
  });
  if (saved) {
    persistPendingImportantBlockMutation({
      topicId: input.topicId,
      blockIndex: input.blockIndex,
      important: true,
      updatedAt,
    });
  }

  return {
    saved,
    important: true,
  };
}

export function toggleImportantBlock(
  input: Omit<ImportantBlock, "id" | "updatedAt">,
) {
  const important = !isBlockImportant(input.topicId, input.blockIndex);
  return setBlockImportant(input, important);
}
