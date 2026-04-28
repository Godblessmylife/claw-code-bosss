"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  };

  return (
    <div className="px-4 py-3 border-t border-[--border] bg-[--surface]">
      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border bg-[--surface-raised] px-3 py-2 transition-colors",
          disabled
            ? "border-[--border-subtle] opacity-60"
            : "border-[--border] focus-within:border-[--accent]"
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          disabled={disabled}
          rows={1}
          placeholder={placeholder ?? "Ask Claw anything… (Enter to send, Shift+Enter for newline)"}
          className="flex-1 resize-none bg-transparent text-sm text-[--foreground] placeholder:text-[--muted] outline-none leading-relaxed min-h-[24px] max-h-[200px] py-0.5 font-mono"
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0",
            value.trim() && !disabled
              ? "bg-[--accent] text-white hover:bg-[--accent-hover]"
              : "bg-[--border] text-[--muted] cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          {disabled ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <p className="text-[10px] font-mono text-[--muted] mt-1.5 px-1">
        {'> JP Code AI · Shift+Enter for newline'}
      </p>
    </div>
  );
}
