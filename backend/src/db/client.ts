import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { env } from "../config/env.js";

let db: Database.Database | null = null;

export function getDb() {
  if (!db) {
    const databasePath = resolve(env.DATABASE_PATH);

    mkdirSync(dirname(databasePath), { recursive: true });
    db = new Database(databasePath);
    db.pragma("journal_mode = WAL");
  }

  return db;
}
