import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types/chat";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";

type MessageListProps = {
  messages: ChatMessage[];
  isTyping: boolean;
  prompts: string[];
  promptsDisabled: boolean;
  onPromptSelect: (prompt: string) => void;
};

export function MessageList({
  messages,
  isTyping,
  prompts,
  promptsDisabled,
  onPromptSelect
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  return (
    <div className="message-list">
      {messages.length === 0 ? (
        <div className="empty-state">
          <p>Ask about shipping, returns, refunds, or support hours.</p>
          <div className="prompt-row">
            {prompts.map((prompt) => (
              <button
                className="prompt-chip"
                disabled={promptsDisabled}
                key={prompt}
                type="button"
                onClick={() => onPromptSelect(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}

      {isTyping ? <TypingIndicator /> : null}
      <div ref={endRef} />
    </div>
  );
}
