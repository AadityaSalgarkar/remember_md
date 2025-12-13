import { create } from "zustand";

type ViewMode = "active" | "archived";

interface UIState {
  viewMode: ViewMode;
  searchQuery: string;

  isSettingsOpen: boolean;
  isReminderDialogOpen: boolean;
  selectedArticleId: string | null;

  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;

  openSettings: () => void;
  closeSettings: () => void;
  openReminderDialog: (articleId: string) => void;
  closeReminderDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  viewMode: "active",
  searchQuery: "",

  isSettingsOpen: false,
  isReminderDialogOpen: false,
  selectedArticleId: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openReminderDialog: (articleId) =>
    set({
      isReminderDialogOpen: true,
      selectedArticleId: articleId,
    }),
  closeReminderDialog: () =>
    set({
      isReminderDialogOpen: false,
      selectedArticleId: null,
    }),
}));
