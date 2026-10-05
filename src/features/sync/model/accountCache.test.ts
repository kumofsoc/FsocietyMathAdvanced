import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ACCOUNT_CACHE_OWNER_KEY,
  clearVisibleAccountCacheIfOwned,
} from "./accountCache";
import {
  BLOCK_NOTES_KEY,
  BLOCK_NOTES_PENDING_KEY,
} from "@/features/block-notes/model/blockNotes";
import {
  IMPORTANT_BLOCKS_KEY,
  IMPORTANT_BLOCKS_PENDING_KEY,
} from "@/features/important-blocks/model/importantBlocks";
import {
  READING_PROGRESS_KEY,
  SAVED_THEOREMS_KEY,
  SOLVED_KEY,
  THEORY_KEY,
} from "@/features/learning/model/learning";
import { SAVED_TOPICS_KEY } from "@/features/saved-topics/model/savedTopics";
import { TOPIC_RESUME_KEY } from "@/features/learning/model/topicResume";
import {
  PREFERENCES_DIRTY_KEY,
  THEME_NAME_KEY,
} from "@/features/personalization/model/preferencesStorage";

const GENERAL_SYNC_PENDING_KEY = "visualmath-general-sync-pending-v1";

describe("account cache privacy boundary", () => {
  let values: Map<string, string>;

  beforeEach(() => {
    values = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, String(value)),
      removeItem: (key: string) => values.delete(key),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("clears visible account caches but preserves account-bound pending mutations", () => {
    localStorage.setItem(ACCOUNT_CACHE_OWNER_KEY, "user-1");
    localStorage.setItem(THEORY_KEY, JSON.stringify(["rank"]));
    localStorage.setItem(SOLVED_KEY, JSON.stringify(["rank-1"]));
    localStorage.setItem(SAVED_THEOREMS_KEY, JSON.stringify([{ id: "rank::0" }]));
    localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify({ rank: 0.8 }));
    localStorage.setItem(SAVED_TOPICS_KEY, JSON.stringify(["rank"]));
    localStorage.setItem(
      TOPIC_RESUME_KEY,
      JSON.stringify({ rank: { blockIndex: 3, updatedAt: 1 } }),
    );
    localStorage.setItem(
      BLOCK_NOTES_KEY,
      JSON.stringify({ "rank::0": { text: "private note", updatedAt: 1 } }),
    );
    localStorage.setItem(
      IMPORTANT_BLOCKS_KEY,
      JSON.stringify([{ id: "rank::0", topicId: "rank", blockIndex: 0 }]),
    );
    localStorage.setItem(THEME_NAME_KEY, "Nord");
    localStorage.setItem(PREFERENCES_DIRTY_KEY, "1");

    localStorage.setItem(
      GENERAL_SYNC_PENDING_KEY,
      JSON.stringify({ pending: { userId: "user-1" } }),
    );
    localStorage.setItem(
      BLOCK_NOTES_PENDING_KEY,
      JSON.stringify({ pending: { ownerId: "user-1" } }),
    );
    localStorage.setItem(
      IMPORTANT_BLOCKS_PENDING_KEY,
      JSON.stringify({ pending: { ownerId: "user-1" } }),
    );

    expect(clearVisibleAccountCacheIfOwned()).toBe(true);

    expect(localStorage.getItem(ACCOUNT_CACHE_OWNER_KEY)).toBeNull();
    expect(localStorage.getItem(THEORY_KEY)).toBe("[]");
    expect(localStorage.getItem(SOLVED_KEY)).toBe("[]");
    expect(localStorage.getItem(SAVED_THEOREMS_KEY)).toBe("[]");
    expect(localStorage.getItem(READING_PROGRESS_KEY)).toBe("{}");
    expect(localStorage.getItem(SAVED_TOPICS_KEY)).toBe("[]");
    expect(localStorage.getItem(TOPIC_RESUME_KEY)).toBe("{}");
    expect(localStorage.getItem(BLOCK_NOTES_KEY)).toBe("{}");
    expect(localStorage.getItem(IMPORTANT_BLOCKS_KEY)).toBe("[]");
    expect(localStorage.getItem(THEME_NAME_KEY)).toBe("Black");
    expect(localStorage.getItem(PREFERENCES_DIRTY_KEY)).toBe("0");

    expect(localStorage.getItem(GENERAL_SYNC_PENDING_KEY)).not.toBeNull();
    expect(localStorage.getItem(BLOCK_NOTES_PENDING_KEY)).not.toBeNull();
    expect(localStorage.getItem(IMPORTANT_BLOCKS_PENDING_KEY)).not.toBeNull();
  });

  it("does not erase anonymous caches when no account owns them", () => {
    localStorage.setItem(THEORY_KEY, JSON.stringify(["anonymous-topic"]));

    expect(clearVisibleAccountCacheIfOwned()).toBe(false);
    expect(localStorage.getItem(THEORY_KEY)).toBe(
      JSON.stringify(["anonymous-topic"]),
    );
  });
});
