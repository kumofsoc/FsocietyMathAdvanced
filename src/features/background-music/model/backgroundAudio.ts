const DB_NAME = "fsocietymath-local-media";
const LEGACY_STORE_NAME = "media";
const PLAYLIST_STORE_NAME = "playlist";
const DB_VERSION = 2;
const LEGACY_TRACK_KEY = "background-track";

export const MUSIC_COMMAND_EVENT = "visualmath-music-command";
export const MUSIC_STATE_EVENT = "visualmath-music-state";

export interface StoredBackgroundTrack {
  id: string;
  name: string;
  type: string;
  blob: Blob;
  updatedAt: number;
}

interface LegacyBackgroundTrackRecord {
  key?: string;
  name?: string;
  type?: string;
  blob?: Blob;
  updatedAt?: number;
}

export interface BackgroundMusicTrackSummary {
  id: string;
  name: string;
  type: string;
  updatedAt: number;
}

export interface BackgroundMusicState {
  tracks: BackgroundMusicTrackSummary[];
  currentTrackId: string | null;
  playing: boolean;
  volume: number;
  loopPlaylist: boolean;
  ready: boolean;
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

  const legacy = await new Promise<LegacyBackgroundTrackRecord | null>((resolve, reject) => {
    const transaction = db.transaction(LEGACY_STORE_NAME, "readonly");
    const request = transaction.objectStore(LEGACY_STORE_NAME).get(LEGACY_TRACK_KEY);
    request.onsuccess = () => resolve((request.result as LegacyBackgroundTrackRecord | undefined) ?? null);
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
    } satisfies StoredBackgroundTrack);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function loadBackgroundTracks(): Promise<StoredBackgroundTrack[]> {
  if (!("indexedDB" in window)) return [];
  const db = await openMediaDb();
  try {
    await migrateLegacyTrack(db);
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(PLAYLIST_STORE_NAME, "readonly");
      const request = transaction.objectStore(PLAYLIST_STORE_NAME).getAll();
      request.onsuccess = () => {
        const tracks = (request.result as StoredBackgroundTrack[])
          .slice()
          .sort((a, b) => a.updatedAt - b.updatedAt);
        resolve(tracks);
      };
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function saveBackgroundTracks(files: File[]): Promise<StoredBackgroundTrack[]> {
  if (!files.length || !("indexedDB" in window)) return [];
  const db = await openMediaDb();
  try {
    const tracks = files.map((file, index) => ({
      id: makeTrackId(),
      name: file.name,
      type: file.type,
      blob: file,
      updatedAt: Date.now() + index,
    } satisfies StoredBackgroundTrack));

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(PLAYLIST_STORE_NAME, "readwrite");
      const store = transaction.objectStore(PLAYLIST_STORE_NAME);
      tracks.forEach((track) => store.put(track));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });

    return tracks;
  } finally {
    db.close();
  }
}

export async function deleteBackgroundTrack(trackId: string) {
  if (!("indexedDB" in window)) return;
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

export async function clearBackgroundTracks() {
  if (!("indexedDB" in window)) return;
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

export function musicCommand(command: BackgroundMusicCommand) {
  window.dispatchEvent(new CustomEvent<BackgroundMusicCommand>(MUSIC_COMMAND_EVENT, {
    detail: command,
  }));
}
