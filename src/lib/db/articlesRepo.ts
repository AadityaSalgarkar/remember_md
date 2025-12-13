import { getDb, generateId } from "./client";
import type { Article, ArticleInput, ArticleWithReminder } from "@/domain/articles/types";

interface ArticleRow {
  id: string;
  file_path: string;
  title: string;
  relative_path: string;
  is_archived: number;
  created_at: string;
}

interface ArticleWithReminderRow extends ArticleRow {
  reminder_id: string | null;
  remind_at: string | null;
  is_first: number | null;
  completed_at: string | null;
}

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    file_path: row.file_path,
    title: row.title,
    relative_path: row.relative_path,
    is_archived: row.is_archived === 1,
    created_at: row.created_at,
  };
}

function rowToArticleWithReminder(row: ArticleWithReminderRow): ArticleWithReminder {
  const article = rowToArticle(row);
  return {
    ...article,
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

export const articlesRepo = {
  async listWithReminders(includeArchived = false): Promise<ArticleWithReminder[]> {
    const db = await getDb();
    const query = `
      SELECT
        a.id, a.file_path, a.title, a.relative_path, a.is_archived, a.created_at,
        r.id as reminder_id, r.remind_at, r.is_first, r.completed_at
      FROM articles a
      LEFT JOIN reminders r ON a.id = r.article_id AND r.completed_at IS NULL
      ${includeArchived ? "" : "WHERE a.is_archived = 0"}
      ORDER BY
        CASE WHEN r.remind_at IS NOT NULL THEN 0 ELSE 1 END,
        r.remind_at ASC,
        a.title ASC
    `;
    const rows = await db.select<ArticleWithReminderRow[]>(query);
    return rows.map(rowToArticleWithReminder);
  },

  async getByFilePath(filePath: string): Promise<Article | null> {
    const db = await getDb();
    const rows = await db.select<ArticleRow[]>(
      "SELECT * FROM articles WHERE file_path = ?",
      [filePath]
    );
    return rows.length > 0 ? rowToArticle(rows[0]) : null;
  },

  async create(input: ArticleInput): Promise<Article> {
    const db = await getDb();
    const id = generateId();
    await db.execute(
      `INSERT INTO articles (id, file_path, title, relative_path)
       VALUES (?, ?, ?, ?)`,
      [id, input.file_path, input.title, input.relative_path]
    );
    const rows = await db.select<ArticleRow[]>("SELECT * FROM articles WHERE id = ?", [id]);
    return rowToArticle(rows[0]);
  },

  async upsert(input: ArticleInput): Promise<Article> {
    const existing = await this.getByFilePath(input.file_path);
    if (existing) {
      // Update title if changed
      if (existing.title !== input.title || existing.relative_path !== input.relative_path) {
        const db = await getDb();
        await db.execute(
          "UPDATE articles SET title = ?, relative_path = ? WHERE id = ?",
          [input.title, input.relative_path, existing.id]
        );
      }
      return { ...existing, title: input.title, relative_path: input.relative_path };
    }
    return this.create(input);
  },

  async archive(id: string): Promise<void> {
    const db = await getDb();
    await db.execute("UPDATE articles SET is_archived = 1 WHERE id = ?", [id]);
  },

  async restore(id: string): Promise<void> {
    const db = await getDb();
    await db.execute("UPDATE articles SET is_archived = 0 WHERE id = ?", [id]);
  },

  async deleteByFilePath(filePath: string): Promise<void> {
    const db = await getDb();
    await db.execute("DELETE FROM articles WHERE file_path = ?", [filePath]);
  },

  async getAllFilePaths(): Promise<string[]> {
    const db = await getDb();
    const rows = await db.select<{ file_path: string }[]>("SELECT file_path FROM articles");
    return rows.map((r) => r.file_path);
  },
};
