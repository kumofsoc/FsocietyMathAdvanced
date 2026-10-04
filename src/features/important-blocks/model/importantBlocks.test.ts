import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  importantBlockId,
  IMPORTANT_BLOCKS_KEY,
  IMPORTANT_BLOCKS_PENDING_KEY,
  isBlockImportant,
  loadImportantBlocks,
  setBlockImportant,
  toggleImportantBlock,
} from "./importantBlocks";

describe("important blocks", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    store = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
      removeItem: (key: string) => store.delete(key),
    });
  });

  afterEach(() => vi.unstubAllGlobals());

  const block = {
    topicId: "rank",
    blockIndex: 3,
    topicTitle: "Ранг матрицы",
    blockTitle: "Определение ранга",
    kind: "definition" as const,
  };

  it("uses stable block ids", () => {
    expect(importantBlockId("rank", 3)).toBe("rank::3");
  });

  it("marks and restores a block", () => {
    expect(setBlockImportant(block, true).saved).toBe(true);
    expect(isBlockImportant("rank", 3)).toBe(true);
    expect(loadImportantBlocks()[0]).toMatchObject(block);
  });

  it("toggles a mark off cleanly", () => {
    toggleImportantBlock(block);
    expect(toggleImportantBlock(block).important).toBe(false);
    expect(isBlockImportant("rank", 3)).toBe(false);
    expect(JSON.parse(localStorage.getItem(IMPORTANT_BLOCKS_KEY) ?? "[]")).toEqual([]);
  });

  it("rolls back optimistic state when the durable pending write fails", () => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key === IMPORTANT_BLOCKS_PENDING_KEY) throw new Error("quota");
        store.set(key, value);
      },
      removeItem: (key: string) => store.delete(key),
    });

    expect(setBlockImportant(block, true).saved).toBe(false);
    expect(isBlockImportant("rank", 3)).toBe(false);
  });

  it("deduplicates repeated ids from stored state", () => {
    const item = { ...block, id: "rank::3", updatedAt: 1 };
    localStorage.setItem(IMPORTANT_BLOCKS_KEY, JSON.stringify([item, item]));
    expect(loadImportantBlocks()).toHaveLength(1);
  });
});
