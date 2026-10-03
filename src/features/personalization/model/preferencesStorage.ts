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

export const THEME_NAME_KEY = "math-theme-name";
export const THEME_CUSTOM_KEY = "math-theme-custom";
export const MOTION_KEY = "fsociety-motion-profile-v1";
export const CURSOR_KEY = "fsociety-cursor-style-v1";
export const SIDEBAR_COLLAPSED_KEY = "fsociety-sidebar-collapsed-v1";
export const PREFERENCES_EVENT = "visualmath:preferences-change";

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

export const DEFAULT_PREFERENCES: PreferencesDto = {
  themeName: "Black",
  customTheme: DEFAULT_THEME_TOKENS,
  cursorMode: "halo",
  motionProfile: "balanced",
  sidebarCollapsed: false,
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
const themeKeys = Object.keys(DEFAULT_THEME_TOKENS) as Array<keyof ThemeTokensDto>;

function normalizeTheme(value: unknown): ThemeTokensDto {
  const input =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  return Object.fromEntries(
    themeKeys.map((key) => {
      const raw = input[key];
      return [
        key,
        typeof raw === "string" && /^#[0-9a-fA-F]{6}$/.test(raw)
          ? raw.toLowerCase()
          : DEFAULT_THEME_TOKENS[key],
      ];
    }),
  ) as unknown as ThemeTokensDto;
}

export function loadLocalPreferences(): PreferencesDto {
  const rawTheme = readLocalStorage(THEME_NAME_KEY);
  const rawCursor = readLocalStorage(CURSOR_KEY);
  const rawMotion = readLocalStorage(MOTION_KEY);

  const themeName =
    rawTheme && themeNames.has(rawTheme as PreferencesDto["themeName"])
      ? (rawTheme as PreferencesDto["themeName"])
      : DEFAULT_PREFERENCES.themeName;
  const cursorMode =
    rawCursor && cursorModes.has(rawCursor as CursorModeDto)
      ? (rawCursor as CursorModeDto)
      : DEFAULT_PREFERENCES.cursorMode;
  const motionProfile =
    rawMotion && motionProfiles.has(rawMotion as MotionProfileDto)
      ? (rawMotion as MotionProfileDto)
      : DEFAULT_PREFERENCES.motionProfile;

  return {
    themeName,
    customTheme: normalizeTheme(
      readLocalStorageJson<unknown>(THEME_CUSTOM_KEY, DEFAULT_THEME_TOKENS),
    ),
    cursorMode,
    motionProfile,
    sidebarCollapsed: readLocalStorage(SIDEBAR_COLLAPSED_KEY) === "1",
  };
}

export function preferencesEqual(a: PreferencesDto, b: PreferencesDto) {
  return (
    a.themeName === b.themeName &&
    a.cursorMode === b.cursorMode &&
    a.motionProfile === b.motionProfile &&
    a.sidebarCollapsed === b.sidebarCollapsed &&
    themeKeys.every((key) => a.customTheme[key] === b.customTheme[key])
  );
}

export function isDefaultPreferences(value: PreferencesDto) {
  return preferencesEqual(value, DEFAULT_PREFERENCES);
}

export function emitPreferencesChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT));
  }
}

export function hydrateLocalPreferences(value: PreferencesDto) {
  const normalized: PreferencesDto = {
    ...value,
    customTheme: normalizeTheme(value.customTheme),
  };

  const writes = [
    writeLocalStorage(THEME_NAME_KEY, normalized.themeName),
    writeLocalStorage(THEME_CUSTOM_KEY, JSON.stringify(normalized.customTheme)),
    writeLocalStorage(CURSOR_KEY, normalized.cursorMode),
    writeLocalStorage(MOTION_KEY, normalized.motionProfile),
    writeLocalStorage(
      SIDEBAR_COLLAPSED_KEY,
      normalized.sidebarCollapsed ? "1" : "0",
    ),
  ];

  if (writes.every(Boolean)) emitPreferencesChange();
  return writes.every(Boolean);
}
