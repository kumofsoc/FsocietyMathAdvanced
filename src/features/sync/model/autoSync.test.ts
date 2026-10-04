import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/authSession";
import {
  flushPendingGeneralMutations,
  GENERAL_SYNC_PENDING_KEY,
} from "./autoSync";

describe("durable account-bound auto sync", () => {
  let store: Map<string, string>;

  beforeEach(() => {
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

    useAuthStore.setState({
      status: "authenticated",
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
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function seedSavedTopicMutation(userId = "user-1") {
    const storageKey = userId + "::saved-topic:rank";
    localStorage.setItem(
      GENERAL_SYNC_PENDING_KEY,
      JSON.stringify({
        [storageKey]: {
          userId,
          updatedAt: 1,
          kind: "saved-topic",
          topicId: "rank",
          saved: true,
        },
      }),
    );
    return storageKey;
  }

  it("keeps failed general mutations durable and retries them later", async () => {
    const storageKey = seedSavedTopicMutation();
    const saveTopic = vi
      .spyOn(api.workspace, "saveTopic")
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({
        savedTopicIds: ["rank"],
        topicResume: {},
        readingWidth: "normal",
      });

    await flushPendingGeneralMutations("user-1");
    expect(saveTopic).toHaveBeenCalledTimes(1);
    expect(
      JSON.parse(localStorage.getItem(GENERAL_SYNC_PENDING_KEY) ?? "{}"),
    ).toHaveProperty(storageKey);

    await flushPendingGeneralMutations("user-1");
    expect(saveTopic).toHaveBeenCalledTimes(2);
    expect(
      JSON.parse(localStorage.getItem(GENERAL_SYNC_PENDING_KEY) ?? "{}"),
    ).not.toHaveProperty(storageKey);
  });

  it("never sends a queued mutation through another account", async () => {
    seedSavedTopicMutation("user-1");
    useAuthStore.setState({
      status: "authenticated",
      user: {
        id: "user-2",
        email: "user-2@example.com",
        profile: {
          displayName: "User 2",
          handle: "user_2",
          bio: "",
          avatarUrl: null,
          joinedAt: "2026-10-04T08:00:00Z",
          updatedAt: "2026-10-04T08:00:00Z",
        },
      },
    });
    const saveTopic = vi.spyOn(api.workspace, "saveTopic");

    await flushPendingGeneralMutations("user-1");

    expect(saveTopic).not.toHaveBeenCalled();
    expect(
      JSON.parse(localStorage.getItem(GENERAL_SYNC_PENDING_KEY) ?? "{}"),
    ).toHaveProperty("user-1::saved-topic:rank");
  });
});
