import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/config/runtime", () => ({
  runtimeConfig: {
    apiBaseUrl: "https://api.example.test",
    apiTimeoutMs: 5000,
    errorReportingUrl: "",
    appRelease: "test",
  },
}));

type Deferred<T> = {
  promise: Promise<T>;
  resolve: (value: T) => void;
};

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function session(userId: string, token: string) {
  return {
    accessToken: token,
    accessTokenExpiresAt: "2026-10-04T16:00:00Z",
    user: {
      id: userId,
      email: userId + "@example.com",
      profile: {
        displayName: userId,
        handle: userId,
        bio: "",
        avatarUrl: null,
        joinedAt: "2026-10-04T15:00:00Z",
        updatedAt: "2026-10-04T15:00:00Z",
      },
    },
  };
}

function jsonResponse(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("API auth transition serialization", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("waits for an in-flight refresh before login and ignores its stale token", async () => {
    const refreshGate = deferred<Response>();
    const calls: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        calls.push(url);

        if (url.endsWith("/api/v1/auth/refresh")) {
          return refreshGate.promise;
        }
        if (url.endsWith("/api/v1/auth/login")) {
          return jsonResponse(session("user-b", "token-b"));
        }
        throw new Error("unexpected fetch " + url);
      }),
    );

    const { api, getAccessTokenSnapshot } = await import("./client");

    const staleRefresh = api.auth.refresh();
    await vi.waitFor(() => expect(calls).toHaveLength(1));

    const login = api.auth.login({
      email: "user-b@example.com",
      password: "VisualMath!2026",
    });

    await Promise.resolve();
    expect(calls).toHaveLength(1);

    refreshGate.resolve(jsonResponse(session("user-a", "token-a")));

    expect(await staleRefresh).toBeNull();
    const loggedIn = await login;

    expect(loggedIn.user.id).toBe("user-b");
    expect(calls.map((url) => new URL(url).pathname)).toEqual([
      "/api/v1/auth/refresh",
      "/api/v1/auth/login",
    ]);
    expect(getAccessTokenSnapshot()).toEqual({
      accessToken: "token-b",
      accessExpiresAt: "2026-10-04T16:00:00Z",
    });
  });

  it("does not start a new refresh while an explicit auth transition is pending", async () => {
    const loginGate = deferred<Response>();
    const calls: string[] = [];

    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        calls.push(url);

        if (url.endsWith("/api/v1/auth/login")) {
          return loginGate.promise;
        }
        if (url.endsWith("/api/v1/auth/refresh")) {
          return jsonResponse(session("unexpected", "unexpected-token"));
        }
        throw new Error("unexpected fetch " + url);
      }),
    );

    const { api } = await import("./client");

    const login = api.auth.login({
      email: "user-b@example.com",
      password: "VisualMath!2026",
    });
    await vi.waitFor(() => expect(calls).toHaveLength(1));

    expect(await api.auth.refresh()).toBeNull();
    expect(calls).toHaveLength(1);

    loginGate.resolve(jsonResponse(session("user-b", "token-b")));
    await login;
  });
});
