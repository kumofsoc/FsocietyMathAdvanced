import { create } from "zustand";
import { api, ApiError, isBackendConfigured } from "@/shared/api/client";

export type BackendRuntimeStatus =
  | "local-only"
  | "checking"
  | "ready"
  | "degraded"
  | "offline";

type RuntimeState = {
  backend: BackendRuntimeStatus;
  serviceVersion: string | null;
  environment: string | null;
  lastCheckedAt: number | null;
  error: string | null;
  check: () => Promise<void>;
};

let checkInFlight: Promise<void> | null = null;

export const useRuntimeStatusStore = create<RuntimeState>((set) => ({
  backend: isBackendConfigured() ? "checking" : "local-only",
  serviceVersion: null,
  environment: null,
  lastCheckedAt: null,
  error: null,

  check: async () => {
    if (!isBackendConfigured()) {
      set({
        backend: "local-only",
        lastCheckedAt: Date.now(),
        error: null,
      });
      return;
    }
    if (checkInFlight) return checkInFlight;

    checkInFlight = (async () => {
      set({ backend: "checking", error: null });
      try {
        const [health, meta] = await Promise.all([
          api.system.health(),
          api.system.meta(),
        ]);

        let backend: BackendRuntimeStatus =
          health.status === "ok" ? "ready" : "degraded";

        try {
          const ready = await api.system.ready();
          if (ready.status !== "ready" && ready.status !== "ok") {
            backend = "degraded";
          }
        } catch {
          backend = "degraded";
        }

        set({
          backend,
          serviceVersion: meta.apiVersion,
          environment: meta.environment,
          lastCheckedAt: Date.now(),
          error: null,
        });
      } catch (error) {
        set({
          backend: "offline",
          lastCheckedAt: Date.now(),
          error:
            error instanceof ApiError
              ? error.message
              : error instanceof Error
                ? error.message
                : "Backend health check failed.",
        });
      }
    })().finally(() => {
      checkInFlight = null;
    });

    return checkInFlight;
  },
}));
