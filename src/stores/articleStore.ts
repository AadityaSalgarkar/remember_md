import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { articlesRepo } from "@/lib/db/articlesRepo";
import { settingsRepo } from "@/lib/db/settingsRepo";
import type { ArticleWithReminder, MarkdownFile } from "@/domain/articles/types";

interface ArticleState {
  articles: ArticleWithReminder[];
  isLoading: boolean;
  lastError: string | null;

  loadArticles: (includeArchived?: boolean) => Promise<void>;
  syncFromVault: (vaultPath: string) => Promise<{ added: number; removed: number }>;
  archiveArticle: (id: string) => Promise<void>;
  restoreArticle: (id: string) => Promise<void>;
}

export const useArticleStore = create<ArticleState>((set, get) => ({
  articles: [],
  isLoading: false,
  lastError: null,

  loadArticles: async (includeArchived = false) => {
    set({ isLoading: true, lastError: null });
    try {
      const articles = await articlesRepo.listWithReminders(includeArchived);
      set({ articles, isLoading: false });
    } catch (error) {
      set({ lastError: String(error), isLoading: false });
    }
  },

  syncFromVault: async (vaultPath) => {
    set({ isLoading: true, lastError: null });
    try {
      // Scan vault for markdown files
      const files = await invoke<MarkdownFile[]>("scan_vault", { vaultPath });

      // Get existing file paths from DB
      const existingPaths = await articlesRepo.getAllFilePaths();
      const vaultPaths = new Set(files.map((f) => f.path));

      // Add new files
      let added = 0;
      for (const file of files) {
        if (!existingPaths.includes(file.path)) {
          await articlesRepo.create({
            file_path: file.path,
            title: file.title,
            relative_path: file.relative_path,
          });
          added++;
        } else {
          // Update existing
          await articlesRepo.upsert({
            file_path: file.path,
            title: file.title,
            relative_path: file.relative_path,
          });
        }
      }

      // Remove files that no longer exist in vault
      let removed = 0;
      for (const path of existingPaths) {
        if (!vaultPaths.has(path)) {
          await articlesRepo.deleteByFilePath(path);
          removed++;
        }
      }

      // Update last sync time
      await settingsRepo.set("lastSyncAt", new Date().toISOString());

      set({ isLoading: false });
      return { added, removed };
    } catch (error) {
      set({ lastError: String(error), isLoading: false });
      throw error;
    }
  },

  archiveArticle: async (id) => {
    await articlesRepo.archive(id);
    await get().loadArticles();
  },

  restoreArticle: async (id) => {
    await articlesRepo.restore(id);
    await get().loadArticles();
  },
}));
