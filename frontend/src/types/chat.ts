export type MessageSender = "user" | "ai";

export type ChatMessage = {
  id: string;
  conversationId?: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
};

export type SendMessageRequest = {
  message: string;
  sessionId?: string;
};

export type SendMessageResponse = {
  reply: string;
  sessionId: string;
  warning?: string;
};

export type SessionMessagesResponse = {
  sessionId: string;
  messages: ChatMessage[];
};
