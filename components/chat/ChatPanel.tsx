"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessageItem, TypingIndicator } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Zap, MessageSquare } from "lucide-react";

export function ChatPanel() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Topbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[--border] bg-[--surface] shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-[--muted]" />
          <span className="text-sm font-medium text-[--foreground]">AI Chat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[--success] animate-pulse" />
          <span className="text-[11px] font-mono text-[--success]">claude-opus-4-6</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[--accent-dim] border border-[--accent]/20">
              <Zap className="w-7 h-7 text-[--accent]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[--foreground] mb-1">
                Welcome to Claw Code
              </h2>
              <p className="text-sm text-[--muted] leading-relaxed max-w-sm">
                An open-source AI coding agent powered by Claude. Ask anything
                about code — write, review, debug, explain.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {[
                "Write a Rust HTTP server",
                "Explain async/await in Rust",
                "Review my code for bugs",
                "Write unit tests for this function",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage({ text: prompt })}
                  className="text-left px-3 py-2 rounded-lg border border-[--border] bg-[--surface] hover:border-[--accent] hover:bg-[--accent-dim] transition-colors text-xs text-[--muted] hover:text-[--accent]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-2">
            {messages.map((msg) => (
              <ChatMessageItem key={msg.id} message={msg} />
            ))}
            {isStreaming && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border-t border-red-900/40 text-xs text-red-400 shrink-0">
          <span>{error.message}</span>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={(text) => sendMessage({ text })}
        disabled={isStreaming}
        placeholder="Ask Claw anything… (Enter to send, Shift+Enter for newline)"
      />
    </div>
  );
}
