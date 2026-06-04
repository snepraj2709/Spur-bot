export type MessageSender = "user" | "ai";

export type ChatMessageInput = {
  message: string;
  sessionId?: string;
  wasTruncated: boolean;
};

export type StoredMessage = {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
};

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

export type ChatServiceResponse = {
  reply: string;
  sessionId: string;
  warning?: string;
};
