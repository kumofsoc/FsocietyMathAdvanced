import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("API client contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test");
    vi.stubEnv("VITE_API_TIMEOUT_MS", "5000");
    vi.stubEnv("VITE_REQUIRE_BACKEND", "true");
    vi.stubEnv("VITE_CLIENT_ERROR_ENDPOINT", "");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("parses the backend nested error envelope and request id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            error: {
              code: "validation_error",
              message: "Invalid progress data",
              details: { field: "reading" },
            },
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": "req-test-1",
            },
          },
        ),
      ),
    );

    const { api, ApiError } = await import("@/shared/api/client");

    await expect(api.progress.get()).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      code: "validation_error",
      message: "Invalid progress data",
      requestId: "req-test-1",
    } satisfies Partial<InstanceType<typeof ApiError>>);
  });

  it("refreshes once after 401 and retries the protected request", async () => {
    const user = {
      id: "u-1",
      email: "user@example.test",
      profile: {
        displayName: "User",
        handle: "user",
        bio: "",
        avatarUrl: null,
        joinedAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: { code: "unauthorized", message: "Authentication required" },
          }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            accessToken: "new-token",
            accessTokenExpiresAt: "2026-01-01T01:00:00Z",
            user,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(user), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const { api, setAccessToken, getAccessTokenSnapshot } = await import(
      "@/shared/api/client"
    );
    setAccessToken("expired-token");

    await expect(api.me.get()).resolves.toEqual(user);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAccessTokenSnapshot().accessToken).toBe("new-token");

    const retryHeaders = new Headers(fetchMock.mock.calls[2]?.[1]?.headers);
    expect(retryHeaders.get("Authorization")).toBe("Bearer new-token");
  });

  it("supports same-origin backend configuration", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_API_BASE_URL", "/");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const { api, isBackendConfigured } = await import("@/shared/api/client");
    expect(isBackendConfigured()).toBe(true);
    await expect(api.system.health()).resolves.toEqual({ status: "ok" });
    expect(vi.mocked(fetch).mock.calls[0]?.[0]).toBe("/health");
  });
});
