export interface ApiEnvelope<T> {
  data: T;
  requestId?: string;
}

export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  code?: string;
  message?: string;
  details?: unknown;
}

export interface BackendHealthDto {
  status: "ok" | "degraded" | "ready";
}

export interface BackendMetaDto {
  service: string;
  apiVersion: string;
  environment: string;
}

export interface UserProfileDto {
  displayName: string;
  handle: string;
  bio: string;
  avatarUrl: string | null;
  joinedAt: string;
  updatedAt: string;
}

export interface UserDto {
  id: string;
  email: string;
  profile: UserProfileDto;
}

export interface AuthResponseDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: UserDto;
}

export interface RegisterRequest {
  email: string;
  password: string;
  handle: string;
  displayName: string;
  bio?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  handle?: string;
  bio?: string;
}

export interface LearningProgressDto {
  revision: number;
  theoryRead: string[];
  solvedTaskIds: string[];
  savedTheoremIds: string[];
  reading: Record<string, number>;
  readingProgress: Record<string, number>;
  readingBlockIds?: string[];
  lastTopicId?: string | null;
  updatedAt: string;
}

export interface ProgressSyncRequest {
  theoryRead: string[];
  solvedTaskIds: string[];
  savedTheoremIds: string[];
  reading?: Record<string, number>;
  readingProgress?: Record<string, number>;
  lastTopicId?: string | null;
  clientUpdatedAt: string;
}

export interface WorkspaceResumeDto {
  blockIndex: number;
  updatedAt: number;
}

export type ReadingWidthDto = "narrow" | "normal" | "wide";

export interface WorkspaceDto {
  savedTopicIds: string[];
  topicResume: Record<string, WorkspaceResumeDto>;
  readingWidth: ReadingWidthDto;
}

export interface ThemeTokensDto {
  bg: string;
  surface: string;
  elevated: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  border: string;
  definition: string;
  theorem: string;
  proof: string;
  formula: string;
}

export type CursorModeDto = "native" | "halo" | "minimal" | "crosshair" | "comet";
export type MotionProfileDto = "full" | "balanced" | "eco" | "off";

export interface PreferencesDto {
  themeName:
    | "Black"
    | "White"
    | "Catppuccin Mocha"
    | "Catppuccin Latte"
    | "Neovim"
    | "Tokyo Night"
    | "Gruvbox"
    | "Nord"
    | "Custom";
  customTheme: ThemeTokensDto;
  cursorMode: CursorModeDto;
  motionProfile: MotionProfileDto;
  sidebarCollapsed: boolean;
}

export interface BookmarkDto {
  id: string;
  topicId: string | null;
  contentBlockId: string;
  kind: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkListDto {
  bookmarks: BookmarkDto[];
}

export interface CreateBookmarkRequest {
  topicId: string;
  contentBlockId: string;
  kind: string;
  title: string;
}

export interface ActivityHeatmapDayDto {
  date: string;
  count: number;
  level: number;
}

export interface ActivityHeatmapDto {
  days: ActivityHeatmapDayDto[];
}

export interface ActivityStatsDto {
  totalEvents: number;
  activeDays: number;
  currentStreak: number;
  longestStreak: number;
}


export interface NoteDto {
  id: string;
  topicId: string;
  blockIndex: number;
  text: string;
  updatedAt: number;
}

export interface NoteListDto {
  notes: NoteDto[];
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface ImportantBlockDto {
  id: string;
  topicId: string;
  blockIndex: number;
  topicTitle: string;
  blockTitle: string;
  kind: string;
  updatedAt: number;
}

export interface ImportantBlockListDto {
  blocks: ImportantBlockDto[];
}

export interface ReadingBlockRefDto {
  topicId: string;
  blockIndex: number;
}
