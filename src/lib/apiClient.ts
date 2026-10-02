export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => string | null;
}

export interface ProgressSyncPayload {
  theoryReadTopicIds: string[];
  solvedTaskIds: string[];
  savedTheoremIds?: string[];
  updatedAt: string;
}

export interface UserPreferencesPayload {
  themeName?: string;
  cursorMode?: string;
  motionProfile?: string;
  sidebarCollapsed?: boolean;
  backgroundVolume?: number;
  backgroundLoop?: boolean;
}

export interface CurrentUserDto {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
}

export interface ApiClient {
  me(): Promise<CurrentUserDto>;
  loadProgress(): Promise<ProgressSyncPayload>;
  saveProgress(payload: ProgressSyncPayload): Promise<void>;
  loadPreferences(): Promise<UserPreferencesPayload>;
  savePreferences(payload: UserPreferencesPayload): Promise<void>;
}

export function createApiClient({
  baseUrl,
  getAccessToken,
}: ApiClientOptions): ApiClient {
  const root = baseUrl.replace(/\/$/, "");

  const request = async <T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> => {
    const token = getAccessToken?.();
    const response = await fetch(root + path, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error("api:" + response.status + ":" + path);
    }

    if (response.status === 204) return undefined as T;
    return (await response.json()) as T;
  };

  return {
    me: () => request<CurrentUserDto>("/api/v1/me"),

    loadProgress: () =>
      request<ProgressSyncPayload>("/api/v1/me/learning/progress"),

    saveProgress: (payload) =>
      request<void>("/api/v1/me/learning/progress", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),

    loadPreferences: () =>
      request<UserPreferencesPayload>("/api/v1/me/preferences"),

    savePreferences: (payload) =>
      request<void>("/api/v1/me/preferences", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  };
}

/*
 * Backend integration boundary.
 *
 * The current app intentionally remains local-first. When auth/backend is
 * connected, instantiate createApiClient({ baseUrl, getAccessToken }) and
 * synchronize local learning/preferences through this contract instead of
 * rewriting UI components.
 */
