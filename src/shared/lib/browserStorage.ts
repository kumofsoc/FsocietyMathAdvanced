export function readLocalStorage(key: string): string | null {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalStorage(key: string, value: string): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeLocalStorage(key: string): boolean {
  try {
    if (typeof localStorage === "undefined") return false;
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function matchesFallbackShape(value: unknown, fallback: unknown) {
  if (fallback === null) return true;

  if (Array.isArray(fallback)) {
    return Array.isArray(value);
  }

  if (typeof fallback === "object") {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  return typeof value === typeof fallback;
}

export function readLocalStorageJson<T>(key: string, fallback: T): T {
  const raw = readLocalStorage(key);
  if (raw === null) return fallback;

  try {
    const parsed = JSON.parse(raw) as unknown;
    return matchesFallbackShape(parsed, fallback) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}
