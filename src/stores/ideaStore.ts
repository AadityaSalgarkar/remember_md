import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import { addDays, format } from "date-fns";
import { ideasRepo } from "@/lib/db/ideasRepo";
import { ideaRemindersRepo } from "@/lib/db/ideaRemindersRepo";
import { getIdeasPath } from "@/domain/ideas/paths";
import type { IdeaFile, IdeaWithReminder } from "@/domain/ideas/types";

interface CreateIdeaInput {
  title: string;
  body?: string;
}

interface IdeaState {
  ideas: IdeaWithReminder[];
  ideasPath: string | null;
  isLoading: boolean;
  lastError: string | null;

  loadIdeas: (includeArchived?: boolean) => Promise<void>;
  syncIdeas: (clippingsPath: string) => Promise<{ added: number; removed: number }>;
  createIdea: (clippingsPath: string, input: CreateIdeaInput) => Promise<void>;
  archiveIdea: (id: string) => Promise<void>;
  restoreIdea: (id: string) => Promise<void>;
}

export const useIdeaStore = create<IdeaState>((set, get) => ({
  ideas: [],
  ideasPath: null,
  isLoading: false,
  lastError: null,

  loadIdeas: async (includeArchived = false) => {
    set({ isLoading: true, lastError: null });
    try {
      const ideas = await ideasRepo.listWithReminders(includeArchived);
      set({ ideas, isLoading: false });
    } catch (error) {
      set({ lastError: String(error), isLoading: false });
    }
  },

  syncIdeas: async (clippingsPath) => {
    const ideasPath = getIdeasPath(clippingsPath);
    set({ ideasPath, isLoading: true, lastError: null });

    try {
      const files = await invoke<IdeaFile[]>("scan_ideas", { ideasPath });
      const existingPaths = await ideasRepo.getAllFilePaths();
      const ideaPaths = new Set(files.map((file) => file.path));

      let added = 0;
      for (const file of files) {
        if (!existingPaths.includes(file.path)) {
          await ideasRepo.create({
            file_path: file.path,
            title: file.title,
            relative_path: file.relative_path,
          });
          added++;
        } else {
          await ideasRepo.upsert({
            file_path: file.path,
            title: file.title,
            relative_path: file.relative_path,
          });
        }
      }

      let removed = 0;
      for (const path of existingPaths) {
        if (!ideaPaths.has(path)) {
          await ideasRepo.deleteByFilePath(path);
          removed++;
        }
      }

      set({ isLoading: false });
      return { added, removed };
    } catch (error) {
      set({ lastError: String(error), isLoading: false });
      throw error;
    }
  },

  createIdea: async (clippingsPath, input) => {
    const ideasPath = getIdeasPath(clippingsPath);
    set({ ideasPath, isLoading: true, lastError: null });

    try {
      const file = await invoke<IdeaFile>("create_idea_file", {
        ideasPath,
        title: input.title,
        body: input.body ?? "",
      });
      const idea = await ideasRepo.create({
        file_path: file.path,
        title: file.title,
        relative_path: file.relative_path,
      });
      const remindAt = format(addDays(new Date(), 7), "yyyy-MM-dd");
      await ideaRemindersRepo.create({
        idea_id: idea.id,
        remind_at: remindAt,
        is_first: true,
      });
      await get().loadIdeas();
      try {
        await invoke("open_in_md_render", { filePath: file.path });
      } catch (openError) {
        console.error("Failed to open idea:", openError);
      }
    } catch (error) {
      set({ lastError: String(error), isLoading: false });
      throw error;
    }
  },

  archiveIdea: async (id) => {
    await ideasRepo.archive(id);
    await get().loadIdeas();
  },

  restoreIdea: async (id) => {
    await ideasRepo.restore(id);
    await get().loadIdeas();
  },
}));
