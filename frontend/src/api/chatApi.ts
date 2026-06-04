import type {
  SendMessageRequest,
  SendMessageResponse,
  SessionMessagesResponse
} from "../types/chat";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "";

export async function sendMessage(request: SendMessageRequest) {
  const response = await fetch(`${API_BASE_URL}/chat/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request)
  });

  const payload = await parseResponse<unknown>(response);

  if (!isSendMessageResponse(payload)) {
    throw new Error("The support service returned an invalid response.");
  }

  return payload;
}

export async function fetchSessionMessages(sessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/chat/session/${encodeURIComponent(sessionId)}`
  );

  const payload = await parseResponse<unknown>(response);

  if (!isSessionMessagesResponse(payload)) {
    throw new Error("Could not load the previous chat session.");
  }

  return payload;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "The support service is unavailable.");
  }

  return payload as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSendMessageResponse(value: unknown): value is SendMessageResponse {
  return (
    isRecord(value) &&
    typeof value.reply === "string" &&
    typeof value.sessionId === "string" &&
    (value.warning === undefined || typeof value.warning === "string")
  );
}

function isSessionMessagesResponse(
  value: unknown
): value is SessionMessagesResponse {
  return (
    isRecord(value) &&
    typeof value.sessionId === "string" &&
    Array.isArray(value.messages)
  );
}
