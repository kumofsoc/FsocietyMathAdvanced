type BrowserStorageKind = "local" | "session";

function resolveStorage(kind: BrowserStorageKind): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function getStorageItem(
  kind: BrowserStorageKind,
  key: string,
): string | null {
  try {
    return resolveStorage(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function setStorageItem(
  kind: BrowserStorageKind,
  key: string,
  value: string,
): boolean {
  try {
    const storage = resolveStorage(kind);
    if (!storage) return false;
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(
  kind: BrowserStorageKind,
  key: string,
): boolean {
  try {
    const storage = resolveStorage(kind);
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const getLocalStorageItem = (key: string) => getStorageItem("local", key);
export const setLocalStorageItem = (key: string, value: string) =>
  setStorageItem("local", key, value);
export const removeLocalStorageItem = (key: string) =>
  removeStorageItem("local", key);

export const getSessionStorageItem = (key: string) =>
  getStorageItem("session", key);
export const setSessionStorageItem = (key: string, value: string) =>
  setStorageItem("session", key, value);
export const removeSessionStorageItem = (key: string) =>
  removeStorageItem("session", key);
