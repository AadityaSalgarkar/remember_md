import { create } from "zustand";
import { addDays, format } from "date-fns";
import { remindersRepo } from "@/lib/db/remindersRepo";
import type { ReminderInput } from "@/domain/reminders/types";

interface ReminderState {
  dueCount: number;

  loadDueCount: () => Promise<void>;
  createReminder: (input: ReminderInput) => Promise<void>;
  updateReminder: (id: string, remindAt: string) => Promise<void>;
  markDone: (id: string, articleId: string) => Promise<void>;
  snooze: (id: string, days: number) => Promise<void>;
  cancelReminder: (id: string) => Promise<void>;
}

export const useReminderStore = create<ReminderState>((set) => ({
  dueCount: 0,

  loadDueCount: async () => {
    const count = await remindersRepo.getDueCount();
    set({ dueCount: count });
  },

  createReminder: async (input) => {
    await remindersRepo.create(input);
  },

  updateReminder: async (id, remindAt) => {
    await remindersRepo.update(id, remindAt);
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

  snooze: async (id, days) => {
    const newDate = format(addDays(new Date(), days), "yyyy-MM-dd");
    await remindersRepo.update(id, newDate);
  },

  cancelReminder: async (id) => {
    await remindersRepo.delete(id);
  },
}));
