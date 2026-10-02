const DB_NAME = "fsocietymath-local-media";
const STORE_NAME = "media";
const TRACK_KEY = "background-track";

export interface StoredBackgroundTrack {
  key: typeof TRACK_KEY;
  name: string;
  type: string;
  blob: Blob;
  updatedAt: number;
}

export interface BackgroundTrackStorage {
  load(): Promise<StoredBackgroundTrack | null>;
  save(file: File): Promise<void>;
  delete(): Promise<void>;
}

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const localBackgroundTrackStorage: BackgroundTrackStorage = {
  async load() {
    if (!("indexedDB" in window)) return null;
    const db = await openMediaDb();
    try {
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const request = transaction.objectStore(STORE_NAME).get(TRACK_KEY);
        request.onsuccess = () =>
          resolve((request.result as StoredBackgroundTrack | undefined) ?? null);
        request.onerror = () => reject(request.error);
      });
    } finally {
      db.close();
    }
  },

  async save(file) {
    if (!("indexedDB" in window)) return;
    const db = await openMediaDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).put({
          key: TRACK_KEY,
          name: file.name,
          type: file.type,
          blob: file,
          updatedAt: Date.now(),
        } satisfies StoredBackgroundTrack);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      db.close();
    }
  },

  async delete() {
    if (!("indexedDB" in window)) return;
    const db = await openMediaDb();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        transaction.objectStore(STORE_NAME).delete(TRACK_KEY);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally {
      db.close();
    }
  },
};

export function createHttpBackgroundTrackStorage(
  apiBaseUrl: string,
  getAccessToken?: () => string | null,
): BackgroundTrackStorage {
  const endpoint = apiBaseUrl.replace(/\/$/, "") + "/v1/media/background-track";

  const headers = (): Record<string, string> => {
    const token = getAccessToken?.();
    return token ? { Authorization: "Bearer " + token } : {};
  };

  return {
    async load() {
      const response = await fetch(endpoint, { headers: headers() });
      if (response.status === 404) return null;
      if (!response.ok) throw new Error("background-track-load:" + response.status);

      const blob = await response.blob();
      const name =
        response.headers.get("X-Track-Name") ??
        response.headers.get("Content-Disposition")?.match(/filename="?([^";]+)"?/)?.[1] ??
        "background-track";

      return {
        key: TRACK_KEY,
        name,
        type: blob.type || response.headers.get("Content-Type") || "audio/mpeg",
        blob,
        updatedAt: Number(response.headers.get("X-Track-Updated-At")) || Date.now(),
      };
    },

    async save(file) {
      const form = new FormData();
      form.append("file", file, file.name);
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: headers(),
        body: form,
      });
      if (!response.ok) throw new Error("background-track-save:" + response.status);
    },

    async delete() {
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: headers(),
      });
      if (!response.ok && response.status !== 404) {
        throw new Error("background-track-delete:" + response.status);
      }
    },
  };
}

/*
 * Frontend currently uses IndexedDB. When the Go backend media endpoint is
 * ready, the app can inject createHttpBackgroundTrackStorage(...) without
 * changing BackgroundMusicPlayer's UI or playback logic.
 */
let activeStorage: BackgroundTrackStorage = localBackgroundTrackStorage;

export function configureBackgroundTrackStorage(storage: BackgroundTrackStorage) {
  activeStorage = storage;
}

export function loadBackgroundTrack() {
  return activeStorage.load();
}

export function saveBackgroundTrack(file: File) {
  return activeStorage.save(file);
}

export function deleteBackgroundTrack() {
  return activeStorage.delete();
}
