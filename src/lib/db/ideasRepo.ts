import { getDb, generateId } from "./client";
import type { Idea, IdeaInput, IdeaWithReminder } from "@/domain/ideas/types";

interface IdeaRow {
  id: string;
  file_path: string;
  title: string;
  relative_path: string;
  is_archived: number;
  created_at: string;
  updated_at: string;
}

interface IdeaWithReminderRow extends IdeaRow {
  reminder_id: string | null;
  remind_at: string | null;
  is_first: number | null;
  completed_at: string | null;
}

function rowToIdea(row: IdeaRow): Idea {
  return {
    id: row.id,
    file_path: row.file_path,
    title: row.title,
    relative_path: row.relative_path,
    is_archived: row.is_archived === 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToIdeaWithReminder(row: IdeaWithReminderRow): IdeaWithReminder {
  const idea = rowToIdea(row);
  return {
    ...idea,
    reminder: row.reminder_id
      ? {
          id: row.reminder_id,
          remind_at: row.remind_at!,
          is_first: row.is_first === 1,
          completed_at: row.completed_at,
        }
      : undefined,
  };
}

export const ideasRepo = {
  async listWithReminders(includeArchived = false): Promise<IdeaWithReminder[]> {
    const db = await getDb();
    const query = `
      SELECT
        i.id, i.file_path, i.title, i.relative_path, i.is_archived, i.created_at, i.updated_at,
        r.id as reminder_id, r.remind_at, r.is_first, r.completed_at
      FROM ideas i
      LEFT JOIN idea_reminders r ON i.id = r.idea_id AND r.completed_at IS NULL
      ${includeArchived ? "" : "WHERE i.is_archived = 0"}
      ORDER BY
        CASE WHEN r.remind_at IS NOT NULL THEN 0 ELSE 1 END,
        r.remind_at ASC,
        i.updated_at DESC,
        i.title ASC
    `;
    const rows = await db.select<IdeaWithReminderRow[]>(query);
    return rows.map(rowToIdeaWithReminder);
  },

  async getByFilePath(filePath: string): Promise<Idea | null> {
    const db = await getDb();
    const rows = await db.select<IdeaRow[]>("SELECT * FROM ideas WHERE file_path = ?", [
      filePath,
    ]);
    return rows.length > 0 ? rowToIdea(rows[0]) : null;
  },

  async create(input: IdeaInput): Promise<Idea> {
    const db = await getDb();
    const id = generateId();
    await db.execute(
      `INSERT INTO ideas (id, file_path, title, relative_path)
       VALUES (?, ?, ?, ?)`,
      [id, input.file_path, input.title, input.relative_path]
    );
    const rows = await db.select<IdeaRow[]>("SELECT * FROM ideas WHERE id = ?", [id]);
    return rowToIdea(rows[0]);
  },

  async upsert(input: IdeaInput): Promise<Idea> {
    const existing = await this.getByFilePath(input.file_path);
    if (existing) {
      if (existing.title !== input.title || existing.relative_path !== input.relative_path) {
        const db = await getDb();
        await db.execute(
          `UPDATE ideas
           SET title = ?, relative_path = ?, updated_at = datetime('now')
           WHERE id = ?`,
          [input.title, input.relative_path, existing.id]
        );
      }
      return { ...existing, title: input.title, relative_path: input.relative_path };
    }
    return this.create(input);
  },

  async archive(id: string): Promise<void> {
    const db = await getDb();
    await db.execute("UPDATE ideas SET is_archived = 1, updated_at = datetime('now') WHERE id = ?", [
      id,
    ]);
  },

  async restore(id: string): Promise<void> {
    const db = await getDb();
    await db.execute("UPDATE ideas SET is_archived = 0, updated_at = datetime('now') WHERE id = ?", [
      id,
    ]);
  },

  async deleteByFilePath(filePath: string): Promise<void> {
    const db = await getDb();
    const idea = await this.getByFilePath(filePath);
    if (idea) {
      await db.execute("DELETE FROM idea_reminders WHERE idea_id = ?", [idea.id]);
    }
    await db.execute("DELETE FROM ideas WHERE file_path = ?", [filePath]);
  },

  async getAllFilePaths(): Promise<string[]> {
    const db = await getDb();
    const rows = await db.select<{ file_path: string }[]>("SELECT file_path FROM ideas");
    return rows.map((r) => r.file_path);
  },
};
