"use client";

import { useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChatMessageItem, TypingIndicator } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Shield, MessageSquare, Terminal } from "lucide-react";

const QUICK_PROMPTS = [
  "Write a Rust HTTP server with Axum",
  "Explain async/await in Rust",
  "Review my code for security issues",
  "Write unit tests for this function",
];

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
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[--border] bg-[--surface] shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-[--muted]" />
          <span className="text-xs font-mono font-semibold text-[--foreground]">AI_CHAT</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[--accent] animate-pulse" />
          <span className="text-[10px] font-mono text-[--muted]">claude-opus-4-6</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
            <div className="relative flex items-center justify-center w-16 h-16 rounded border border-[--accent]/40 bg-[--accent-dim]">
              <Shield className="w-8 h-8 text-[--accent]" />
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[--accent] text-black text-[9px] font-bold font-mono">AI</span>
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-[--accent] mb-1 terminal-cursor">
                JP_CODE_READY
              </h2>
              <p className="text-xs font-mono text-[--muted] leading-relaxed max-w-sm">
                {'> AI coding assistant online.'}<br />
                {'> Ask anything about code.'}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-1.5 w-full max-w-sm">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage({ text: prompt })}
                  className="flex items-center gap-2 text-left px-3 py-2 rounded border border-[--border] bg-[--surface] hover:border-[--accent] hover:bg-[--accent-dim] transition-colors text-[11px] font-mono text-[--muted] hover:text-[--accent]"
                >
                  <Terminal className="w-3 h-3 shrink-0" />
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
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border-t border-red-900/40 text-[11px] font-mono text-red-400 shrink-0">
          <span>{'> ERROR: '}{error.message}</span>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSend={(text) => sendMessage({ text })}
        disabled={isStreaming}
        placeholder="> enter command..."
      />
    </div>
  );
}
