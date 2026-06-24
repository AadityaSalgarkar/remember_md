import { create } from "zustand";
import { addDays, format } from "date-fns";
import { remindersRepo } from "@/lib/db/remindersRepo";
import { ideaRemindersRepo } from "@/lib/db/ideaRemindersRepo";
import type { IdeaReminderInput, ReminderInput } from "@/domain/reminders/types";

interface ReminderState {
  dueCount: number;
  articleDueCount: number;
  ideaDueCount: number;

  loadDueCount: () => Promise<void>;
  loadDueCounts: () => Promise<void>;
  createReminder: (input: ReminderInput) => Promise<void>;
  createIdeaReminder: (input: IdeaReminderInput) => Promise<void>;
  updateReminder: (id: string, remindAt: string) => Promise<void>;
  updateIdeaReminder: (id: string, remindAt: string) => Promise<void>;
  markDone: (id: string, articleId: string) => Promise<void>;
  markIdeaDone: (id: string, ideaId: string) => Promise<void>;
  snooze: (id: string, days: number) => Promise<void>;
  snoozeIdea: (id: string, days: number) => Promise<void>;
  cancelReminder: (id: string) => Promise<void>;
  cancelIdeaReminder: (id: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set) => ({
  dueCount: 0,
  articleDueCount: 0,
  ideaDueCount: 0,

  loadDueCount: async () => {
    const [articleCount, ideaCount] = await Promise.all([
      remindersRepo.getDueCount(),
      ideaRemindersRepo.getDueCount(),
    ]);
    set({ dueCount: articleCount, articleDueCount: articleCount, ideaDueCount: ideaCount });
  },

  loadDueCounts: async () => {
    const [articleCount, ideaCount] = await Promise.all([
      remindersRepo.getDueCount(),
      ideaRemindersRepo.getDueCount(),
    ]);
    set({ dueCount: articleCount, articleDueCount: articleCount, ideaDueCount: ideaCount });
  },

  createReminder: async (input) => {
    await remindersRepo.create(input);
  },

  createIdeaReminder: async (input) => {
    await ideaRemindersRepo.create(input);
  },

  updateReminder: async (id, remindAt) => {
    await remindersRepo.update(id, remindAt);
  },

  updateIdeaReminder: async (id, remindAt) => {
    await ideaRemindersRepo.update(id, remindAt);
  },

  markDone: async (id, articleId) => {
    // Complete current reminder
    await remindersRepo.complete(id);

    // Create new reminder for 1 week later
    const nextRemindAt = format(addDays(new Date(), 7), "yyyy-MM-dd");
    await remindersRepo.create({
      article_id: articleId,
      remind_at: nextRemindAt,
      is_first: false,
    });
  },

  markIdeaDone: async (id, ideaId) => {
    await ideaRemindersRepo.complete(id);

    const nextRemindAt = format(addDays(new Date(), 7), "yyyy-MM-dd");
    await ideaRemindersRepo.create({
      idea_id: ideaId,
      remind_at: nextRemindAt,
      is_first: false,
    });
  },

  snooze: async (id, days) => {
    const newDate = format(addDays(new Date(), days), "yyyy-MM-dd");
    await remindersRepo.update(id, newDate);
  },

  snoozeIdea: async (id, days) => {
    const newDate = format(addDays(new Date(), days), "yyyy-MM-dd");
    await ideaRemindersRepo.update(id, newDate);
  },

  cancelReminder: async (id) => {
    await remindersRepo.delete(id);
  },

  cancelIdeaReminder: async (id) => {
    await ideaRemindersRepo.delete(id);
  },
}));
