import {
  readLocalStorageJson,
  writeLocalStorage,
} from "@/shared/lib/browserStorage";

export const LOCAL_PROFILE_KEY = "visualmath-local-profile-v1";
export const LOCAL_PROFILE_EVENT = "visualmath:local-profile-change";

export type LocalProfile = {
  displayName: string;
  handle: string;
  bio: string;
  joinedAt: string;
};

export function defaultLocalProfile(): LocalProfile {
  return {
    displayName: "VisualMath User",
    handle: "visual-learner",
    bio: "Изучаю математику через структуру, визуализацию и практику.",
    joinedAt: new Date().toISOString(),
  };
}

export function loadLocalProfile(): LocalProfile {
  const fallback = defaultLocalProfile();
  const stored = readLocalStorageJson<Partial<LocalProfile> | null>(
    LOCAL_PROFILE_KEY,
    null,
  );
  if (!stored) {
    saveLocalProfile(fallback);
    return fallback;
  }

  return {
    displayName:
      typeof stored.displayName === "string" && stored.displayName.trim()
        ? stored.displayName
        : fallback.displayName,
    handle:
      typeof stored.handle === "string" && stored.handle.trim()
        ? stored.handle.replace(/^@/, "")
        : fallback.handle,
    bio: typeof stored.bio === "string" ? stored.bio : fallback.bio,
    joinedAt:
      typeof stored.joinedAt === "string" && !Number.isNaN(Date.parse(stored.joinedAt))
        ? stored.joinedAt
        : fallback.joinedAt,
  };
}

export function saveLocalProfile(profile: LocalProfile) {
  const normalized: LocalProfile = {
    ...profile,
    displayName: profile.displayName.trim() || "VisualMath User",
    handle: profile.handle.trim().replace(/^@/, "") || "visual-learner",
    bio: profile.bio.trim(),
  };
  const saved = writeLocalStorage(LOCAL_PROFILE_KEY, JSON.stringify(normalized));
  if (saved && typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<LocalProfile>(LOCAL_PROFILE_EVENT, {
        detail: normalized,
      }),
    );
  }
  return normalized;
}
