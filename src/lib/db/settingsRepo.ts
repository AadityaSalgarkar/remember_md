import { getDb } from "./client";

export interface Settings {
  vaultPath: string | null;
  lastSyncAt: string | null;
}

const DEFAULT_SETTINGS: Settings = {
  vaultPath: "/Users/aaditya/Documents/obs/aaditya",
  lastSyncAt: null,
};

export const settingsRepo = {
  async getAll(): Promise<Settings> {
    const db = await getDb();
    const rows = await db.select<{ key: string; value: string }[]>(
      "SELECT key, value FROM settings"
    );

    const settings: Settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      if (row.key === "vaultPath") {
        settings.vaultPath = row.value;
      } else if (row.key === "lastSyncAt") {
        settings.lastSyncAt = row.value;
      }
    }
    return settings;
  },

  async get(key: keyof Settings): Promise<string | null> {
    const db = await getDb();
    const rows = await db.select<{ value: string }[]>(
      "SELECT value FROM settings WHERE key = ?",
      [key]
    );
    return rows.length > 0 ? rows[0].value : null;
  },

  async set(key: keyof Settings, value: string): Promise<void> {
    const db = await getDb();
    await db.execute(
      `INSERT INTO settings (key, value, updated_at)
       VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
      [key, value]
    );
  },
};
