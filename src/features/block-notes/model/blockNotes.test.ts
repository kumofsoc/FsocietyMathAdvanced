import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  blockNoteId,
  BLOCK_NOTES_KEY,
  BLOCK_NOTES_PENDING_KEY,
  deleteBlockNote,
  loadBlockNote,
  loadBlockNoteEntries,
  saveBlockNote,
} from "./blockNotes";

describe("block notes", () => {
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

  it("uses stable topic and block ids", () => {
    expect(blockNoteId("rank", 7)).toBe("rank::7");
  });

  it("persists and restores a note", () => {
    expect(saveBlockNote("rank", 2, "Проверить связь с минором")).toBe(true);
    expect(loadBlockNote("rank", 2)?.text).toBe("Проверить связь с минором");
  });

  it("removes empty notes instead of storing noise", () => {
    saveBlockNote("rank", 2, "note");
    expect(deleteBlockNote("rank", 2)).toBe(true);
    expect(loadBlockNote("rank", 2)).toBeNull();
    expect(JSON.parse(localStorage.getItem(BLOCK_NOTES_KEY) ?? "{}")).toEqual({});
  });

  it("rolls back optimistic state when the durable pending write fails", () => {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (key === BLOCK_NOTES_PENDING_KEY) throw new Error("quota");
        store.set(key, value);
      },
      removeItem: (key: string) => store.delete(key),
    });

    expect(saveBlockNote("rank", 9, "must stay durable")).toBe(false);
    expect(loadBlockNote("rank", 9)).toBeNull();
  });

  it("normalizes windows line endings", () => {
    saveBlockNote("rank", 1, "a\r\nb");
    expect(loadBlockNote("rank", 1)?.text).toBe("a\nb");
  });

  it("enumerates notes as stable block entries", () => {
    saveBlockNote("rank", 4, "Связать с базисом");
    expect(loadBlockNoteEntries()[0]).toMatchObject({
      id: "rank::4",
      topicId: "rank",
      blockIndex: 4,
      text: "Связать с базисом",
    });
  });
});
