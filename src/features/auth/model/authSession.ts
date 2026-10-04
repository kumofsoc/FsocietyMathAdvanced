import { create } from "zustand";
import {
  api,
  ApiError,
  AUTH_SESSION_EVENT,
  bootstrapBackendSession,
  isBackendConfigured,
} from "@/shared/api/client";
import type {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UserDto,
} from "@/shared/api/types";

export type AuthStatus =
  | "local"
  | "booting"
  | "anonymous"
  | "authenticated"
  | "unavailable";

type AuthState = {
  status: AuthStatus;
  user: UserDto | null;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (input: LoginRequest) => Promise<UserDto>;
  register: (input: RegisterRequest) => Promise<UserDto>;
  logout: () => Promise<void>;
  updateProfile: (input: UpdateProfileRequest) => Promise<UserDto>;
  refreshUser: () => Promise<UserDto | null>;
};

let bootstrapPromise: Promise<void> | null = null;
let listenerInstalled = false;

function messageFromError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === "request_timeout") return "Backend не ответил вовремя.";
    if (error.code === "network_error") return "Backend сейчас недоступен.";
    return error.message;
  }
  return error instanceof Error ? error.message : "Неизвестная ошибка backend.";
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: isBackendConfigured() ? "booting" : "local",
  user: null,
  error: null,

  bootstrap: async () => {
    if (!isBackendConfigured()) {
      set({ status: "local", user: null, error: null });
      return;
    }
    if (bootstrapPromise) return bootstrapPromise;

    bootstrapPromise = (async () => {
      set({ status: "booting", error: null });
      try {
        const session = await bootstrapBackendSession();
        if (!session) {
          set({ status: "anonymous", user: null, error: null });
          return;
        }
        set({
          status: "authenticated",
          user: session.user,
          error: null,
        });
        void import("@/features/sync/model/userStateSync")
          .then(({ syncAuthenticatedUserState }) =>
            syncAuthenticatedUserState(session.user.id),
          )
          .catch((error) => {
            console.warn("[VisualMath] initial backend state sync failed", error);
          });
      } catch (error) {
        set({
          status: "unavailable",
          user: null,
          error: messageFromError(error),
        });
      }
    })().finally(() => {
      bootstrapPromise = null;
    });

    return bootstrapPromise;
  },

  login: async (input) => {
    const session = await api.auth.login(input);
    set({ status: "authenticated", user: session.user, error: null });
    void import("@/features/sync/model/userStateSync")
      .then(({ syncAuthenticatedUserState }) =>
        syncAuthenticatedUserState(session.user.id),
      )
      .catch((error) => {
        console.warn("[VisualMath] login state sync failed", error);
      });
    return session.user;
  },

  register: async (input) => {
    const session = await api.auth.register(input);
    set({ status: "authenticated", user: session.user, error: null });
    void import("@/features/sync/model/userStateSync")
      .then(({ syncAuthenticatedUserState }) =>
        syncAuthenticatedUserState(session.user.id),
      )
      .catch((error) => {
        console.warn("[VisualMath] registration state sync failed", error);
      });
    return session.user;
  },

  logout: async () => {
    await api.auth.logout();
    set({ status: "anonymous", user: null, error: null });
  },

  updateProfile: async (input) => {
    const user = await api.me.updateProfile(input);
    set({ user, status: "authenticated", error: null });
    return user;
  },

  refreshUser: async () => {
    if (get().status !== "authenticated") return null;
    const user = await api.me.get();
    set({ user, error: null });
    return user;
  },
}));

export function installAuthSessionListener() {
  if (listenerInstalled || typeof window === "undefined") return;
  listenerInstalled = true;

  window.addEventListener(AUTH_SESSION_EVENT, (event) => {
    const authenticated = Boolean(
      (event as CustomEvent<{ authenticated?: boolean }>).detail?.authenticated,
    );
    const state = useAuthStore.getState();
    if (!authenticated && state.status === "authenticated") {
      useAuthStore.setState({
        status: "anonymous",
        user: null,
      });
    }
  });
}
