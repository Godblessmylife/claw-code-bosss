"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { ChatMessageItem, TypingIndicator } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import {
  Briefcase,
  Zap,
  Bot,
  BarChart2,
  Mail,
  Database,
  Workflow,
  Plus,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "jp_business_chat_history";

const QUICK_PROMPTS = [
  { icon: Workflow,  text: "Automate my lead qualification with AI" },
  { icon: Mail,      text: "Build an AI email response system" },
  { icon: Bot,       text: "Design a customer support AI chatbot" },
  { icon: BarChart2, text: "Analyze my sales data with AI" },
  { icon: Database,  text: "Create an AI document processing pipeline" },
  { icon: Zap,       text: "Integrate AI into my existing workflow" },
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

function saveHistory(msgs: UIMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch { /* quota */ }
}

export default function BusinessPage() {
  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/business" }),
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";
  const historyLoaded = useRef(false);

  useEffect(() => {
    if (historyLoaded.current) return;
    historyLoaded.current = true;
    const saved = loadHistory();
    if (saved.length > 0) setMessages(saved);
  }, [setMessages]);

  useEffect(() => {
    if (messages.length > 0) saveHistory(messages);
  }, [messages]);

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
          <Briefcase className="w-3.5 h-3.5 text-[--accent]" />
          <span className="text-xs font-mono font-semibold text-[--foreground]">AI_BUSINESS</span>
          <span className="text-[10px] font-mono text-[--muted] border border-[--border] px-1.5 py-0.5 rounded">
            automation
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[--muted]">claude-sonnet-4-5</span>
          {messages.length > 0 && (
            <>
              <button
                onClick={() => { setMessages([]); }}
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
            {/* Icon */}
            <div className="relative flex items-center justify-center w-16 h-16 rounded border border-[--accent]/40 bg-[--accent-dim]">
              <Briefcase className="w-8 h-8 text-[--accent]" />
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full bg-[--accent] text-black text-[9px] font-bold font-mono">
                AI
              </span>
            </div>

            {/* Title */}
            <div>
              <h2 className="text-sm font-mono font-bold text-[--accent] mb-1 terminal-cursor">
                AI_BUSINESS_READY
              </h2>
              <p className="text-xs font-mono text-[--muted] leading-relaxed max-w-sm">
                {">"} AI business automation online.
                <br />
                {">"} Ask anything about automating your business.
              </p>
            </div>

            {/* Quick prompts grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full max-w-lg">
              {QUICK_PROMPTS.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => sendMessage({ text })}
                  className="flex items-center gap-2 text-left px-3 py-2.5 rounded border border-[--border] bg-[--surface] hover:border-[--accent] hover:bg-[--accent-dim] transition-colors text-[11px] font-mono text-[--muted] hover:text-[--accent]"
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[--accent]" />
                  {text}
                </button>
              ))}
            </div>

            {/* Feature chips */}
            <div className="flex flex-wrap justify-center gap-1.5 max-w-md">
              {["Workflow Design", "n8n / Zapier", "LLM Integration", "CRM Automation", "Data Pipelines", "ROI Analysis"].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full border border-[--border] text-[10px] font-mono text-[--muted]"
                >
                  {tag}
                </span>
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

      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border-t border-red-900/40 text-[11px] font-mono text-red-400 shrink-0">
          <span>{">"} ERROR: {error.message}</span>
        </div>
      )}

      <ChatInput
        onSend={(text) => sendMessage({ text })}
        disabled={isStreaming}
        placeholder="> ask about business automation, workflows, AI integration…"
      />
    </div>
  );
}
