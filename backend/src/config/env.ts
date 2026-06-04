import "dotenv/config";
import { z } from "zod";

const optionalString = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().optional()
);

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_PATH: z.string().default("data/spur-bot.sqlite"),
  REDIS_URL: optionalString,
  OPENAI_API_KEY: optionalString,
  OPENAI_MODEL: z.string().default("gpt-4.1-mini"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  MAX_MESSAGE_CHARS: z.coerce.number().int().positive().default(4000),
  MAX_HISTORY_MESSAGES: z.coerce.number().int().positive().default(12)
});

export const env = envSchema.parse(process.env);
