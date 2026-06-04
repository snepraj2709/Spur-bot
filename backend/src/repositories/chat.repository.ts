import { randomUUID } from "node:crypto";
import { getDb } from "../db/client.js";
import type { FaqEntry, MessageSender, StoredMessage } from "../types/chat.js";

type MessageRow = {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  text: string;
  created_at: string;
};

type FaqRow = {
  id: string;
  question: string;
  answer: string;
};

class ChatRepository {
  ensureConversation(sessionId?: string) {
    if (sessionId && this.conversationExists(sessionId)) {
      return sessionId;
    }

    return this.createConversation();
  }

  createConversation() {
    const id = randomUUID();

    getDb()
      .prepare("INSERT INTO conversations (id, created_at) VALUES (?, ?)")
      .run(id, new Date().toISOString());

    return id;
  }

  conversationExists(id: string) {
    const row = getDb()
      .prepare("SELECT id FROM conversations WHERE id = ?")
      .get(id);

    return Boolean(row);
  }

  saveMessage(
    conversationId: string,
    sender: MessageSender,
    text: string
  ): StoredMessage {
    const id = randomUUID();
    const timestamp = new Date().toISOString();

    getDb()
      .prepare(
        "INSERT INTO messages (id, conversation_id, sender, text, created_at) VALUES (?, ?, ?, ?, ?)"
      )
      .run(id, conversationId, sender, text, timestamp);

    return {
      id,
      conversationId,
      sender,
      text,
      timestamp
    };
  }

  listMessages(conversationId: string): StoredMessage[] {
    const rows = getDb()
      .prepare(
        "SELECT id, conversation_id, sender, text, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC, rowid ASC"
      )
      .all(conversationId) as MessageRow[];

    return rows.map((row) => ({
      id: row.id,
      conversationId: row.conversation_id,
      sender: row.sender,
      text: row.text,
      timestamp: row.created_at
    }));
  }

  listFaqEntries(): FaqEntry[] {
    const rows = getDb()
      .prepare("SELECT id, question, answer FROM faq_entries ORDER BY id ASC")
      .all() as FaqRow[];

    return rows.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer
    }));
  }
}

export const chatRepository = new ChatRepository();
