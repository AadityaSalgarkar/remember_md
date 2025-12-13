import Database from "@tauri-apps/plugin-sql";
import { SCHEMA } from "./schema";

let db: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!db) {
    db = await Database.load("sqlite:remember.db");
    await db.execute(SCHEMA);
  }
  return db;
}

export function generateId(): string {
  return crypto.randomUUID();
}
