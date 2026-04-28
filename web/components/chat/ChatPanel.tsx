"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "@/lib/useSession";
import { ChatMessageItem, TypingIndicator } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { SessionList } from "./SessionList";
import { cn } from "@/lib/utils";
import { Wifi, WifiOff, AlertCircle, Zap, MessageSquare } from "lucide-react";

export function ChatPanel() {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    isConnected,
    isSending,
    error,
    startNewSession,
    send,
  } = useSession();

  const [isCreating, setIsCreating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewSession = async () => {
    setIsCreating(true);
    await startNewSession();
    setIsCreating(false);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Session sidebar */}
      <SessionList
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={setActiveSessionId}
        onNew={handleNewSession}
        isCreating={isCreating}
      />

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[--border] bg-[--surface] shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[--muted]" />
            <span className="text-sm font-medium text-[--foreground]">
              {activeSessionId ?? "No session selected"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {activeSessionId && (
              <>
                {isConnected ? (
                  <Wifi className="w-3.5 h-3.5 text-[--success]" />
                ) : (
                  <WifiOff className="w-3.5 h-3.5 text-[--muted]" />
                )}
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    isConnected ? "text-[--success]" : "text-[--muted]"
                  )}
                >
                  {isConnected ? "live" : "offline"}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!activeSessionId ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[--accent-dim] border border-[--accent]/20">
                <Zap className="w-7 h-7 text-[--accent]" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-[--foreground] mb-1">
                  Welcome to Claw Code
                </h2>
                <p className="text-sm text-[--muted] leading-relaxed max-w-sm">
                  An open-source AI coding agent. Start a new session to begin
                  chatting with Claude.
                </p>
              </div>
              <button
                onClick={handleNewSession}
                disabled={isCreating}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--accent] text-white text-sm font-medium hover:bg-[--accent-hover] transition-colors disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                {isCreating ? "Creating…" : "New Session"}
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
              <Zap className="w-8 h-8 text-[--accent]" />
              <p className="text-sm text-[--muted]">
                Session ready. Send a message to begin.
              </p>
            </div>
          ) : (
            <div className="py-2">
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} message={msg} />
              ))}
              {isSending && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-950/30 border-t border-red-900/40 text-xs text-red-400 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Input */}
        <ChatInput
          onSend={send}
          disabled={!activeSessionId || isSending}
          placeholder={
            activeSessionId
              ? "Ask Claw anything…"
              : "Select or create a session first"
          }
        />
      </div>
    </div>
  );
}
