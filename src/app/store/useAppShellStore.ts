import { create } from "zustand";

const SIDEBAR_COLLAPSED_KEY = "fsociety-sidebar-collapsed-v1";

type BooleanSetter = boolean | ((current: boolean) => boolean);

export type SidebarTopicTocItem = {
  key: string;
  label: string;
  blockIndex: number;
  status: "unread" | "partial" | "complete" | null;
};

type SidebarTopicTocState = {
  topicId: string;
  items: SidebarTopicTocItem[];
};

interface AppShellState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  readingFocusMode: boolean;
  sidebarTopicToc: SidebarTopicTocState | null;
  activeSidebarTopicTocKey: string | null;
  setSidebarOpen: (next: BooleanSetter) => void;
  setSidebarCollapsed: (next: BooleanSetter) => void;
  setReadingFocusMode: (next: BooleanSetter) => void;
  setSidebarTopicToc: (topicId: string, items: SidebarTopicTocItem[]) => void;
  setActiveSidebarTopicTocKey: (key: string | null) => void;
  clearSidebarTopicToc: (topicId: string) => void;
}

function readSidebarCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function persistSidebarCollapsed(value: boolean) {
  try {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, value ? "1" : "0");
  } catch {
    // Persistence is optional in private/strict browser contexts.
  }
}

export const useAppShellStore = create<AppShellState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: readSidebarCollapsed(),
  readingFocusMode: false,
  sidebarTopicToc: null,
  activeSidebarTopicTocKey: null,
  setSidebarOpen: (next) =>
    set((state) => ({
      sidebarOpen: typeof next === "function" ? next(state.sidebarOpen) : next,
    })),
  setSidebarCollapsed: (next) =>
    set((state) => {
      const sidebarCollapsed =
        typeof next === "function" ? next(state.sidebarCollapsed) : next;
      persistSidebarCollapsed(sidebarCollapsed);
      return { sidebarCollapsed };
    }),
  setReadingFocusMode: (next) =>
    set((state) => ({
      readingFocusMode:
        typeof next === "function" ? next(state.readingFocusMode) : next,
    })),
  setSidebarTopicToc: (topicId, items) =>
    set({
      sidebarTopicToc: { topicId, items },
    }),
  setActiveSidebarTopicTocKey: (key) =>
    set({ activeSidebarTopicTocKey: key }),
  clearSidebarTopicToc: (topicId) =>
    set((state) =>
      state.sidebarTopicToc?.topicId === topicId
        ? {
            sidebarTopicToc: null,
            activeSidebarTopicTocKey: null,
          }
        : {},
    ),
}));
