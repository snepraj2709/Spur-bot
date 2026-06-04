import { z } from "zod";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/error.middleware.js";
import type { ChatMessageInput } from "../types/chat.js";

const chatInputSchema = z.object({
  message: z.string(),
  sessionId: z.string().optional()
});

export function normalizeChatInput(body: unknown): ChatMessageInput {
  const parsed = chatInputSchema.safeParse(body);

  if (!parsed.success) {
    throw new HttpError(400, "message is required.", parsed.error.flatten());
  }

  const message = parsed.data.message.trim();

  if (!message) {
    throw new HttpError(400, "message cannot be empty.");
  }

  const wasTruncated = message.length > env.MAX_MESSAGE_CHARS;

  return {
    message: wasTruncated ? message.slice(0, env.MAX_MESSAGE_CHARS) : message,
    sessionId: parsed.data.sessionId?.trim() || undefined,
    wasTruncated
  };
}
