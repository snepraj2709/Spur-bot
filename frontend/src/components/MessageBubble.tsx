import type { ChatMessage } from "../types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(message.timestamp));

  return (
    <article className={`message-row message-row-${message.sender}`}>
      <div className={`message-bubble message-bubble-${message.sender}`}>
        <p>{message.text}</p>
        <time>{time}</time>
      </div>
    </article>
  );
}
