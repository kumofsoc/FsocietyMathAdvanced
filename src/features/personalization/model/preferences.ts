import type {
  CursorModeDto,
  MotionProfileDto,
  PreferencesDto,
  ThemeTokensDto,
} from "@/shared/api/types";
import {
  readLocalStorage,
  readLocalStorageJson,
  writeLocalStorage,
} from "@/shared/lib/browserStorage";

export const PREFERENCES_EVENT = "visualmath:preferences-change";
export const THEME_NAME_KEY = "math-theme-name";
export const THEME_CUSTOM_KEY = "math-theme-custom";
export const MOTION_KEY = "fsociety-motion-profile-v1";
export const CURSOR_KEY = "fsociety-cursor-style-v1";
export const SIDEBAR_COLLAPSED_KEY = "fsociety-sidebar-collapsed-v1";

export const DEFAULT_THEME_TOKENS: ThemeTokensDto = {
  bg: "#050507",
  surface: "#0d0d12",
  elevated: "#13131b",
  text: "#f5f5f7",
  muted: "#8d8d9a",
  accent: "#8b7cff",
  accent2: "#36e4c2",
  border: "#252531",
  definition: "#53b6ff",
  theorem: "#a78bfa",
  proof: "#36e4c2",
  formula: "#ffcb6b",
};

const themeNames = new Set<PreferencesDto["themeName"]>([
  "Black",
  "White",
  "Catppuccin Mocha",
  "Catppuccin Latte",
  "Neovim",
  "Tokyo Night",
  "Gruvbox",
  "Nord",
  "Custom",
]);

const cursorModes = new Set<CursorModeDto>([
  "native",
  "halo",
  "minimal",
  "crosshair",
  "comet",
]);

const motionProfiles = new Set<MotionProfileDto>([
  "full",
  "balanced",
  "eco",
  "off",
]);

function emitPreferencesChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT));
  }
}

function writePreference(key: string, value: string) {
  if (readLocalStorage(key) === value) return true;
  const saved = writeLocalStorage(key, value);
  if (saved) emitPreferencesChanged();
  return saved;
}

function normalizeThemeTokens(value: unknown): ThemeTokensDto {
  const input =
    value && typeof value === "object"
      ? (value as Partial<Record<keyof ThemeTokensDto, unknown>>)
      : {};

  const next = { ...DEFAULT_THEME_TOKENS };
  (Object.keys(next) as Array<keyof ThemeTokensDto>).forEach((key) => {
    const candidate = input[key];
    if (typeof candidate === "string" && /^#[0-9a-fA-F]{6}$/.test(candidate)) {
      next[key] = candidate.toLowerCase();
    }
  });
  return next;
}

export function loadLocalPreferences(): PreferencesDto {
  const rawTheme = readLocalStorage(THEME_NAME_KEY) ?? "Black";
  const themeName = themeNames.has(rawTheme as PreferencesDto["themeName"])
    ? (rawTheme as PreferencesDto["themeName"])
    : "Black";

  const rawCursor = readLocalStorage(CURSOR_KEY) ?? "halo";
  const cursorMode = cursorModes.has(rawCursor as CursorModeDto)
    ? (rawCursor as CursorModeDto)
    : "halo";

  const rawMotion = readLocalStorage(MOTION_KEY) ?? "balanced";
  const motionProfile = motionProfiles.has(rawMotion as MotionProfileDto)
    ? (rawMotion as MotionProfileDto)
    : "balanced";

  return {
    themeName,
    customTheme: normalizeThemeTokens(
      readLocalStorageJson<unknown>(THEME_CUSTOM_KEY, null),
    ),
    cursorMode,
    motionProfile,
    sidebarCollapsed: readLocalStorage(SIDEBAR_COLLAPSED_KEY) === "1",
  };
}

export function saveThemeNamePreference(value: PreferencesDto["themeName"]) {
  return writePreference(THEME_NAME_KEY, value);
}

export function saveCustomThemePreference(value: ThemeTokensDto) {
  return writePreference(
    THEME_CUSTOM_KEY,
    JSON.stringify(normalizeThemeTokens(value)),
  );
}

export function saveCursorPreference(value: CursorModeDto) {
  return writePreference(CURSOR_KEY, value);
}

export function saveMotionPreference(value: MotionProfileDto) {
  return writePreference(MOTION_KEY, value);
}

export function saveSidebarCollapsedPreference(value: boolean) {
  return writePreference(SIDEBAR_COLLAPSED_KEY, value ? "1" : "0");
}

export function hydrateLocalPreferences(value: PreferencesDto) {
  writeLocalStorage(THEME_NAME_KEY, value.themeName);
  writeLocalStorage(THEME_CUSTOM_KEY, JSON.stringify(value.customTheme));
  writeLocalStorage(CURSOR_KEY, value.cursorMode);
  writeLocalStorage(MOTION_KEY, value.motionProfile);
  writeLocalStorage(
    SIDEBAR_COLLAPSED_KEY,
    value.sidebarCollapsed ? "1" : "0",
  );

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("fsociety-cursor-change"));
    window.dispatchEvent(new CustomEvent("fsociety-motion-change"));
    emitPreferencesChanged();
  }
}

export function preferencesEqual(a: PreferencesDto, b: PreferencesDto) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function isDefaultPreferences(value: PreferencesDto) {
  return preferencesEqual(value, {
    themeName: "Black",
    customTheme: DEFAULT_THEME_TOKENS,
    cursorMode: "halo",
    motionProfile: "balanced",
    sidebarCollapsed: false,
  });
}
