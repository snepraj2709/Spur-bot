import { createClient } from "redis";
import { env } from "../config/env.js";

let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!env.REDIS_URL) {
    return null;
  }

  if (!client) {
    client = createClient({ url: env.REDIS_URL });
    client.on("error", (error) => {
      console.error("Redis connection error", error);
    });
    await client.connect();
  }

  return client;
}
