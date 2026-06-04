import { env } from "../config/env.js";
import { HttpError } from "../middleware/error.middleware.js";
import { chatRepository } from "../repositories/chat.repository.js";
import type { ChatMessageInput, ChatServiceResponse } from "../types/chat.js";
import { listFaqEntries } from "./knowledge.service.js";
import { generateReply } from "./llm.service.js";

const LLM_FAILURE_REPLY =
  "Sorry, I am having trouble connecting to the support agent right now. Please try again in a moment.";

export async function sendChatMessage(
  input: ChatMessageInput
): Promise<ChatServiceResponse> {
  const sessionId = chatRepository.ensureConversation(input.sessionId);
  const history = chatRepository
    .listMessages(sessionId)
    .slice(-env.MAX_HISTORY_MESSAGES);
  const faqEntries = await listFaqEntries();

  chatRepository.saveMessage(sessionId, "user", input.message);

  let reply = LLM_FAILURE_REPLY;

  if (env.OPENAI_API_KEY) {
    try {
      reply = await generateReply(history, input.message, faqEntries);
    } catch (error) {
      console.error("LLM generation failed", {
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }

  chatRepository.saveMessage(sessionId, "ai", reply);

  return {
    reply,
    sessionId,
    warning: input.wasTruncated
      ? `Your message was shortened to ${env.MAX_MESSAGE_CHARS} characters.`
      : undefined
  };
}

export function getConversationHistory(sessionId: string) {
  if (!sessionId?.trim()) {
    throw new HttpError(400, "sessionId is required.");
  }

  return {
    sessionId,
    messages: chatRepository.listMessages(sessionId)
  };
}
