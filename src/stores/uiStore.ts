import { create } from "zustand";

type ViewMode = "active" | "archived";
type AppMode = "articles" | "ideas";

export type ReminderDialogTarget =
  | { type: "article"; id: string }
  | { type: "idea"; id: string };

interface UIState {
  appMode: AppMode;
  viewMode: ViewMode;
  searchQuery: string;

  isSettingsOpen: boolean;
  isReminderDialogOpen: boolean;
  isNewIdeaDialogOpen: boolean;
  selectedReminderTarget: ReminderDialogTarget | null;

  setAppMode: (mode: AppMode) => void;
  setViewMode: (mode: ViewMode) => void;
  setSearchQuery: (query: string) => void;

  openSettings: () => void;
  closeSettings: () => void;
  openReminderDialog: (target: ReminderDialogTarget) => void;
  closeReminderDialog: () => void;
  openNewIdeaDialog: () => void;
  closeNewIdeaDialog: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  appMode: "articles",
  viewMode: "active",
  searchQuery: "",

  isSettingsOpen: false,
  isReminderDialogOpen: false,
  isNewIdeaDialogOpen: false,
  selectedReminderTarget: null,

  setAppMode: (mode) => set({ appMode: mode, viewMode: "active", searchQuery: "" }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
  openReminderDialog: (target) =>
    set({
      isReminderDialogOpen: true,
      selectedReminderTarget: target,
    }),
  closeReminderDialog: () =>
    set({
      isReminderDialogOpen: false,
      selectedReminderTarget: null,
    }),
  openNewIdeaDialog: () => set({ isNewIdeaDialogOpen: true }),
  closeNewIdeaDialog: () => set({ isNewIdeaDialogOpen: false }),
}));
