import { api } from "@/shared/api/client";
import { useAuthStore } from "@/features/auth/model/authSession";
import { readLocalStorageJson, writeLocalStorage } from "@/shared/lib/browserStorage";
import type { MediaAudioTrackDto } from "@/shared/api/types";

const DB_NAME = "fsocietymath-local-media";
const LEGACY_STORE_NAME = "media";
const PLAYLIST_STORE_NAME = "playlist";
const DB_VERSION = 2;
const LEGACY_TRACK_KEY = "background-track";
const MEDIA_IMPORT_PREFIX = "visualmath-media-imported-v1::";

export const MUSIC_COMMAND_EVENT = "visualmath-music-command";
export const MUSIC_STATE_EVENT = "visualmath-music-state";

export type BackgroundTrackSource = "local" | "server";
export type BackgroundStorageMode = "local" | "server" | "local-fallback";

export interface StoredBackgroundTrack {
  id: string;
  name: string;
  type: string;
  blob?: Blob;
  sizeBytes?: number;
  position?: number;
  updatedAt: number;
  source: BackgroundTrackSource;
}

export interface BackgroundMusicTrackSummary {
  id: string;
  name: string;
  type: string;
  updatedAt: number;
  source: BackgroundTrackSource;
}

export interface BackgroundMusicState {
  tracks: BackgroundMusicTrackSummary[];
  currentTrackId: string | null;
  playing: boolean;
  volume: number;
  loopPlaylist: boolean;
  ready: boolean;
  storageMode: BackgroundStorageMode;
  localImportCount: number;
}

export type BackgroundMusicCommand =
  | { type: "request-state" }
  | { type: "refresh" }
  | { type: "toggle" }
  | { type: "play" }
  | { type: "pause" }
  | { type: "next" }
  | { type: "previous" }
  | { type: "select"; trackId: string }
  | { type: "volume"; value: number }
  | { type: "loop-playlist"; value: boolean };

export function selectBackgroundStorageMode(
  authenticated: boolean,
  mediaAudio: boolean,
): "local" | "server" {
  return authenticated && mediaAudio ? "server" : "local";
}

export function getBackgroundStorageMode(): "local" | "server" {
  const state = useAuthStore.getState();
  return selectBackgroundStorageMode(
    state.status === "authenticated",
    state.capabilities.mediaAudio,
  );
}

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(LEGACY_STORE_NAME)) {
        db.createObjectStore(LEGACY_STORE_NAME, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(PLAYLIST_STORE_NAME)) {
        db.createObjectStore(PLAYLIST_STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function makeTrackId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `track-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function migrateLegacyTrack(db: IDBDatabase) {
  if (!db.objectStoreNames.contains(LEGACY_STORE_NAME)) return;

  const existing = await new Promise<number>((resolve, reject) => {
    const transaction = db.transaction(PLAYLIST_STORE_NAME, "readonly");
    const request = transaction.objectStore(PLAYLIST_STORE_NAME).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (existing > 0) return;

  const legacy = await new Promise<any>((resolve, reject) => {
    const transaction = db.transaction(LEGACY_STORE_NAME, "readonly");
    const request = transaction.objectStore(LEGACY_STORE_NAME).get(LEGACY_TRACK_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
  if (!legacy?.blob) return;

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PLAYLIST_STORE_NAME, "readwrite");
    transaction.objectStore(PLAYLIST_STORE_NAME).put({
      id: "legacy-" + (legacy.updatedAt || Date.now()),
      name: legacy.name || "background-track",
      type: legacy.type || legacy.blob.type || "audio/mpeg",
      blob: legacy.blob,
      updatedAt: legacy.updatedAt || Date.now(),
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

function normalizeLocalTrack(raw: any): StoredBackgroundTrack {
  return {
    id: String(raw.id),
    name: String(raw.name || "background-track"),
    type: String(raw.type || raw.blob?.type || "audio/mpeg"),
    blob: raw.blob,
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : Date.now(),
    source: "local",
  };
}

export async function loadLocalBackgroundTracks(): Promise<StoredBackgroundTrack[]> {
  if (typeof window === "undefined" || !("indexedDB" in window)) return [];
  const db = await openMediaDb();
  try {
    await migrateLegacyTrack(db);
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(PLAYLIST_STORE_NAME, "readonly");
      const request = transaction.objectStore(PLAYLIST_STORE_NAME).getAll();
      request.onsuccess = () => {
        const tracks = (request.result as any[])
          .map(normalizeLocalTrack)
          .sort((a, b) => a.updatedAt - b.updatedAt);
        resolve(tracks);
      };
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

function fromRemoteTrack(track: MediaAudioTrackDto): StoredBackgroundTrack {
  return {
    id: track.id,
    name: track.name,
    type: track.type,
    sizeBytes: track.sizeBytes,
    position: track.position,
    updatedAt: Date.parse(track.updatedAt) || Date.now(),
    source: "server",
  };
}

function importedLocalIds(userId: string) {
  return new Set(
    readLocalStorageJson<string[]>(MEDIA_IMPORT_PREFIX + userId, []),
  );
}

function markImportedLocalId(userId: string, trackId: string) {
  const ids = importedLocalIds(userId);
  ids.add(trackId);
  return writeLocalStorage(
    MEDIA_IMPORT_PREFIX + userId,
    JSON.stringify([...ids]),
  );
}

export async function loadBackgroundPlaylist(): Promise<{
  tracks: StoredBackgroundTrack[];
  storageMode: BackgroundStorageMode;
  localImportCount: number;
}> {
  const local = await loadLocalBackgroundTracks().catch(() => []);
  const desiredMode = getBackgroundStorageMode();

  if (desiredMode === "local") {
    return {
      tracks: local,
      storageMode: "local",
      localImportCount: 0,
    };
  }

  const userId = useAuthStore.getState().user?.id;
  const imported = userId ? importedLocalIds(userId) : new Set<string>();
  const localImportCount = local.filter((track) => !imported.has(track.id)).length;

  try {
    const response = await api.media.listAudio();
    return {
      tracks: response.tracks.map(fromRemoteTrack),
      storageMode: "server",
      localImportCount,
    };
  } catch (error) {
    console.warn(
      "[VisualMath] server audio unavailable; falling back to local playlist",
      error,
    );
    return {
      tracks: local,
      storageMode: "local-fallback",
      localImportCount,
    };
  }
}

export async function loadBackgroundTracks(): Promise<StoredBackgroundTrack[]> {
  return (await loadBackgroundPlaylist()).tracks;
}

async function saveLocalBackgroundTracks(files: File[]): Promise<StoredBackgroundTrack[]> {
  if (!files.length || typeof window === "undefined" || !("indexedDB" in window)) {
    return [];
  }
  const db = await openMediaDb();
  try {
    const tracks = files.map((file, index) => ({
      id: makeTrackId(),
      name: file.name,
      type: file.type,
      blob: file,
      updatedAt: Date.now() + index,
      source: "local" as const,
    }));

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(PLAYLIST_STORE_NAME, "readwrite");
      const store = transaction.objectStore(PLAYLIST_STORE_NAME);
      tracks.forEach(({ source: _source, ...track }) => store.put(track));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });

    return tracks;
  } finally {
    db.close();
  }
}

export async function saveBackgroundTracks(files: File[]): Promise<StoredBackgroundTrack[]> {
  if (!files.length) return [];
  if (getBackgroundStorageMode() !== "server") {
    return saveLocalBackgroundTracks(files);
  }

  const created: StoredBackgroundTrack[] = [];
  const localFallback: File[] = [];
  for (const file of files) {
    try {
      created.push(fromRemoteTrack(await api.media.uploadAudio(file)));
    } catch (error) {
      console.warn(
        "[VisualMath] audio upload failed; keeping file in local IndexedDB",
        error,
      );
      localFallback.push(file);
    }
  }
  if (localFallback.length) {
    created.push(...(await saveLocalBackgroundTracks(localFallback)));
  }
  return created;
}

export async function importLocalBackgroundTracksToServer() {
  const state = useAuthStore.getState();
  if (
    state.status !== "authenticated" ||
    !state.user ||
    !state.capabilities.mediaAudio
  ) {
    return { imported: 0, failed: 0 };
  }

  const alreadyImported = importedLocalIds(state.user.id);
  const local = (await loadLocalBackgroundTracks()).filter(
    (track) => !alreadyImported.has(track.id),
  );
  let imported = 0;
  let failed = 0;

  for (const track of local) {
    if (!track.blob) {
      failed += 1;
      continue;
    }
    try {
      const file = new File(
        [track.blob],
        track.name,
        { type: track.type || track.blob.type || "audio/mpeg" },
      );
      await api.media.uploadAudio(file);
      markImportedLocalId(state.user.id, track.id);
      imported += 1;
    } catch {
      failed += 1;
    }
  }

  return { imported, failed };
}

async function deleteLocalTrack(trackId: string) {
  if (typeof window === "undefined" || !("indexedDB" in window)) return;
  const db = await openMediaDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(PLAYLIST_STORE_NAME, "readwrite");
      transaction.objectStore(PLAYLIST_STORE_NAME).delete(trackId);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function deleteBackgroundTrack(
  trackId: string,
  source: BackgroundTrackSource = getBackgroundStorageMode() === "server"
    ? "server"
    : "local",
) {
  if (source === "server") {
    await api.media.deleteAudio(trackId);
    return;
  }
  await deleteLocalTrack(trackId);
}

async function updateLocalTrack(
  trackId: string,
  updater: (track: StoredBackgroundTrack) => StoredBackgroundTrack,
) {
  const tracks = await loadLocalBackgroundTracks();
  const current = tracks.find((track) => track.id === trackId);
  if (!current) return null;
  const next = updater(current);
  const db = await openMediaDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(PLAYLIST_STORE_NAME, "readwrite");
      const { source: _source, ...stored } = next;
      transaction.objectStore(PLAYLIST_STORE_NAME).put(stored);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
  return next;
}

export async function renameBackgroundTrack(
  trackId: string,
  name: string,
  source: BackgroundTrackSource,
) {
  const clean = name.trim();
  if (!clean) return;
  if (source === "server") {
    await api.media.renameAudio(trackId, clean);
    return;
  }
  await updateLocalTrack(trackId, (track) => ({ ...track, name: clean }));
}

export async function reorderBackgroundTracks(
  tracks: BackgroundMusicTrackSummary[],
) {
  if (tracks.length < 2) return;
  if (tracks.every((track) => track.source === "server")) {
    await api.media.reorderAudio(tracks.map((track) => track.id));
    return;
  }

  if (!tracks.every((track) => track.source === "local")) return;
  const base = Date.now();
  for (const [index, track] of tracks.entries()) {
    await updateLocalTrack(track.id, (current) => ({
      ...current,
      updatedAt: base + index,
    }));
  }
}

export async function clearBackgroundTracks(
  tracks?: BackgroundMusicTrackSummary[],
) {
  const currentTracks = tracks ?? (await loadBackgroundPlaylist()).tracks;
  const serverTracks = currentTracks.filter((track) => track.source === "server");
  if (serverTracks.length) {
    for (const track of serverTracks) {
      await api.media.deleteAudio(track.id);
    }
    return;
  }

  if (typeof window === "undefined" || !("indexedDB" in window)) return;
  const db = await openMediaDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(PLAYLIST_STORE_NAME, "readwrite");
      transaction.objectStore(PLAYLIST_STORE_NAME).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

export async function resolveBackgroundTrackBlob(track: StoredBackgroundTrack) {
  if (track.source === "local") {
    if (!track.blob) throw new Error("Local audio blob is missing.");
    return track.blob;
  }
  return api.media.audioContent(track.id);
}

export function musicCommand(command: BackgroundMusicCommand) {
  window.dispatchEvent(new CustomEvent<BackgroundMusicCommand>(MUSIC_COMMAND_EVENT, {
    detail: command,
  }));
}
