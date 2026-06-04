import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { getDb } from "./client.js";

export function migrate() {
  const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");

  getDb().exec(schema);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  migrate();
  console.log("Database migration complete.");
}
