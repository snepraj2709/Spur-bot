const { randomUUID } = require("node:crypto");

const FALLBACK_REPLY =
  "Sorry, I am having trouble connecting to the support agent right now. Please try again in a moment.";

const faqEntries = [
  {
    question: "What is your return policy?",
    answer:
      "Customers can return eligible items within 30 days of delivery. Refunds are processed after the returned item is inspected."
  },
  {
    question: "Do you ship to USA?",
    answer:
      "We offer standard shipping in 3-5 business days and express shipping in 1-2 business days. We currently ship across India and to the USA."
  },
  {
    question: "What are your support hours?",
    answer:
      "Support is available Monday to Friday, 9:00 AM to 6:00 PM IST."
  }
];

const conversations =
  globalThis.__spurBotConversations ||
  (globalThis.__spurBotConversations = new Map());

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function methodNotAllowed(res, allowedMethods) {
  res.setHeader("Allow", allowedMethods.join(", "));
  sendJson(res, 405, { error: "Method not allowed." });
}

async function parseJsonBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return JSON.parse(req.body || "{}");
  }

  let rawBody = "";

  for await (const chunk of req) {
    rawBody += chunk;
  }

  return rawBody ? JSON.parse(rawBody) : {};
}

function normalizeMessage(body) {
  const maxChars = Number.parseInt(process.env.MAX_MESSAGE_CHARS || "4000", 10);
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (!message) {
    return { error: "message cannot be empty." };
  }

  const wasTruncated = message.length > maxChars;

  return {
    message: wasTruncated ? message.slice(0, maxChars) : message,
    sessionId:
      typeof body.sessionId === "string" && body.sessionId.trim()
        ? body.sessionId.trim()
        : undefined,
    wasTruncated,
    maxChars
  };
}

function ensureConversation(sessionId) {
  if (sessionId && conversations.has(sessionId)) {
    return sessionId;
  }

  const id = randomUUID();
  conversations.set(id, {
    id,
    createdAt: new Date().toISOString(),
    messages: []
  });

  return id;
}

function getConversation(sessionId) {
  return conversations.get(sessionId);
}

function listMessages(sessionId) {
  return getConversation(sessionId)?.messages || [];
}

function saveMessage(sessionId, sender, text) {
  const conversation = getConversation(sessionId);
  const message = {
    id: randomUUID(),
    conversationId: sessionId,
    sender,
    text,
    timestamp: new Date().toISOString()
  };

  conversation.messages.push(message);

  return message;
}

async function generateReply(history, userMessage) {
  if (!process.env.OPENAI_API_KEY) {
    return FALLBACK_REPLY;
  }

  try {
    const OpenAI = require("openai").default || require("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const knowledge = faqEntries
      .map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
      .join("\n\n");
    const messages = [
      {
        role: "system",
        content: [
          "You are a helpful support agent for a small e-commerce store. Answer clearly and concisely.",
          "Use the store knowledge below when it is relevant.",
          "If the answer is not in the store knowledge, say what you can help with and avoid making up policy details.",
          "",
          knowledge
        ].join("\n")
      },
      ...history.map((message) => ({
        role: message.sender === "user" ? "user" : "assistant",
        content: message.text
      })),
      { role: "user", content: userMessage }
    ];

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      messages,
      max_tokens: 300,
      temperature: 0.3
    });

    return completion.choices[0]?.message?.content?.trim() || FALLBACK_REPLY;
  } catch (error) {
    console.error("LLM generation failed", {
      name: error?.name,
      status: error?.status
    });
    return FALLBACK_REPLY;
  }
}

module.exports = {
  ensureConversation,
  generateReply,
  listMessages,
  methodNotAllowed,
  normalizeMessage,
  parseJsonBody,
  saveMessage,
  sendJson
};
