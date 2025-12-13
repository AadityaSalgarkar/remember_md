import { create } from "zustand";
import { settingsRepo, type Settings } from "@/lib/db/settingsRepo";

interface SettingsState {
  settings: Settings;
  isLoading: boolean;

  loadSettings: () => Promise<void>;
  updateVaultPath: (path: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: {
    vaultPath: null,
    lastSyncAt: null,
  },
  isLoading: true,

  loadSettings: async () => {
    set({ isLoading: true });
    const settings = await settingsRepo.getAll();
    set({ settings, isLoading: false });
  },

  updateVaultPath: async (path) => {
    await settingsRepo.set("vaultPath", path);
    set((state) => ({
      settings: { ...state.settings, vaultPath: path },
    }));
  },
}));
