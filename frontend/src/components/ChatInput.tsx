import { Send } from "lucide-react";
import { FormEvent, KeyboardEvent, useState } from "react";

type ChatInputProps = {
  disabled: boolean;
  onSend: (message: string) => void;
};

export function ChatInput({ disabled, onSend }: ChatInputProps) {
  const [value, setValue] = useState("");

  function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    const message = value.trim();

    if (!message || disabled) {
      return;
    }

    onSend(message);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      submit();
    }
  }

  return (
    <form className="chat-input" onSubmit={submit}>
      <textarea
        aria-label="Message"
        disabled={disabled}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your order"
        rows={1}
        value={value}
      />
      <button disabled={disabled || !value.trim()} type="submit">
        <Send aria-hidden="true" size={18} strokeWidth={2.3} />
        <span>Send</span>
      </button>
    </form>
  );
}
