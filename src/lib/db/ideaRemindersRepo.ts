import { getDb, generateId } from "./client";
import type { IdeaReminder, IdeaReminderInput } from "@/domain/reminders/types";

interface IdeaReminderRow {
  id: string;
  idea_id: string;
  remind_at: string;
  is_first: number;
  completed_at: string | null;
  created_at: string;
}

function rowToIdeaReminder(row: IdeaReminderRow): IdeaReminder {
  return {
    id: row.id,
    idea_id: row.idea_id,
    remind_at: row.remind_at,
    is_first: row.is_first === 1,
    completed_at: row.completed_at,
    created_at: row.created_at,
  };
}

export const ideaRemindersRepo = {
  async getById(id: string): Promise<IdeaReminder | null> {
    const db = await getDb();
    const rows = await db.select<IdeaReminderRow[]>(
      "SELECT * FROM idea_reminders WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rowToIdeaReminder(rows[0]) : null;
  },

  async getActiveByIdeaId(ideaId: string): Promise<IdeaReminder | null> {
    const db = await getDb();
    const rows = await db.select<IdeaReminderRow[]>(
      "SELECT * FROM idea_reminders WHERE idea_id = ? AND completed_at IS NULL",
      [ideaId]
    );
    return rows.length > 0 ? rowToIdeaReminder(rows[0]) : null;
  },

  async create(input: IdeaReminderInput): Promise<IdeaReminder> {
    const db = await getDb();
    const id = generateId();
    const isFirst = input.is_first !== undefined ? (input.is_first ? 1 : 0) : 1;

    await db.execute(
      `INSERT INTO idea_reminders (id, idea_id, remind_at, is_first)
       VALUES (?, ?, ?, ?)`,
      [id, input.idea_id, input.remind_at, isFirst]
    );

    const rows = await db.select<IdeaReminderRow[]>(
      "SELECT * FROM idea_reminders WHERE id = ?",
      [id]
    );
    return rowToIdeaReminder(rows[0]);
  },

  async update(id: string, remindAt: string): Promise<void> {
    const db = await getDb();
    await db.execute("UPDATE idea_reminders SET remind_at = ? WHERE id = ?", [remindAt, id]);
  },

  async complete(id: string): Promise<void> {
    const db = await getDb();
    await db.execute("UPDATE idea_reminders SET completed_at = datetime('now') WHERE id = ?", [
      id,
    ]);
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.execute("DELETE FROM idea_reminders WHERE id = ?", [id]);
  },

  async deleteByIdeaId(ideaId: string): Promise<void> {
    const db = await getDb();
    await db.execute("DELETE FROM idea_reminders WHERE idea_id = ?", [ideaId]);
  },

  async getDueCount(): Promise<number> {
    const db = await getDb();
    const rows = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM idea_reminders
       WHERE completed_at IS NULL AND remind_at <= date('now')`
    );
    return rows[0].count;
  },
};
