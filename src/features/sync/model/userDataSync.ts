import { api, getAccessTokenSnapshot, isBackendConfigured } from "@/shared/api/client";
import { syncAuthenticatedUserState } from "@/features/sync/model/userStateSync";

/**
 * Compatibility facade for older imports.
 *
 * The active runtime no longer installs a second event-driven sync loop here.
 * Session hydration is bootstrap-driven and background writes are handled by
 * autoSync.ts with resource-specific mutations.
 */
export async function syncAuthenticatedUserData() {
  if (!isBackendConfigured() || !getAccessTokenSnapshot().accessToken) return;
  const snapshot = await api.me.bootstrap();
  await syncAuthenticatedUserState(snapshot.user.id, snapshot);
}

export function scheduleAuthenticatedUserDataSync() {
  // Intentionally empty: autoSync.ts owns debounced write-through.
}

export function installUserDataSyncListeners() {
  // Intentionally empty: retained only for source compatibility.
}
