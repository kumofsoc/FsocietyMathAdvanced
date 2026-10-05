import type {
  BlockNoteDto,
  BookmarkDto,
  ImportantBlockDto,
  PreferencesDto,
  ProgressSyncRequest,
  WorkspaceDto,
} from "@/shared/api/types";
import type { BlockNoteEntry } from "@/features/block-notes/model/blockNotes";
import type { ImportantBlock } from "@/features/important-blocks/model/importantBlocks";
import type { TopicResumeEntry } from "@/features/learning/model/topicResume";
import type { ReadingWidth } from "@/features/reading-width/model/readingWidth";
import type { SavedTheorem } from "@/features/learning/model/learning";

export type MigrationSeed = {
  progress: ProgressSyncRequest;
  readingBlocks: Array<{ topicId: string; blockIndex: number }>;
  savedTopicIds: string[];
  topicResume: Record<string, TopicResumeEntry>;
  readingWidth: ReadingWidth;
  preferences: PreferencesDto;
  preferencesDirty: boolean;
  savedTheorems: SavedTheorem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberRecord(value: unknown) {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (item) =>
        typeof item === "number" &&
        Number.isFinite(item) &&
        item >= 0 &&
        item <= 1,
    )
  );
}

function isTopicResumeRecord(value: unknown) {
  return (
    isRecord(value) &&
    Object.values(value).every(
      (entry) =>
        isRecord(entry) &&
        Number.isInteger(entry.blockIndex) &&
        Number(entry.blockIndex) >= 0 &&
        typeof entry.updatedAt === "number" &&
        Number.isFinite(entry.updatedAt),
    )
  );
}

function isThemeTokens(value: unknown) {
  if (!isRecord(value)) return false;
  const keys = [
    "bg",
    "surface",
    "elevated",
    "text",
    "muted",
    "accent",
    "accent2",
    "border",
    "definition",
    "theorem",
    "proof",
    "formula",
  ];
  return keys.every(
    (key) =>
      typeof value[key] === "string" &&
      /^#[0-9a-fA-F]{6}$/.test(String(value[key])),
  );
}

function isPreferences(value: unknown) {
  if (!isRecord(value)) return false;
  const themes = new Set([
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
  const cursors = new Set(["native", "halo", "minimal", "crosshair", "comet"]);
  const motions = new Set(["full", "balanced", "eco", "off"]);
  return (
    typeof value.themeName === "string" &&
    themes.has(value.themeName) &&
    isThemeTokens(value.customTheme) &&
    typeof value.cursorMode === "string" &&
    cursors.has(value.cursorMode) &&
    typeof value.motionProfile === "string" &&
    motions.has(value.motionProfile) &&
    typeof value.sidebarCollapsed === "boolean"
  );
}

function isSavedTheoremSeed(value: unknown) {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.topicId === "string" &&
    value.topicId.length > 0 &&
    typeof value.topicTitle === "string" &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    (value.formula === undefined || typeof value.formula === "string")
  );
}

export function isMigrationSeed(value: unknown): value is MigrationSeed | null {
  if (value === null) return true;
  if (!isRecord(value)) return false;

  const progress = value.progress;
  if (!isRecord(progress)) return false;

  const readingBlocks = value.readingBlocks;
  if (
    !Array.isArray(readingBlocks) ||
    !readingBlocks.every(
      (item) =>
        isRecord(item) &&
        typeof item.topicId === "string" &&
        Number.isInteger(item.blockIndex) &&
        Number(item.blockIndex) >= 0,
    )
  ) {
    return false;
  }

  if (!isStringArray(value.savedTopicIds)) return false;
  if (!isTopicResumeRecord(value.topicResume)) return false;
  if (
    value.readingWidth !== "narrow" &&
    value.readingWidth !== "normal" &&
    value.readingWidth !== "wide"
  ) {
    return false;
  }
  if (!isPreferences(value.preferences)) return false;
  if (typeof value.preferencesDirty !== "boolean") return false;
  if (
    !Array.isArray(value.savedTheorems) ||
    !value.savedTheorems.every(isSavedTheoremSeed)
  ) {
    return false;
  }

  return (
    isStringArray(progress.theoryRead) &&
    isStringArray(progress.solvedTaskIds) &&
    isStringArray(progress.savedTheoremIds) &&
    (progress.reading === undefined || isNumberRecord(progress.reading)) &&
    (progress.readingProgress === undefined ||
      isNumberRecord(progress.readingProgress)) &&
    (progress.lastTopicId === undefined ||
      progress.lastTopicId === null ||
      typeof progress.lastTopicId === "string") &&
    typeof progress.clientUpdatedAt === "string"
  );
}

export type NoteConflictWinner = "local" | "remote";

export function resolveNoteConflict(
  local: Pick<BlockNoteEntry, "updatedAt">,
  remote: Pick<BlockNoteDto, "updatedAt">,
): NoteConflictWinner {
  return local.updatedAt > remote.updatedAt ? "local" : "remote";
}

export function planNoteMigration(
  local: BlockNoteEntry[],
  remote: BlockNoteDto[],
) {
  const remoteById = new Map(remote.map((item) => [item.id, item]));
  return local.filter((note) => {
    const serverNote = remoteById.get(note.id);
    return !serverNote || resolveNoteConflict(note, serverNote) === "local";
  });
}

export function parseContentBlockId(contentBlockId: string) {
  const separator = contentBlockId.lastIndexOf("::");
  if (separator <= 0) return null;
  const topicId = contentBlockId.slice(0, separator);
  const blockIndex = Number(contentBlockId.slice(separator + 2));
  if (!topicId || !Number.isInteger(blockIndex) || blockIndex < 0) return null;
  return { topicId, blockIndex };
}

export function collectImportantMigrationTargets(
  local: ImportantBlock[],
  remote: ImportantBlockDto[],
  bookmarks: BookmarkDto[],
) {
  const remoteIds = new Set(remote.map((item) => item.id));
  const targets = new Map<string, { topicId: string; blockIndex: number }>();

  for (const item of local) {
    if (!remoteIds.has(item.id)) {
      targets.set(item.id, {
        topicId: item.topicId,
        blockIndex: item.blockIndex,
      });
    }
  }

  for (const bookmark of bookmarks) {
    if (!bookmark.kind.startsWith("important:")) continue;
    const address = parseContentBlockId(bookmark.contentBlockId);
    if (!address) continue;
    targets.set(
      address.topicId + "::" + String(address.blockIndex),
      address,
    );
  }

  return [...targets.values()];
}

export function isPristineWorkspace(workspace: WorkspaceDto) {
  return (
    workspace.savedTopicIds.length === 0 &&
    Object.keys(workspace.topicResume).length === 0 &&
    workspace.readingWidth === "normal"
  );
}

export function union<T>(a: T[], b: T[]) {
  return [...new Set([...a, ...b])];
}

export function mergeReading(
  remote: Record<string, number>,
  local: Record<string, number> | undefined,
) {
  const result = { ...remote };
  for (const [topicId, ratio] of Object.entries(local ?? {})) {
    result[topicId] = Math.max(result[topicId] ?? 0, ratio);
  }
  return result;
}
