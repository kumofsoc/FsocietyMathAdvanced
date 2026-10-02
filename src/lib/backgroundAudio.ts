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

export async function loadBackgroundTrack(): Promise<StoredBackgroundTrack | null> {
  if (!("indexedDB" in window)) return null;
  const db = await openMediaDb();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const request = transaction.objectStore(STORE_NAME).get(TRACK_KEY);
      request.onsuccess = () => resolve((request.result as StoredBackgroundTrack | undefined) ?? null);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function saveBackgroundTrack(file: File): Promise<void> {
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
}

export async function deleteBackgroundTrack(): Promise<void> {
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
}
