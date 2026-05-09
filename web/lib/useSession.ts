"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  createSession,
  sendMessage,
  streamSessionEvents,
  type ConversationMessage,
  type SessionSummary,
  listSessions,
} from "@/lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  text: string;
  toolName?: string;
  isError?: boolean;
  timestamp: number;
}

function blocksToText(msg: ConversationMessage): string {
  return msg.blocks
    .map((b) => {
      if (b.type === "text") return b.text ?? "";
      if (b.type === "tool_use")
        return `[Tool: ${b.name ?? "unknown"}]\n${b.input ?? ""}`;
      if (b.type === "tool_result")
        return `[Result: ${b.tool_name ?? "unknown"}]\n${b.output ?? ""}`;
      return "";
    })
    .join("\n")
    .trim();
}

export function useSession() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sseRef = useRef<EventSource | null>(null);
  const msgCounterRef = useRef(0);

  // Load sessions list
  const refreshSessions = useCallback(async () => {
    try {
      const list = await listSessions();
      setSessions(list);
    } catch {
      // Backend not running — show empty state
    }
  }, []);

  useEffect(() => {
    void refreshSessions();
  }, [refreshSessions]);

  // Connect SSE for active session
  useEffect(() => {
    if (!activeSessionId) return;

    sseRef.current?.close();
    setIsConnected(false);
    setMessages([]);

    const source = streamSessionEvents(
      activeSessionId,
      (type, data) => {
        setIsConnected(true);
        if (type === "snapshot") {
          const d = data as { session: { messages: ConversationMessage[] } };
          const msgs: ChatMessage[] = d.session.messages.map((m, i) => ({
            id: `hist-${i}`,
            role: m.role,
            text: blocksToText(m),
            timestamp: Date.now() - (d.session.messages.length - i) * 1000,
          }));
          setMessages(msgs);
        } else if (type === "message") {
          const d = data as {
            message: ConversationMessage;
            session_id: string;
          };
          const msg = d.message;
          setMessages((prev) => [
            ...prev,
            {
              id: `live-${msgCounterRef.current++}`,
              role: msg.role,
              text: blocksToText(msg),
              timestamp: Date.now(),
            },
          ]);
        }
      },
      () => {
        setIsConnected(false);
      }
    );

    sseRef.current = source;
    return () => {
      source.close();
      setIsConnected(false);
    };
  }, [activeSessionId]);

  const startNewSession = useCallback(async () => {
    try {
      setError(null);
      const res = await createSession();
      await refreshSessions();
      setActiveSessionId(res.session_id);
      return res.session_id;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create session");
      return null;
    }
  }, [refreshSessions]);

  const send = useCallback(
    async (text: string) => {
      if (!activeSessionId || isSending) return;
      setIsSending(true);
      setError(null);
      // Optimistically add user message
      setMessages((prev) => [
        ...prev,
        {
          id: `opt-${msgCounterRef.current++}`,
          role: "user",
          text,
          timestamp: Date.now(),
        },
      ]);
      try {
        await sendMessage(activeSessionId, text);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send message");
      } finally {
        setIsSending(false);
      }
    },
    [activeSessionId, isSending]
  );

  return {
    sessions,
    activeSessionId,
    setActiveSessionId,
    messages,
    isConnected,
    isSending,
    error,
    startNewSession,
    send,
    refreshSessions,
  };
}
