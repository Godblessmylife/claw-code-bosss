"use client";

import { useEffect, useRef, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useSearchParams } from "next/navigation";
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

// ── Platform config ───────────────────────────────────────────────────────────

const PLATFORMS: Record<
  string,
  { label: string; color: string; prompts: { icon: typeof Zap; text: string }[] }
> = {
  facebook: {
    label: "Facebook",
    color: "#1877F2",
    prompts: [
      { icon: Bot,       text: "Build a Facebook Messenger AI chatbot" },
      { icon: Mail,      text: "Automate Facebook page post scheduling" },
      { icon: BarChart2, text: "Analyze Facebook Ads performance with AI" },
      { icon: Zap,       text: "Auto-reply to Facebook comments with AI" },
    ],
  },
  twitter: {
    label: "Twitter / X",
    color: "#1DA1F2",
    prompts: [
      { icon: Bot,      text: "Create an AI Twitter/X posting agent" },
      { icon: Zap,      text: "Auto-generate tweet threads with AI" },
      { icon: BarChart2,text: "Analyze Twitter engagement with AI" },
      { icon: Mail,     text: "Auto-DM leads on Twitter with AI" },
    ],
  },
  youtube: {
    label: "YouTube",
    color: "#FF0000",
    prompts: [
      { icon: Bot,       text: "Generate YouTube video scripts with AI" },
      { icon: Workflow,  text: "Auto-create YouTube Shorts from long videos" },
      { icon: BarChart2, text: "Analyze YouTube channel performance with AI" },
      { icon: Mail,      text: "Auto-reply to YouTube comments with AI" },
    ],
  },
  instagram: {
    label: "Instagram",
    color: "#E1306C",
    prompts: [
      { icon: Bot,       text: "Create an Instagram DM automation AI" },
      { icon: Zap,       text: "Generate Instagram captions with AI" },
      { icon: BarChart2, text: "Analyze Instagram Reels performance" },
      { icon: Workflow,  text: "Schedule Instagram posts with AI workflows" },
    ],
  },
  tiktok: {
    label: "TikTok",
    color: "#69C9D0",
    prompts: [
      { icon: Bot,       text: "Generate viral TikTok scripts with AI" },
      { icon: Zap,       text: "Build TikTok content calendar automation" },
      { icon: BarChart2, text: "Analyze TikTok trends with AI" },
      { icon: Workflow,  text: "Auto-post TikTok content via API" },
    ],
  },
  kick: {
    label: "Kick",
    color: "#53FC18",
    prompts: [
      { icon: Bot,       text: "Build a Kick.com stream chatbot with AI" },
      { icon: Zap,       text: "Auto-moderate Kick stream chat with AI" },
      { icon: BarChart2, text: "Analyze Kick stream metrics with AI" },
      { icon: Workflow,  text: "Automate Kick stream alerts and overlays" },
    ],
  },
};

const DEFAULT_PROMPTS = [
  { icon: Workflow,  text: "Automate my lead qualification with AI" },
  { icon: Mail,      text: "Build an AI email response system" },
  { icon: Bot,       text: "Design a customer support AI chatbot" },
  { icon: BarChart2, text: "Analyze my sales data with AI" },
  { icon: Database,  text: "Create an AI document processing pipeline" },
  { icon: Zap,       text: "Integrate AI into my existing workflow" },
];

// ── Storage ───────────────────────────────────────────────────────────────────

function storageKey(platform: string | null) {
  return platform ? `jp_business_${platform}` : "jp_business_chat_history";
}

function loadHistory(platform: string | null): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(platform));
    return raw ? (JSON.parse(raw) as UIMessage[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: UIMessage[], platform: string | null) {
  try {
    localStorage.setItem(storageKey(platform), JSON.stringify(msgs));
  } catch { /* quota */ }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BusinessPage() {
  const searchParams = useSearchParams();
  const platform = searchParams.get("platform");
  const platformCfg = platform ? PLATFORMS[platform] ?? null : null;

  const { messages, sendMessage, setMessages, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/business" }),
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";
  const historyLoaded = useRef<string | null>("__unset__");

  // Reload history whenever platform changes
  useEffect(() => {
    if (historyLoaded.current === platform) return;
    historyLoaded.current = platform;
    const saved = loadHistory(platform);
    setMessages(saved.length > 0 ? saved : []);
  }, [platform, setMessages]);

  useEffect(() => {
    if (messages.length > 0) saveHistory(messages, platform);
  }, [messages, platform]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearHistory = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(storageKey(platform));
  }, [setMessages, platform]);

  const quickPrompts = platformCfg ? platformCfg.prompts : DEFAULT_PROMPTS;
  const title = platformCfg ? `AI_BUSINESS_${platform!.toUpperCase()}` : "AI_BUSINESS_READY";
  const subtitle = platformCfg
    ? `> ${platformCfg.label} automation online.\n> Ask anything about ${platformCfg.label}.`
    : "> AI business automation online.\n> Ask anything about automating your business.";
  const accentColor = platformCfg ? platformCfg.color : "var(--accent)";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[--border] bg-[--surface] shrink-0">
        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-[--accent]" />
          <span className="text-xs font-mono font-semibold text-[--foreground]">
            {platformCfg ? platformCfg.label.toUpperCase() : "AI_BUSINESS"}
          </span>
          {platformCfg && (
            <span
              className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
              style={{ color: accentColor, borderColor: accentColor + "60" }}
            >
              connected
            </span>
          )}
          {!platformCfg && (
            <span className="text-[10px] font-mono text-[--muted] border border-[--border] px-1.5 py-0.5 rounded">
              automation
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[--muted]">claude-sonnet-4-5</span>
          {messages.length > 0 && (
            <>
              <button
                onClick={() => setMessages([])}
                title="New session"
                className="flex items-center gap-1 px-2 py-1 rounded border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:text-[--accent] text-[--muted] text-[10px] font-mono transition-colors"
              >
                <Plus className="w-3 h-3" />
                New
              </button>
              <button
                onClick={clearHistory}
                title="Clear history"
                className="flex items-center gap-1 px-2 py-1 rounded border border-[--border] bg-[--surface-raised] hover:border-red-500 hover:text-red-400 text-[--muted] text-[10px] font-mono transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </>
          )}
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-5 px-8 text-center">
            {/* Icon */}
            <div
              className="relative flex items-center justify-center w-16 h-16 rounded border"
              style={{ borderColor: accentColor + "60", backgroundColor: accentColor + "15" }}
            >
              <Briefcase className="w-8 h-8" style={{ color: accentColor }} />
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 rounded-full text-black text-[9px] font-bold font-mono"
                style={{ backgroundColor: accentColor }}>
                AI
              </span>
            </div>

            {/* Title */}
            <div>
              <h2
                className="text-sm font-mono font-bold mb-1 terminal-cursor"
                style={{ color: accentColor }}
              >
                {title}
              </h2>
              <p className="text-xs font-mono text-[--muted] leading-relaxed max-w-sm">
                {subtitle.split("\n").map((line, i) => (
                  <span key={i}>{line}{i < subtitle.split("\n").length - 1 && <br />}</span>
                ))}
              </p>
            </div>

            {/* Quick prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 w-full max-w-lg">
              {quickPrompts.map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => sendMessage({ text })}
                  className="flex items-center gap-2 text-left px-3 py-2.5 rounded border border-[--border] bg-[--surface] hover:bg-[--surface-raised] transition-colors text-[11px] font-mono text-[--muted] hover:text-[--foreground]"
                  style={{ ["--hover-border" as string]: accentColor }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: accentColor }} />
                  {text}
                </button>
              ))}
            </div>

            {/* Feature chips */}
            {!platformCfg && (
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
            )}
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
        placeholder={
          platformCfg
            ? `> ask about ${platformCfg.label} automation…`
            : "> ask about business automation, workflows, AI integration…"
        }
      />
    </div>
  );
}
