import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/client";
import type { BootstrapDto } from "@/shared/api/types";
import { DEFAULT_PREFERENCES } from "@/features/personalization/model/preferencesStorage";
import { useAuthStore } from "@/features/auth/model/authSession";
import {
  BLOCK_NOTES_PENDING_KEY,
  loadBlockNote,
  loadPendingBlockNoteMutations,
  saveBlockNote,
} from "@/features/block-notes/model/blockNotes";
import {
  loadImportantBlocks,
  loadPendingImportantBlockMutations,
  setBlockImportant,
} from "@/features/important-blocks/model/importantBlocks";
vi.mock("@/shared/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/api/client")>();
  return {
    ...actual,
    isBackendConfigured: () => true,
  };
});

import {
  ACCOUNT_CACHE_OWNER_KEY,
  collectImportantMigrationTargets,
  hydrateBootstrapSnapshot,
  planNoteMigration,
  resolveNoteConflict,
  shouldMigrateAnonymousState,
  syncAuthenticatedUserState,
  syncPendingBlockNotes,
  syncPendingImportantBlocks,
} from "./userStateSync";

describe("authenticated user state policy", () => {
  let store: Map<string, string>;

  beforeEach(() => {
    useAuthStore.setState({
      status: "booting",
      user: null,
      error: null,
    });
    store = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("hydrates bootstrap canonical state without extra resource reads", () => {
    const snapshot: BootstrapDto = {
      version: 1,
      generatedAt: "2026-10-04T07:00:00Z",
      user: {
        id: "user-1",
        email: "user@example.com",
        profile: {
          displayName: "User",
          handle: "user",
          bio: "",
          avatarUrl: null,
          joinedAt: "2026-10-04T07:00:00Z",
          updatedAt: "2026-10-04T07:00:00Z",
        },
      },
      preferences: {
        ...DEFAULT_PREFERENCES,
        themeName: "Nord",
        sidebarCollapsed: true,
      },
      workspace: {
        savedTopicIds: ["matrices"],
        topicResume: {
          matrices: { blockIndex: 3, updatedAt: 1791097200000 },
        },
        readingWidth: "wide",
      },
      learning: {
        revision: 4,
        theoryRead: ["matrices"],
        solvedTaskIds: ["mat-001"],
        savedTheoremIds: [],
        reading: { matrices: 0.5 },
        readingProgress: { matrices: 0.5 },
        readingBlockIds: ["matrices::0"],
        lastTopicId: "matrices",
        updatedAt: "2026-10-04T07:00:00Z",
      },
      capabilities: { mediaAudio: false },
    };

    hydrateBootstrapSnapshot(snapshot);

    expect(JSON.parse(localStorage.getItem("visualmath-saved-topics-v1") ?? "[]"))
      .toEqual(["matrices"]);
    expect(localStorage.getItem("visualmath-reading-width-v1")).toBe("wide");
    expect(JSON.parse(localStorage.getItem("fsociety-theory-read-v2") ?? "[]"))
      .toEqual(["matrices"]);
    expect(JSON.parse(localStorage.getItem("visualmath-reading-blocks-v1") ?? "[]"))
      .toEqual(["matrices::0"]);
    expect(localStorage.getItem("math-theme-name")).toBe("Nord");
  });

  it("migrates anonymous local state once, but never into a different account cache", () => {
    expect(shouldMigrateAnonymousState("user-1")).toBe(true);

    localStorage.setItem(ACCOUNT_CACHE_OWNER_KEY, "user-2");
    expect(shouldMigrateAnonymousState("user-1")).toBe(false);

    localStorage.setItem(ACCOUNT_CACHE_OWNER_KEY, "user-1");
    localStorage.setItem("visualmath-backend-migration-v2::user-1", "1");
    expect(shouldMigrateAnonymousState("user-1")).toBe(false);
  });

  it("resolves note conflicts by updatedAt and uploads only missing/newer local notes", () => {
    const local = [
      {
        id: "rank::1",
        topicId: "rank",
        blockIndex: 1,
        text: "new local",
        updatedAt: 20,
      },
      {
        id: "rank::2",
        topicId: "rank",
        blockIndex: 2,
        text: "old local",
        updatedAt: 10,
      },
      {
        id: "rank::3",
        topicId: "rank",
        blockIndex: 3,
        text: "local only",
        updatedAt: 15,
      },
    ];
    const remote = [
      {
        id: "rank::1",
        topicId: "rank",
        blockIndex: 1,
        text: "old remote",
        updatedAt: 10,
      },
      {
        id: "rank::2",
        topicId: "rank",
        blockIndex: 2,
        text: "new remote",
        updatedAt: 30,
      },
    ];

    expect(resolveNoteConflict(local[0], remote[0])).toBe("local");
    expect(resolveNoteConflict(local[1], remote[1])).toBe("remote");
    expect(planNoteMigration(local, remote).map((item) => item.id)).toEqual([
      "rank::1",
      "rank::3",
    ]);
  });

  it("keeps a note pending when network write-through fails", async () => {
    saveBlockNote("rank", 4, "Не потерять");
    vi.spyOn(api.notes, "put").mockRejectedValue(new Error("offline"));

    await expect(syncPendingBlockNotes("user-1", true)).rejects.toThrow("offline");

    expect(loadBlockNote("rank", 4)?.text).toBe("Не потерять");
    expect(Object.keys(loadPendingBlockNoteMutations())).toEqual(["rank::4"]);
    expect(localStorage.getItem(BLOCK_NOTES_PENDING_KEY)).toContain("Не потерять");
  });

  it("replaces optimistic note timestamp with canonical response after successful sync", async () => {
    saveBlockNote("rank", 4, "Canonical");
    vi.spyOn(api.notes, "put").mockResolvedValue({
      id: "rank::4",
      topicId: "rank",
      blockIndex: 4,
      text: "Canonical",
      updatedAt: 777,
    });

    await syncPendingBlockNotes("user-1", true);

    expect(loadPendingBlockNoteMutations()).toEqual({});
    expect(loadBlockNote("rank", 4)).toEqual({
      text: "Canonical",
      updatedAt: 777,
    });
  });

  it("plans important-block migration idempotently and includes legacy bookmarks", () => {
    const local = [
      {
        id: "rank::2",
        topicId: "rank",
        blockIndex: 2,
        topicTitle: "Ранг",
        blockTitle: "Пример",
        kind: "example" as const,
        updatedAt: 10,
      },
      {
        id: "rank::3",
        topicId: "rank",
        blockIndex: 3,
        topicTitle: "Ранг",
        blockTitle: "Теорема",
        kind: "theorem" as const,
        updatedAt: 11,
      },
    ];
    const remote = [
      {
        id: "rank::2",
        topicId: "rank",
        blockIndex: 2,
        topicTitle: "Ранг",
        blockTitle: "Пример",
        kind: "example",
        updatedAt: 9,
      },
    ];
    const bookmarks = [
      {
        id: "legacy-1",
        topicId: "rank",
        contentBlockId: "rank::4",
        kind: "important:formula",
        title: "Формула",
        createdAt: "2026-10-03T00:00:00Z",
        updatedAt: "2026-10-03T00:00:00Z",
      },
    ];

    expect(
      collectImportantMigrationTargets(local, remote, bookmarks),
    ).toEqual([
      { topicId: "rank", blockIndex: 3 },
      { topicId: "rank", blockIndex: 4 },
    ]);

    expect(
      collectImportantMigrationTargets(
        local.slice(0, 1),
        remote,
        [],
      ),
    ).toEqual([]);
  });

  it("syncs Important through dedicated API and clears its pending mutation", async () => {
    setBlockImportant(
      {
        topicId: "rank",
        blockIndex: 2,
        topicTitle: "Ранг матрицы",
        blockTitle: "Пример",
        kind: "example",
      },
      true,
    );
    vi.spyOn(api.importantBlocks, "put").mockResolvedValue({
      id: "rank::2",
      topicId: "rank",
      blockIndex: 2,
      topicTitle: "Ранг матрицы",
      blockTitle: "Пример",
      kind: "example",
      updatedAt: 900,
    });

    await syncPendingImportantBlocks("user-1", true);

    expect(loadPendingImportantBlockMutations()).toEqual({});
    expect(loadImportantBlocks()[0]?.updatedAt).toBe(900);
  });
  it("retries note migration after core migration already completed", async () => {
    const snapshot: BootstrapDto = {
      version: 1,
      generatedAt: "2026-10-04T08:00:00Z",
      user: {
        id: "user-1",
        email: "user-1@example.com",
        profile: {
          displayName: "User 1",
          handle: "user_1",
          bio: "",
          avatarUrl: null,
          joinedAt: "2026-10-04T08:00:00Z",
          updatedAt: "2026-10-04T08:00:00Z",
        },
      },
      preferences: DEFAULT_PREFERENCES,
      workspace: {
        savedTopicIds: [],
        topicResume: {},
        readingWidth: "normal",
      },
      learning: {
        revision: 1,
        theoryRead: [],
        solvedTaskIds: [],
        savedTheoremIds: [],
        reading: {},
        readingProgress: {},
        readingBlockIds: [],
        lastTopicId: null,
        updatedAt: "2026-10-04T08:00:00Z",
      },
      capabilities: { mediaAudio: false },
    };

    localStorage.setItem(ACCOUNT_CACHE_OWNER_KEY, "user-1");
    localStorage.setItem("visualmath-backend-migration-v2::user-1", "1");
    localStorage.setItem(
      "visualmath-important-blocks-migration-v2::user-1",
      "1",
    );
    saveBlockNote("rank", 1, "retained after partial migration");

    const canonical = {
      id: "rank::1",
      topicId: "rank",
      blockIndex: 1,
      text: "retained after partial migration",
      updatedAt: 999,
    };
    const notesList = vi.spyOn(api.notes, "list");
    notesList
      .mockResolvedValueOnce({
        notes: [],
        limit: 100,
        offset: 0,
        hasMore: false,
      })
      .mockResolvedValueOnce({
        notes: [canonical],
        limit: 100,
        offset: 0,
        hasMore: false,
      });
    const put = vi.spyOn(api.notes, "put").mockResolvedValue(canonical);
    vi.spyOn(api.importantBlocks, "list").mockResolvedValue({ blocks: [] });

    await syncAuthenticatedUserState("user-1", snapshot);

    expect(put).toHaveBeenCalledWith(
      "rank",
      1,
      "retained after partial migration",
    );
    expect(
      localStorage.getItem("visualmath-notes-migration-v2::user-1"),
    ).toBe("1");
    expect(loadBlockNote("rank", 1)?.text).toBe(
      "retained after partial migration",
    );
  });

  it("stops stale sync when authenticated account changes during an await", async () => {
    const makeSnapshot = (userId: string, savedTopicId: string): BootstrapDto => ({
      version: 1,
      generatedAt: "2026-10-04T08:00:00Z",
      user: {
        id: userId,
        email: userId + "@example.com",
        profile: {
          displayName: userId,
          handle: userId,
          bio: "",
          avatarUrl: null,
          joinedAt: "2026-10-04T08:00:00Z",
          updatedAt: "2026-10-04T08:00:00Z",
        },
      },
      preferences: DEFAULT_PREFERENCES,
      workspace: {
        savedTopicIds: [savedTopicId],
        topicResume: {},
        readingWidth: "normal",
      },
      learning: {
        revision: 1,
        theoryRead: [],
        solvedTaskIds: [],
        savedTheoremIds: [],
        reading: {},
        readingProgress: {},
        readingBlockIds: [],
        lastTopicId: null,
        updatedAt: "2026-10-04T08:00:00Z",
      },
      capabilities: { mediaAudio: false },
    });

    for (const userId of ["user-1", "user-2"]) {
      localStorage.setItem("visualmath-backend-migration-v2::" + userId, "1");
      localStorage.setItem("visualmath-notes-migration-v2::" + userId, "1");
      localStorage.setItem(
        "visualmath-important-blocks-migration-v2::" + userId,
        "1",
      );
    }
    localStorage.setItem(ACCOUNT_CACHE_OWNER_KEY, "user-1");

    const firstSnapshot = makeSnapshot("user-1", "matrices");
    const secondSnapshot = makeSnapshot("user-2", "rank");
    useAuthStore.setState({
      status: "authenticated",
      user: firstSnapshot.user,
    });

    let firstStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      firstStarted = resolve;
    });
    let releaseFirst!: () => void;
    const gate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    const observedUsers: string[] = [];

    vi.spyOn(api.notes, "list").mockImplementation(async () => {
      observedUsers.push(useAuthStore.getState().user?.id ?? "none");
      if (observedUsers.length === 1) {
        firstStarted();
        await gate;
      }
      return { notes: [], limit: 100, offset: 0, hasMore: false };
    });
    vi.spyOn(api.importantBlocks, "list").mockImplementation(async () => ({
      blocks: [],
    }));

    const first = syncAuthenticatedUserState("user-1", firstSnapshot);
    await started;

    useAuthStore.setState({
      status: "authenticated",
      user: secondSnapshot.user,
    });
    const second = syncAuthenticatedUserState("user-2", secondSnapshot);
    releaseFirst();

    const [firstResult, secondResult] = await Promise.all([first, second]);

    expect(firstResult.bootstrapHydrated).toBe(false);
    expect(secondResult.bootstrapHydrated).toBe(true);
    expect(observedUsers).toEqual(["user-1", "user-2"]);
    expect(localStorage.getItem(ACCOUNT_CACHE_OWNER_KEY)).toBe("user-2");
    expect(
      JSON.parse(localStorage.getItem("visualmath-saved-topics-v1") ?? "[]"),
    ).toEqual(["rank"]);
  });

  it("serializes overlapping account hydration instead of dropping the second account", async () => {
    const makeSnapshot = (userId: string, savedTopicId: string): BootstrapDto => ({
      version: 1,
      generatedAt: "2026-10-04T08:00:00Z",
      user: {
        id: userId,
        email: userId + "@example.com",
        profile: {
          displayName: userId,
          handle: userId,
          bio: "",
          avatarUrl: null,
          joinedAt: "2026-10-04T08:00:00Z",
          updatedAt: "2026-10-04T08:00:00Z",
        },
      },
      preferences: DEFAULT_PREFERENCES,
      workspace: {
        savedTopicIds: [savedTopicId],
        topicResume: {},
        readingWidth: "normal",
      },
      learning: {
        revision: 1,
        theoryRead: [],
        solvedTaskIds: [],
        savedTheoremIds: [],
        reading: {},
        readingProgress: {},
        readingBlockIds: [],
        lastTopicId: null,
        updatedAt: "2026-10-04T08:00:00Z",
      },
      capabilities: { mediaAudio: false },
    });

    for (const userId of ["user-1", "user-2"]) {
      localStorage.setItem("visualmath-backend-migration-v2::" + userId, "1");
      localStorage.setItem("visualmath-notes-migration-v2::" + userId, "1");
      localStorage.setItem(
        "visualmath-important-blocks-migration-v2::" + userId,
        "1",
      );
    }
    localStorage.setItem(ACCOUNT_CACHE_OWNER_KEY, "user-1");

    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    const notes = vi.spyOn(api.notes, "list");
    notes
      .mockImplementationOnce(async () => {
        await firstGate;
        return { notes: [], limit: 100, offset: 0, hasMore: false };
      })
      .mockResolvedValue({ notes: [], limit: 100, offset: 0, hasMore: false });
    vi.spyOn(api.importantBlocks, "list").mockResolvedValue({ blocks: [] });

    const first = syncAuthenticatedUserState(
      "user-1",
      makeSnapshot("user-1", "matrices"),
    );
    const second = syncAuthenticatedUserState(
      "user-2",
      makeSnapshot("user-2", "rank"),
    );

    releaseFirst();
    await Promise.all([first, second]);

    expect(localStorage.getItem(ACCOUNT_CACHE_OWNER_KEY)).toBe("user-2");
    expect(
      JSON.parse(localStorage.getItem("visualmath-saved-topics-v1") ?? "[]"),
    ).toEqual(["rank"]);
    expect(notes).toHaveBeenCalledTimes(2);
  });

});
