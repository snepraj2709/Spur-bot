import { useEffect, useRef, useState } from "react";
import { fetchSessionMessages, sendMessage } from "../api/chatApi";
import type { ChatMessage } from "../types/chat";
import { ChatInput } from "./ChatInput";
import { MessageList } from "./MessageList";

const SESSION_STORAGE_KEY = "spur-bot-session-id";
const PROMPTS = [
  "What is your return policy?",
  "Do you ship to USA?",
  "What are your support hours?"
];

export function ChatWidget() {
  const [sessionId, setSessionId] = useState<string | undefined>(() => {
    return window.localStorage.getItem(SESSION_STORAGE_KEY) ?? undefined;
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const didLoadSession = useRef(false);

  useEffect(() => {
    if (!sessionId || didLoadSession.current) {
      return;
    }

    didLoadSession.current = true;
    void fetchSessionMessages(sessionId)
      .then((response) => {
        setMessages(response.messages);
      })
      .catch(() => {
        window.localStorage.removeItem(SESSION_STORAGE_KEY);
        setSessionId(undefined);
        setMessages([]);
      });
  }, [sessionId]);

  async function handleSend(message: string) {
    if (isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: "user",
      text: message,
      timestamp: new Date().toISOString()
    };

    setMessages((current) => [...current, userMessage]);
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await sendMessage({ message, sessionId });

      if (response.sessionId !== sessionId) {
        window.localStorage.setItem(SESSION_STORAGE_KEY, response.sessionId);
        setSessionId(response.sessionId);
      }

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: "ai",
        text: response.reply,
        timestamp: new Date().toISOString()
      };

      setMessages((current) => [...current, aiMessage]);

      if (response.warning) {
        setError(response.warning);
      }
    } catch (sendError) {
      const messageText =
        sendError instanceof Error
          ? sendError.message
          : "The support service is unavailable.";

      setError(messageText);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          sender: "ai",
          text: messageText,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="chat-widget" aria-label="Spur support chat">
      <header className="chat-header">
        <div>
          <p className="eyebrow">Live chat</p>
          <h1>Spur Support</h1>
        </div>
        <div className="status-pill">
          <span className="status-dot" />
          Online
        </div>
      </header>

      <MessageList
        messages={messages}
        isTyping={isLoading}
        prompts={PROMPTS}
        promptsDisabled={isLoading}
        onPromptSelect={handleSend}
      />

      {error ? <p className="error-message">{error}</p> : null}

      <ChatInput disabled={isLoading} onSend={handleSend} />
    </section>
  );
}
