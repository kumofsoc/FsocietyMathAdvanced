import { create } from "zustand";
import { getLocalStorageItem, setLocalStorageItem } from "@/shared/lib/browserStorage";

const SIDEBAR_COLLAPSED_KEY = "fsociety-sidebar-collapsed-v1";

type BooleanSetter = boolean | ((current: boolean) => boolean);

interface AppShellState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  setSidebarOpen: (next: BooleanSetter) => void;
  setSidebarCollapsed: (next: BooleanSetter) => void;
}

function readSidebarCollapsed() {
  try {
    return getLocalStorageItem(SIDEBAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function persistSidebarCollapsed(value: boolean) {
  try {
    setLocalStorageItem(SIDEBAR_COLLAPSED_KEY, value ? "1" : "0");
  } catch {
    // Persistence is optional in private/strict browser contexts.
  }
}

export const useAppShellStore = create<AppShellState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: readSidebarCollapsed(),
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
}));
