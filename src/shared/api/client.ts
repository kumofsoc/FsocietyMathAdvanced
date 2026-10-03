import type {
  ApiEnvelope,
  ApiErrorPayload,
  BackendHealthDto,
  LearningProgressDto,
  ProfileDto,
  ProgressSyncRequest,
} from "@/shared/api/types";
import { readLocalStorage, removeLocalStorage, writeLocalStorage } from "@/shared/lib/browserStorage";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
const TOKEN_KEY = "fsocietymath-access-token-v1";

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message || "API request failed");
    this.name = "ApiError";
    this.status = status;
    this.code = payload.code;
    this.details = payload.details;
  }
}

export function isBackendConfigured() {
  return Boolean(API_BASE_URL);
}

export function setAccessToken(token: string | null) {
  if (token) writeLocalStorage(TOKEN_KEY, token);
  else removeLocalStorage(TOKEN_KEY);
}

function getAccessToken() {
  return readLocalStorage(TOKEN_KEY);
}

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(0, {
      code: "BACKEND_NOT_CONFIGURED",
      message: "VITE_API_BASE_URL is not configured.",
    });
  }

  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) headers.set("Authorization", "Bearer " + token);

  const response = await fetch(API_BASE_URL + path, {
    ...init,
    headers,
    credentials: "include",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, {
      message: payload?.message ?? "Request failed with status " + response.status,
      code: payload?.code,
      details: payload?.details,
    });
  }

  return ((payload as ApiEnvelope<T>)?.data ?? payload) as T;
}

export const api = {
  health: () => request<BackendHealthDto>("/health"),
  profile: () => request<ProfileDto>("/v1/profile"),
  progress: {
    get: () => request<LearningProgressDto>("/v1/progress"),
    sync: (body: ProgressSyncRequest) =>
      request<LearningProgressDto>("/v1/progress", {
        method: "PUT",
        body: JSON.stringify(body),
      }),
  },
};
