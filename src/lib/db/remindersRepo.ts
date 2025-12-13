import { getDb, generateId } from "./client";
import type { Reminder, ReminderInput } from "@/domain/reminders/types";

interface ReminderRow {
  id: string;
  article_id: string;
  remind_at: string;
  is_first: number;
  completed_at: string | null;
  created_at: string;
}

function rowToReminder(row: ReminderRow): Reminder {
  return {
    id: row.id,
    article_id: row.article_id,
    remind_at: row.remind_at,
    is_first: row.is_first === 1,
    completed_at: row.completed_at,
    created_at: row.created_at,
  };
}

export const remindersRepo = {
  async getById(id: string): Promise<Reminder | null> {
    const db = await getDb();
    const rows = await db.select<ReminderRow[]>("SELECT * FROM reminders WHERE id = ?", [id]);
    return rows.length > 0 ? rowToReminder(rows[0]) : null;
  },

  async getActiveByArticleId(articleId: string): Promise<Reminder | null> {
    const db = await getDb();
    const rows = await db.select<ReminderRow[]>(
      "SELECT * FROM reminders WHERE article_id = ? AND completed_at IS NULL",
      [articleId]
    );
    return rows.length > 0 ? rowToReminder(rows[0]) : null;
  },

  async create(input: ReminderInput): Promise<Reminder> {
    const db = await getDb();
    const id = generateId();
    const isFirst = input.is_first !== undefined ? (input.is_first ? 1 : 0) : 1;

    await db.execute(
      `INSERT INTO reminders (id, article_id, remind_at, is_first)
       VALUES (?, ?, ?, ?)`,
      [id, input.article_id, input.remind_at, isFirst]
    );

    const rows = await db.select<ReminderRow[]>("SELECT * FROM reminders WHERE id = ?", [id]);
    return rowToReminder(rows[0]);
  },

  async update(id: string, remindAt: string): Promise<void> {
    const db = await getDb();
    await db.execute("UPDATE reminders SET remind_at = ? WHERE id = ?", [remindAt, id]);
  },

  async complete(id: string): Promise<void> {
    const db = await getDb();
    await db.execute("UPDATE reminders SET completed_at = datetime('now') WHERE id = ?", [id]);
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.execute("DELETE FROM reminders WHERE id = ?", [id]);
  },

  async deleteByArticleId(articleId: string): Promise<void> {
    const db = await getDb();
    await db.execute("DELETE FROM reminders WHERE article_id = ?", [articleId]);
  },

  async getDueCount(): Promise<number> {
    const db = await getDb();
    const rows = await db.select<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM reminders
       WHERE completed_at IS NULL AND remind_at <= date('now')`
    );
    return rows[0].count;
  },
};
