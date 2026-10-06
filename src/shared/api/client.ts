import { runtimeConfig } from "@/shared/config/runtime";
import {
  ApiError,
  createApiTransport,
  type TransportRequestOptions,
} from "@/shared/api/transport";
export { ApiError } from "@/shared/api/transport";
import {
  readLocalStorage,
  removeLocalStorage,
  writeLocalStorage,
} from "@/shared/lib/browserStorage";
import type {
  AccountSessionListDto,
  ActivityHeatmapDto,
  ActivityStatsDto,
  AuthResponseDto,
  BackendHealthDto,
  BackendMetaDto,
  BlockNoteDto,
  BlockNoteListDto,
  BookmarkDto,
  BookmarkListDto,
  BootstrapDto,
  CreateBookmarkRequest,
  ImportantBlockDto,
  ImportantBlockListDto,
  LearningProgressDto,
  LoginRequest,
  MediaAudioTrackDto,
  MediaAudioTrackListDto,
  PreferencesDto,
  ProgressSyncRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UserDto,
  WorkspaceDto,
} from "@/shared/api/types";

const API_BASE_URL = runtimeConfig.apiBaseUrl;
const API_TIMEOUT_MS = runtimeConfig.apiTimeoutMs;
const MEDIA_TRANSFER_TIMEOUT_MS = runtimeConfig.mediaTransferTimeoutMs;

let accessToken: string | null = null;
let accessExpiresAt: string | null = null;
let refreshInFlight: Promise<AuthResponseDto | null> | null = null;
const AUTH_COOKIE_LOCK_NAME = "visualmath-auth-cookie-v1";
export const AUTH_LOGOUT_PENDING_KEY = "visualmath-auth-logout-pending-v1";
export const AUTH_SESSION_INVALIDATED_KEY =
  "visualmath-auth-session-invalidated-v1";
let authTransitionTail: Promise<void> = Promise.resolve();
let explicitAuthPending = 0;
let authGeneration = 0;

export const AUTH_SESSION_EVENT = "visualmath:auth-session-change";

type RequestOptions = TransportRequestOptions & {
  retryAuth?: boolean;
};

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

function hasPendingLogout() {
  return readLocalStorage(AUTH_LOGOUT_PENDING_KEY) === "1";
}

function markPendingLogout() {
  writeLocalStorage(AUTH_LOGOUT_PENDING_KEY, "1");
}

function clearPendingLogout() {
  removeLocalStorage(AUTH_LOGOUT_PENDING_KEY);
}

function invalidateAuthenticatedSession() {
  writeLocalStorage(AUTH_SESSION_INVALIDATED_KEY, String(Date.now()));
  setAccessToken(null);
}

const { backendUrl, rawRequest, rawBlobRequest } = createApiTransport({
  baseUrl: API_BASE_URL,
  timeoutMs: API_TIMEOUT_MS,
  getAuthorization: () =>
    accessToken && explicitAuthPending === 0
      ? "Bearer " + accessToken
      : null,
});

async function withAuthCookieLock<T>(work: () => Promise<T>): Promise<T> {
  if (
    typeof navigator !== "undefined" &&
    navigator.locks &&
    typeof navigator.locks.request === "function"
  ) {
    return navigator.locks.request(
      AUTH_COOKIE_LOCK_NAME,
      { mode: "exclusive" },
      () => work(),
    );
  }
  return work();
}

async function refreshAccessToken(): Promise<AuthResponseDto | null> {
  if (!isBackendConfigured() || explicitAuthPending > 0 || hasPendingLogout()) {
    return null;
  }
  if (refreshInFlight) return refreshInFlight;

  const generation = authGeneration;
  const pending = withAuthCookieLock(() =>
    rawRequest<AuthResponseDto>(
      "/api/v1/auth/refresh",
      { method: "POST" },
      { auth: false, retryAuth: false },
    ),
  )
    .then((session) => {
      if (generation !== authGeneration || explicitAuthPending > 0) {
        return null;
      }
      setAccessToken(session.accessToken, session.accessTokenExpiresAt);
      return session;
    })
    .catch((error) => {
      if (generation === authGeneration && explicitAuthPending === 0) {
        setAccessToken(null);
      }
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    })
    .finally(() => {
      if (refreshInFlight === pending) {
        refreshInFlight = null;
      }
    });

  refreshInFlight = pending;
  return pending;
}

async function waitForRefreshToSettle() {
  const pending = refreshInFlight;
  if (!pending) return;

  try {
    await pending;
  } catch {
    // The explicit auth transition still needs to run and become authoritative.
  }
}

function runExplicitAuth<T>(work: () => Promise<T>): Promise<T> {
  authGeneration += 1;
  explicitAuthPending += 1;

  const run = authTransitionTail
    .catch(() => undefined)
    .then(async () => {
      await waitForRefreshToSettle();
      setAccessToken(null);
      return withAuthCookieLock(work);
    })
    .finally(() => {
      explicitAuthPending -= 1;
    });

  authTransitionTail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
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

async function requestBlob(
  path: string,
  init: RequestInit = {},
  options: RequestOptions = {},
): Promise<Blob> {
  try {
    return await rawBlobRequest(path, init, options);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      options.auth !== false &&
      options.retryAuth !== false
    ) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return rawBlobRequest(path, init, {
          ...options,
          retryAuth: false,
        });
      }
    }
    throw error;
  }
}

async function flushPendingLogout() {
  if (!hasPendingLogout()) return true;

  try {
    await rawRequest<void>(
      "/api/v1/auth/logout",
      { method: "POST" },
      { auth: false, retryAuth: false },
    );
    clearPendingLogout();
    return true;
  } catch {
    return false;
  }
}

export async function bootstrapBackendSession() {
  if (hasPendingLogout()) {
    await flushPendingLogout();
    setAccessToken(null);
    return null;
  }

  const session = await refreshAccessToken();
  if (!session) return null;
  const bootstrap = await request<BootstrapDto>("/api/v1/me/bootstrap");
  return { session, bootstrap };
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
    register: (body: RegisterRequest) =>
      runExplicitAuth(async () => {
        const session = await rawRequest<AuthResponseDto>(
          "/api/v1/auth/register",
          { method: "POST", body: JSON.stringify(body) },
          { auth: false },
        );
        clearPendingLogout();
        setAccessToken(session.accessToken, session.accessTokenExpiresAt);
        return session;
      }),
    login: (body: LoginRequest) =>
      runExplicitAuth(async () => {
        const session = await rawRequest<AuthResponseDto>(
          "/api/v1/auth/login",
          { method: "POST", body: JSON.stringify(body) },
          { auth: false },
        );
        clearPendingLogout();
        setAccessToken(session.accessToken, session.accessTokenExpiresAt);
        return session;
      }),
    refresh: refreshAccessToken,
    requestPasswordReset: (email: string) =>
      rawRequest<void>(
        "/api/v1/auth/password-reset/request",
        { method: "POST", body: JSON.stringify({ email }) },
        { auth: false, retryAuth: false },
      ),
    confirmPasswordReset: (token: string, newPassword: string) =>
      rawRequest<void>(
        "/api/v1/auth/password-reset/confirm",
        {
          method: "POST",
          body: JSON.stringify({ token, newPassword }),
        },
        { auth: false, retryAuth: false },
      ),
    logout: () => {
      markPendingLogout();
      return runExplicitAuth(async () => {
        try {
          await rawRequest<void>(
            "/api/v1/auth/logout",
            { method: "POST" },
            { auth: false, retryAuth: false },
          );
          clearPendingLogout();
        } finally {
          setAccessToken(null);
        }
      });
    },
  },
  me: {
    get: () => request<UserDto>("/api/v1/me"),
    bootstrap: () => request<BootstrapDto>("/api/v1/me/bootstrap"),
    updateProfile: (body: UpdateProfileRequest) =>
      request<UserDto>("/api/v1/me/profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    sessions: () =>
      request<AccountSessionListDto>("/api/v1/me/sessions"),
    revokeSession: (sessionId: string) =>
      request<void>(
        "/api/v1/me/sessions/" + encodeURIComponent(sessionId),
        { method: "DELETE" },
      ),
    exportAccount: () =>
      requestBlob("/api/v1/me/account/export"),
    changePassword: async (currentPassword: string, newPassword: string) => {
      await request<void>("/api/v1/me/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      invalidateAuthenticatedSession();
    },
    deleteAccount: async (password: string) => {
      await request<void>("/api/v1/me/account", {
        method: "DELETE",
        body: JSON.stringify({ password }),
      });
      invalidateAuthenticatedSession();
    },
  },
  progress: {
    get: () => request<LearningProgressDto>("/api/v1/me/learning"),
    sync: (body: ProgressSyncRequest) =>
      request<LearningProgressDto>("/api/v1/me/learning/sync", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    patchTopic: (
      topicId: string,
      body: { readingRatio?: number; theoryComplete?: true },
    ) =>
      request<LearningProgressDto>(
        "/api/v1/me/progress/topics/" + encodeURIComponent(topicId),
        {
          method: "PUT",
          body: JSON.stringify(body),
        },
      ),
    completeTheory: (topicId: string) =>
      request<LearningProgressDto>(
        "/api/v1/me/theory/" + encodeURIComponent(topicId) + "/complete",
        { method: "POST" },
      ),
    uncompleteTheory: (topicId: string) =>
      request<LearningProgressDto>(
        "/api/v1/me/theory/" + encodeURIComponent(topicId) + "/complete",
        { method: "DELETE" },
      ),
    solveExercise: (exerciseId: string) =>
      request<LearningProgressDto>(
        "/api/v1/me/exercises/" + encodeURIComponent(exerciseId) + "/solve",
        { method: "POST" },
      ),
    unsolveExercise: (exerciseId: string) =>
      request<LearningProgressDto>(
        "/api/v1/me/exercises/" + encodeURIComponent(exerciseId) + "/solve",
        { method: "DELETE" },
      ),
    setResume: (lastTopicId: string) =>
      request<{ lastTopicId: string | null; revision: number; updatedAt: string }>(
        "/api/v1/me/resume",
        {
          method: "PUT",
          body: JSON.stringify({ lastTopicId }),
        },
      ),
    removeTheorem: (theoremId: string) =>
      request<LearningProgressDto>(
        "/api/v1/progress/theorems/" + encodeURIComponent(theoremId),
        { method: "DELETE" },
      ),
    markReadingBlock: (topicId: string, blockIndex: number) =>
      request<LearningProgressDto>(
        "/api/v1/me/reading-blocks/" +
          encodeURIComponent(topicId) +
          "/" +
          encodeURIComponent(String(blockIndex)),
        { method: "PUT" },
      ),
    syncReadingBlocks: (blocks: Array<{ topicId: string; blockIndex: number }>) =>
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
      request<BlockNoteListDto>(
        "/api/v1/me/notes?limit=" +
          encodeURIComponent(String(limit)) +
          "&offset=" +
          encodeURIComponent(String(offset)),
      ),
    get: (topicId: string, blockIndex: number) =>
      request<BlockNoteDto>(
        "/api/v1/me/notes/" +
          encodeURIComponent(topicId) +
          "/" +
          encodeURIComponent(String(blockIndex)),
      ),
    put: (topicId: string, blockIndex: number, text: string) =>
      request<BlockNoteDto | null>(
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
    list: () =>
      request<ImportantBlockListDto>("/api/v1/me/important-blocks"),
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
  media: {
    listAudio: () =>
      request<MediaAudioTrackListDto>("/api/v1/me/media/audio"),
    uploadAudio: (file: File) => {
      const body = new FormData();
      body.set("file", file, file.name);
      return request<MediaAudioTrackDto>(
        "/api/v1/me/media/audio",
        {
          method: "POST",
          body,
        },
        { timeoutMs: MEDIA_TRANSFER_TIMEOUT_MS },
      );
    },
    renameAudio: (id: string, name: string) =>
      request<MediaAudioTrackDto>(
        "/api/v1/me/media/audio/" + encodeURIComponent(id),
        {
          method: "PATCH",
          body: JSON.stringify({ name }),
        },
      ),
    reorderAudio: (trackIds: string[]) =>
      request<MediaAudioTrackListDto>("/api/v1/me/media/audio/order", {
        method: "PUT",
        body: JSON.stringify({ trackIds }),
      }),
    deleteAudio: (id: string) =>
      request<void>("/api/v1/me/media/audio/" + encodeURIComponent(id), {
        method: "DELETE",
      }),
    audioContentUrl: (id: string) =>
      backendUrl(
        "/api/v1/me/media/audio/" + encodeURIComponent(id) + "/content",
      ),
    audioContent: (id: string) =>
      requestBlob(
        "/api/v1/me/media/audio/" + encodeURIComponent(id) + "/content",
        {},
        { timeoutMs: MEDIA_TRANSFER_TIMEOUT_MS },
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
