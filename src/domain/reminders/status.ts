import { isToday, isTomorrow, isPast, differenceInDays } from "date-fns";
import type { Reminder } from "./types";

export type ReminderStatus = "overdue" | "due_today" | "due_tomorrow" | "upcoming" | "future";

export function getReminderStatus(reminder: Reminder): ReminderStatus {
  if (reminder.completed_at) {
    return "future"; // Completed reminders are treated as future
  }

  const remindAt = new Date(reminder.remind_at);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isPast(remindAt) && !isToday(remindAt)) {
    return "overdue";
  }
  if (isToday(remindAt)) {
    return "due_today";
  }
  if (isTomorrow(remindAt)) {
    return "due_tomorrow";
  }

  const daysUntil = differenceInDays(remindAt, today);
  if (daysUntil <= 7) {
    return "upcoming";
  }

  return "future";
}

export function isDue(reminder: Reminder): boolean {
  if (reminder.completed_at) return false;
  const status = getReminderStatus(reminder);
  return status === "overdue" || status === "due_today";
}

export function getDaysUntilDue(reminder: Reminder): number {
  const remindAt = new Date(reminder.remind_at);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return differenceInDays(remindAt, today);
}
