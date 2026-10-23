import {
  readLocalStorageJson,
  writeLocalStorage,
} from "@/shared/lib/browserStorage";

export const LOCAL_PROFILE_KEY = "visualmath-local-profile-v1";
export const LOCAL_PROFILE_EVENT = "visualmath:local-profile-change";

/** Only the old, unedited generated profile name is migrated. */
export function normalizeLegacyProfileDisplayName(displayName: string): string {
  return displayName === "VisualMath User" ? "MathMaMath User" : displayName;
}

export type LocalProfile = {
  displayName: string;
  handle: string;
  bio: string;
  joinedAt: string;
};

export function defaultLocalProfile(): LocalProfile {
  return {
    displayName: "MathMaMath User",
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

  const displayName =
    typeof stored.displayName === "string" && stored.displayName.trim()
      ? normalizeLegacyProfileDisplayName(stored.displayName)
      : fallback.displayName;
  const profile: LocalProfile = {
    displayName,
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
  if (stored.displayName === "VisualMath User") {
    writeLocalStorage(LOCAL_PROFILE_KEY, JSON.stringify(profile));
  }
  return profile;
}

export function saveLocalProfile(profile: LocalProfile) {
  const normalized: LocalProfile = {
    ...profile,
    displayName: normalizeLegacyProfileDisplayName(profile.displayName.trim()) || "MathMaMath User",
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
