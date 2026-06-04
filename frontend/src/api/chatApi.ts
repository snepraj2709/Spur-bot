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

  return parseResponse<SendMessageResponse>(response);
}

export async function fetchSessionMessages(sessionId: string) {
  const response = await fetch(
    `${API_BASE_URL}/chat/session/${encodeURIComponent(sessionId)}`
  );

  return parseResponse<SessionMessagesResponse>(response);
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "The support service is unavailable.");
  }

  return payload as T;
}
