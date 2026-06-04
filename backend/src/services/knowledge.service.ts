import { getRedisClient } from "../cache/redis.js";
import { chatRepository } from "../repositories/chat.repository.js";
import type { FaqEntry } from "../types/chat.js";

const FAQ_CACHE_KEY = "spur-bot:faq-entries";
const FAQ_CACHE_SECONDS = 300;

export async function listFaqEntries(): Promise<FaqEntry[]> {
  const cachedEntries = await readFaqCache();

  if (cachedEntries) {
    return cachedEntries;
  }

  const entries = chatRepository.listFaqEntries();
  await writeFaqCache(entries);

  return entries;
}

async function readFaqCache() {
  try {
    const redis = await getRedisClient();
    const value = await redis?.get(FAQ_CACHE_KEY);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as unknown;

    return isFaqEntryArray(parsed) ? parsed : null;
  } catch (error) {
    console.warn("FAQ cache read failed", {
      message: error instanceof Error ? error.message : "Unknown error"
    });
    return null;
  }
}

async function writeFaqCache(entries: FaqEntry[]) {
  try {
    const redis = await getRedisClient();
    await redis?.set(FAQ_CACHE_KEY, JSON.stringify(entries), {
      EX: FAQ_CACHE_SECONDS
    });
  } catch (error) {
    console.warn("FAQ cache write failed", {
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

function isFaqEntryArray(value: unknown): value is FaqEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as FaqEntry).id === "string" &&
        typeof (entry as FaqEntry).question === "string" &&
        typeof (entry as FaqEntry).answer === "string"
    )
  );
}
