import type {
  ActivityHeatmapDto,
  ActivityStatsDto,
  ApiErrorBody,
  AuthResponseDto,
  BackendHealthDto,
  BackendMetaDto,
  BookmarkDto,
  BookmarkListDto,
  CreateBookmarkRequest,
  LearningProgressDto,
  ImportantBlockDto,
  ImportantBlockListDto,
  LoginRequest,
  NoteDto,
  NoteListDto,
  PreferencesDto,
  ProgressSyncRequest,
  ReadingBlockRefDto,
  RegisterRequest,
  UpdateProfileRequest,
  UserDto,
  WorkspaceDto,
} from "@/shared/api/types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const configuredTimeout = Number(import.meta.env.VITE_API_TIMEOUT_MS ?? 12000);
const API_TIMEOUT_MS =
  Number.isFinite(configuredTimeout) && configuredTimeout >= 1000
    ? configuredTimeout
    : 12000;

let accessToken: string | null = null;
let accessExpiresAt: string | null = null;
let refreshInFlight: Promise<AuthResponseDto | null> | null = null;

export const AUTH_SESSION_EVENT = "visualmath:auth-session-change";

type RequestOptions = {
  auth?: boolean;
  retryAuth?: boolean;
  timeoutMs?: number;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;
  requestId?: string;
  cause?: unknown;

  constructor(
    status: number,
    payload: {
      message: string;
      code?: string;
      details?: unknown;
      requestId?: string;
      cause?: unknown;
    },
  ) {
    super(payload.message || "API request failed");
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
    this.requestId = payload.requestId;
    this.cause = payload.cause;
  }
}

export function isBackendConfigured() {
  return Boolean(API_BASE_URL);
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function setAccessToken(token: string | null, expiresAt?: string | null) {
  accessToken = token;
  accessExpiresAt = token ? expiresAt ?? null : null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(AUTH_SESSION_EVENT, {
        detail: { authenticated: Boolean(token), expiresAt: accessExpiresAt },
      }),
    );
  }
}

export function getAccessTokenSnapshot() {
  return {
    accessToken,
    accessExpiresAt,
  };
}

function backendUrl(path: string) {
  return API_BASE_URL + path;
}

function normalizeErrorBody(payload: ApiErrorBody | null | undefined) {
  const nested = payload?.error;
  return {
    code: nested?.code ?? payload?.code,
    message: nested?.message ?? payload?.message ?? "API request failed",
    details: nested?.details ?? payload?.details,
  };
}

function composeSignal(
  external: AbortSignal | null | undefined,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort("timeout"), timeoutMs);

  const onAbort = () => controller.abort(external?.reason);
  if (external) {
    if (external.aborted) onAbort();
    else external.addEventListener("abort", onAbort, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timer);
      external?.removeEventListener("abort", onAbort);
    },
  };
}

async function parsePayload(response: Response) {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function rawRequest<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(0, {
      code: "backend_not_configured",
      message: "VITE_API_BASE_URL is not configured.",
    });
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.auth !== false && accessToken) {
    headers.set("Authorization", "Bearer " + accessToken);
  }

  const timeoutMs = options.timeoutMs ?? API_TIMEOUT_MS;
  const { signal, cleanup } = composeSignal(init.signal, timeoutMs);

  let response: Response;
  try {
    response = await fetch(backendUrl(path), {
      ...init,
      headers,
      signal,
      credentials: "include",
    });
  } catch (error) {
    cleanup();
    const timedOut = signal.aborted && signal.reason === "timeout";
    throw new ApiError(0, {
      code: timedOut ? "request_timeout" : "network_error",
      message: timedOut
        ? "Backend request timed out."
        : "Backend request could not be completed.",
      cause: error,
    });
  }
  cleanup();

  const payload = await parsePayload(response);
  const requestId =
    response.headers.get("X-Request-ID") ??
    response.headers.get("X-Request-Id") ??
    undefined;

  if (!response.ok) {
    const error = normalizeErrorBody(
      payload && typeof payload === "object" ? (payload as ApiErrorBody) : null,
    );
    throw new ApiError(response.status, {
      ...error,
      message:
        error.message ||
        (typeof payload === "string" ? payload : "Request failed with status " + response.status),
      requestId,
    });
  }

  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    (payload as { data?: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }

  return payload as T;
}

async function refreshAccessToken(): Promise<AuthResponseDto | null> {
  if (!isBackendConfigured()) return null;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = rawRequest<AuthResponseDto>(
    "/api/v1/auth/refresh",
    { method: "POST" },
    { auth: false, retryAuth: false },
  )
    .then((session) => {
      setAccessToken(session.accessToken, session.accessTokenExpiresAt);
      return session;
    })
    .catch((error) => {
      setAccessToken(null);
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<T> {
  try {
    return await rawRequest<T>(path, init, options);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      options.auth !== false &&
      options.retryAuth !== false
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return rawRequest<T>(path, init, {
          ...options,
          retryAuth: false,
        });
      }
    }
    throw error;
  }
}

export async function bootstrapBackendSession() {
  return refreshAccessToken();
}

export const api = {
  system: {
    health: () =>
      rawRequest<BackendHealthDto>("/health", {}, { auth: false }),
    ready: () =>
      rawRequest<BackendHealthDto>("/ready", {}, { auth: false }),
    meta: () =>
      rawRequest<BackendMetaDto>("/api/v1/meta", {}, { auth: false }),
  },
  auth: {
    register: async (body: RegisterRequest) => {
      const session = await rawRequest<AuthResponseDto>(
        "/api/v1/auth/register",
        { method: "POST", body: JSON.stringify(body) },
        { auth: false },
      );
      setAccessToken(session.accessToken, session.accessTokenExpiresAt);
      return session;
    },
    login: async (body: LoginRequest) => {
      const session = await rawRequest<AuthResponseDto>(
        "/api/v1/auth/login",
        { method: "POST", body: JSON.stringify(body) },
        { auth: false },
      );
      setAccessToken(session.accessToken, session.accessTokenExpiresAt);
      return session;
    },
    refresh: refreshAccessToken,
    logout: async () => {
      try {
        await rawRequest<void>(
          "/api/v1/auth/logout",
          { method: "POST" },
          { auth: false, retryAuth: false },
        );
      } finally {
        setAccessToken(null);
      }
    },
  },
  me: {
    get: () => request<UserDto>("/api/v1/me"),
    updateProfile: (body: UpdateProfileRequest) =>
      request<UserDto>("/api/v1/me/profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },
  progress: {
    get: () => request<LearningProgressDto>("/api/v1/me/learning"),
    sync: (body: ProgressSyncRequest) =>
      request<LearningProgressDto>("/api/v1/me/learning/sync", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    setTheory: (topicId: string, completed: boolean) =>
      request<LearningProgressDto>(
        "/api/v1/me/theory/" + encodeURIComponent(topicId) + "/complete",
        { method: completed ? "POST" : "DELETE" },
      ),
    setExercise: (taskId: string, solved: boolean) =>
      request<LearningProgressDto>(
        "/api/v1/me/exercises/" + encodeURIComponent(taskId) + "/solve",
        { method: solved ? "POST" : "DELETE" },
      ),
    setTheorem: (theoremId: string, topicId: string | null, saved: boolean) =>
      request<LearningProgressDto>(
        "/api/v1/progress/theorems/" + encodeURIComponent(theoremId),
        {
          method: saved ? "PUT" : "DELETE",
          body: topicId ? JSON.stringify({ topicId }) : undefined,
        },
      ),
    syncReadingBlocks: (blocks: ReadingBlockRefDto[]) =>
      request<LearningProgressDto>("/api/v1/me/reading-blocks/sync", {
        method: "POST",
        body: JSON.stringify({ blocks }),
      }),
  },
  workspace: {
    get: () => request<WorkspaceDto>("/api/v1/me/workspace"),
    saveTopic: (topicId: string, saved: boolean) =>
      request<WorkspaceDto>(
        "/api/v1/me/workspace/saved-topics/" + encodeURIComponent(topicId),
        { method: saved ? "PUT" : "DELETE" },
      ),
    setResume: (topicId: string, blockIndex: number) =>
      request<WorkspaceDto>(
        "/api/v1/me/workspace/topics/" + encodeURIComponent(topicId) + "/resume",
        {
          method: "PUT",
          body: JSON.stringify({ blockIndex }),
        },
      ),
    setReadingWidth: (readingWidth: WorkspaceDto["readingWidth"]) =>
      request<WorkspaceDto>("/api/v1/me/workspace/reading-width", {
        method: "PUT",
        body: JSON.stringify({ readingWidth }),
      }),
  },
  preferences: {
    get: () => request<PreferencesDto>("/api/v1/me/preferences"),
    replace: (body: PreferencesDto) =>
      request<PreferencesDto>("/api/v1/me/preferences", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
  },
  bookmarks: {
    list: () => request<BookmarkListDto>("/api/v1/me/bookmarks"),
    create: (body: CreateBookmarkRequest) =>
      request<BookmarkDto>("/api/v1/me/bookmarks", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request<void>("/api/v1/me/bookmarks/" + encodeURIComponent(id), {
        method: "DELETE",
      }),
  },
  notes: {
    list: (limit = 100, offset = 0) =>
      request<NoteListDto>(
        "/api/v1/me/notes?limit=" +
          encodeURIComponent(String(limit)) +
          "&offset=" +
          encodeURIComponent(String(offset)),
      ),
    get: (topicId: string, blockIndex: number) =>
      request<NoteDto>(
        "/api/v1/me/notes/" +
          encodeURIComponent(topicId) +
          "/" +
          encodeURIComponent(String(blockIndex)),
      ),
    put: (topicId: string, blockIndex: number, text: string) =>
      request<NoteDto | null>(
        "/api/v1/me/notes/" +
          encodeURIComponent(topicId) +
          "/" +
          encodeURIComponent(String(blockIndex)),
        {
          method: "PUT",
          body: JSON.stringify({ text }),
        },
      ),
    remove: (topicId: string, blockIndex: number) =>
      request<void>(
        "/api/v1/me/notes/" +
          encodeURIComponent(topicId) +
          "/" +
          encodeURIComponent(String(blockIndex)),
        { method: "DELETE" },
      ),
  },
  importantBlocks: {
    list: () => request<ImportantBlockListDto>("/api/v1/me/important-blocks"),
    put: (topicId: string, blockIndex: number) =>
      request<ImportantBlockDto>(
        "/api/v1/me/important-blocks/" +
          encodeURIComponent(topicId) +
          "/" +
          encodeURIComponent(String(blockIndex)),
        { method: "PUT" },
      ),
    remove: (topicId: string, blockIndex: number) =>
      request<void>(
        "/api/v1/me/important-blocks/" +
          encodeURIComponent(topicId) +
          "/" +
          encodeURIComponent(String(blockIndex)),
        { method: "DELETE" },
      ),
  },
  activity: {
    heatmap: (year?: number) =>
      request<ActivityHeatmapDto>(
        "/api/v1/me/activity/heatmap" +
          (year ? "?year=" + encodeURIComponent(String(year)) : ""),
      ),
    stats: (days = 28) =>
      request<ActivityStatsDto>(
        "/api/v1/me/activity/stats?days=" + encodeURIComponent(String(days)),
      ),
  },
};
