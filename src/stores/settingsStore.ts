import { create } from "zustand";
import { settingsRepo, type Settings, type Theme } from "@/lib/db/settingsRepo";

interface SettingsState {
  settings: Settings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateVaultPath: (path: string) => Promise<void>;
  toggleTheme: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
}

const applyTheme = (theme: Theme) => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {
    vaultPath: null,
    lastSyncAt: null,
    theme: "light",
  },
  isLoading: true,

  loadSettings: async () => {
    set({ isLoading: true });
    const settings = await settingsRepo.getAll();
    applyTheme(settings.theme);
    set({ settings, isLoading: false });
  },

  updateVaultPath: async (path) => {
    await settingsRepo.set("vaultPath", path);
    set((state) => ({
      settings: { ...state.settings, vaultPath: path },
    }));
  },

  toggleTheme: async () => {
    const currentTheme = get().settings.theme;
    const newTheme: Theme = currentTheme === "light" ? "dark" : "light";
    await settingsRepo.set("theme", newTheme);
    applyTheme(newTheme);
    set((state) => ({
      settings: { ...state.settings, theme: newTheme },
    }));
  },

  setTheme: async (theme) => {
    await settingsRepo.set("theme", theme);
    applyTheme(theme);
    set((state) => ({
      settings: { ...state.settings, theme },
    }));
  },
}));
