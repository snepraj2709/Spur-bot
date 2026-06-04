import OpenAI from "openai";
import { env } from "../config/env.js";
import type { FaqEntry, StoredMessage } from "../types/chat.js";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  return openaiClient;
}

export async function generateReply(
  history: StoredMessage[],
  userMessage: string,
  faqEntries: FaqEntry[]
) {
  const systemPrompt = buildSystemPrompt(faqEntries);
  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map((message) => ({
      role: message.sender === "user" ? ("user" as const) : ("assistant" as const),
      content: message.text
    })),
    { role: "user" as const, content: userMessage }
  ];

  const completion = await getOpenAIClient().chat.completions.create({
    model: env.OPENAI_MODEL,
    messages,
    max_tokens: 300,
    temperature: 0.3
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    "I am sorry, I could not generate a useful answer for that."
  );
}

function buildSystemPrompt(faqEntries: FaqEntry[]) {
  const knowledge = faqEntries
    .map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
    .join("\n\n");

  return [
    "You are a helpful support agent for a small e-commerce store. Answer clearly and concisely.",
    "Use the store knowledge below when it is relevant.",
    "If the answer is not in the store knowledge, say what you can help with and avoid making up policy details.",
    "",
    knowledge
  ].join("\n");
}
