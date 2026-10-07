import { create } from "zustand";
import {
  api,
  AUTH_LOGOUT_PENDING_KEY,
  AUTH_SESSION_EVENT,
  AUTH_SESSION_INVALIDATED_KEY,
  bootstrapBackendSession,
  isBackendConfigured,
  setAccessToken,
} from "@/shared/api/client";
import { apiErrorMessage } from "@/shared/api/errorPresentation";
import {
  clearDeletedAccountState,
  clearVisibleAccountCacheIfOwned,
} from "@/features/sync/model/accountCache";
import type {
  BootstrapCapabilitiesDto,
  BootstrapDto,
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

export type RegisterOutcome =
  | { verificationRequired: true; email: string }
  | { verificationRequired: false; user: UserDto };

const EMPTY_CAPABILITIES: BootstrapCapabilitiesDto = {
  mediaAudio: false,
};

type AuthState = {
  status: AuthStatus;
  user: UserDto | null;
  capabilities: BootstrapCapabilitiesDto;
  bootstrapVersion: number | null;
  bootstrapGeneratedAt: string | null;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (input: LoginRequest) => Promise<UserDto>;
  register: (input: RegisterRequest) => Promise<RegisterOutcome>;
  logout: () => Promise<void>;
  revokeSession: (sessionId: string, current: boolean) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  updateProfile: (input: UpdateProfileRequest) => Promise<UserDto>;
  refreshUser: () => Promise<UserDto | null>;
};

let bootstrapPromise: Promise<void> | null = null;
let listenerInstalled = false;


function startUserStateHydration(snapshot: BootstrapDto) {
  void import("@/features/sync/model/userStateSync")
    .then(({ syncAuthenticatedUserState }) =>
      syncAuthenticatedUserState(snapshot.user.id, snapshot),
    )
    .catch((error) => {
      console.warn("[VisualMath] authenticated state hydration failed", error);
    });
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: isBackendConfigured() ? "booting" : "local",
  user: null,
  capabilities: EMPTY_CAPABILITIES,
  bootstrapVersion: null,
  bootstrapGeneratedAt: null,
  error: null,

  bootstrap: async () => {
    if (!isBackendConfigured()) {
      set({
        status: "local",
        user: null,
        capabilities: EMPTY_CAPABILITIES,
        bootstrapVersion: null,
        bootstrapGeneratedAt: null,
        error: null,
      });
      return;
    }
    if (bootstrapPromise) return bootstrapPromise;

    bootstrapPromise = (async () => {
      set({ status: "booting", error: null });
      try {
        const restored = await bootstrapBackendSession();
        if (!restored) {
          clearVisibleAccountCacheIfOwned();
          set({
            status: "anonymous",
            user: null,
            capabilities: EMPTY_CAPABILITIES,
            bootstrapVersion: null,
            bootstrapGeneratedAt: null,
            error: null,
          });
          return;
        }

        const snapshot = restored.bootstrap;
        set({
          status: "authenticated",
          user: snapshot.user,
          capabilities: snapshot.capabilities,
          bootstrapVersion: snapshot.version,
          bootstrapGeneratedAt: snapshot.generatedAt,
          error: null,
        });
        startUserStateHydration(snapshot);
      } catch (error) {
        set({
          status: "unavailable",
          user: null,
          capabilities: EMPTY_CAPABILITIES,
          bootstrapVersion: null,
          bootstrapGeneratedAt: null,
          error: apiErrorMessage(error),
        });
      }
    })().finally(() => {
      bootstrapPromise = null;
    });

    return bootstrapPromise;
  },

  login: async (input) => {
    const session = await api.auth.login(input);
    set({
      status: "authenticated",
      user: session.user,
      capabilities: EMPTY_CAPABILITIES,
      bootstrapVersion: null,
      bootstrapGeneratedAt: null,
      error: null,
    });

    try {
      const snapshot = await api.me.bootstrap();
      set({
        status: "authenticated",
        user: snapshot.user,
        capabilities: snapshot.capabilities,
        bootstrapVersion: snapshot.version,
        bootstrapGeneratedAt: snapshot.generatedAt,
        error: null,
      });
      startUserStateHydration(snapshot);
      return snapshot.user;
    } catch (error) {
      set({
        status: "authenticated",
        user: session.user,
        capabilities: EMPTY_CAPABILITIES,
        bootstrapVersion: null,
        bootstrapGeneratedAt: null,
        error: apiErrorMessage(error),
      });
      console.warn("[VisualMath] login bootstrap failed; keeping local cache", error);
      return session.user;
    }
  },

  register: async (input) => {
    const result = await api.auth.register(input);
    if ("verificationRequired" in result) {
      set({
        status: "anonymous",
        user: null,
        capabilities: EMPTY_CAPABILITIES,
        bootstrapVersion: null,
        bootstrapGeneratedAt: null,
        error: null,
      });
      return result;
    }

    set({
      status: "authenticated",
      user: result.user,
      capabilities: EMPTY_CAPABILITIES,
      bootstrapVersion: null,
      bootstrapGeneratedAt: null,
      error: null,
    });

    try {
      const snapshot = await api.me.bootstrap();
      set({
        status: "authenticated",
        user: snapshot.user,
        capabilities: snapshot.capabilities,
        bootstrapVersion: snapshot.version,
        bootstrapGeneratedAt: snapshot.generatedAt,
        error: null,
      });
      startUserStateHydration(snapshot);
      return { verificationRequired: false, user: snapshot.user };
    } catch (error) {
      set({
        status: "authenticated",
        user: result.user,
        capabilities: EMPTY_CAPABILITIES,
        bootstrapVersion: null,
        bootstrapGeneratedAt: null,
        error: apiErrorMessage(error),
      });
      console.warn("[VisualMath] registration bootstrap failed; keeping local cache", error);
      return { verificationRequired: false, user: result.user };
    }
  },

  logout: async () => {
    await api.auth.logout();
    clearVisibleAccountCacheIfOwned();
    set({
      status: "anonymous",
      user: null,
      capabilities: EMPTY_CAPABILITIES,
      bootstrapVersion: null,
      bootstrapGeneratedAt: null,
      error: null,
    });
  },

  revokeSession: async (sessionId, current) => {
    await api.me.revokeSession(sessionId);
    if (!current) return;

    setAccessToken(null);
    clearVisibleAccountCacheIfOwned();
    set({
      status: "anonymous",
      user: null,
      capabilities: EMPTY_CAPABILITIES,
      bootstrapVersion: null,
      bootstrapGeneratedAt: null,
      error: null,
    });
  },

  changePassword: async (currentPassword, newPassword) => {
    await api.me.changePassword(currentPassword, newPassword);
    clearVisibleAccountCacheIfOwned();
    set({
      status: "anonymous",
      user: null,
      capabilities: EMPTY_CAPABILITIES,
      bootstrapVersion: null,
      bootstrapGeneratedAt: null,
      error: null,
    });
  },

  deleteAccount: async (password) => {
    const userId = get().user?.id;
    if (!userId) {
      throw new Error("Authenticated user is missing.");
    }

    await api.me.deleteAccount(password);
    clearDeletedAccountState(userId);
    set({
      status: "anonymous",
      user: null,
      capabilities: EMPTY_CAPABILITIES,
      bootstrapVersion: null,
      bootstrapGeneratedAt: null,
      error: null,
    });
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
      clearVisibleAccountCacheIfOwned();
      useAuthStore.setState({
        status: "anonymous",
        user: null,
        capabilities: EMPTY_CAPABILITIES,
        bootstrapVersion: null,
        bootstrapGeneratedAt: null,
      });
    }
  });

  window.addEventListener("storage", (event) => {
    if (
      (event.key === AUTH_LOGOUT_PENDING_KEY && event.newValue === "1") ||
      event.key === AUTH_SESSION_INVALIDATED_KEY
    ) {
      setAccessToken(null);
    }
  });
}
