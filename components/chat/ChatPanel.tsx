"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { ChatMessageItem, TypingIndicator } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Shield, MessageSquare, Terminal, Plus, Trash2, Briefcase, ArrowRight } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "jp_code_chat_history";

const QUICK_PROMPTS = [
  "Write a Rust HTTP server with Axum",
  "Explain async/await in Rust",
  "Review my code for security issues",
  "Write unit tests for this function",
];

function loadHistory(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(messages: UIMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // quota exceeded — ignore
  }
}

export function ChatPanel() {
  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";
  const historyLoaded = useRef(false);

  // Load history once on mount
  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;
    const saved = loadHistory();
    if (saved.length > 0) setMessages(saved);
  }, [setMessages]);

  // Persist to localStorage on every message update
  useEffect(() => {
    if (messages.length > 0) saveHistory(messages);
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [setMessages]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[--border] bg-[--surface] shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-[--muted]" />
          <span className="text-xs font-mono font-semibold text-[--foreground]">AI_CHAT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[--muted]">claude-sonnet-4-5</span>
          {messages.length > 0 && (
            <>
              <button
                onClick={() => sendMessage({ text: "" })}
                title="New session"
                className="flex items-center gap-1 px-2 py-1 rounded border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:text-[--accent] text-[--muted] text-[10px] font-mono transition-colors"
              >
                <Plus className="w-3 h-3" />
                New
              </button>
              <button
                onClick={clearHistory}
                title="Clear history"
                className="flex items-center gap-1 px-2 py-1 rounded border border-[--border] bg-[--surface-raised] hover:border-[--destructive] hover:text-[--destructive] text-[--muted] text-[10px] font-mono transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
          <span className="w-1.5 h-1.5 rounded-full bg-[--accent] animate-pulse" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
            <div className="relative flex items-center justify-center w-16 h-16 rounded border border-[--accent]/40 bg-[--accent-dim]">
              <Shield className="w-8 h-8 text-[--accent]" />
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[--accent] text-black text-[9px] font-bold font-mono">
                AI
              </span>
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-[--accent] mb-1 terminal-cursor">
                JP_CODE_READY
              </h2>
              <p className="text-xs font-mono text-[--muted] leading-relaxed max-w-sm">
                {">"} AI coding assistant online.
                <br />
                {">"} Ask anything about code.
                <br />
                {">"} AI business automation available.
              </p>
              <Link
                href="/business"
                className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded border border-[--accent]/50 bg-[--accent-dim] hover:bg-[--accent]/20 hover:border-[--accent] transition-colors text-[11px] font-mono text-[--accent]"
              >
                <Briefcase className="w-3 h-3" />
                Open AI Business Automation
                <ArrowRight className="w-3 h-3" />
              </Link>
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
          <span>{">"} ERROR: {error.message}</span>
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
