"use client";

import { cn } from "@/lib/utils";
import type { SessionSummary } from "@/lib/api";
import { MessageSquare, Plus, Clock } from "lucide-react";

interface Props {
  sessions: SessionSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  isCreating?: boolean;
}

function relativeTime(ms: number): string {
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function SessionList({
  sessions,
  activeId,
  onSelect,
  onNew,
  isCreating,
}: Props) {
  return (
    <div className="flex flex-col h-full border-r border-[--border] bg-[--surface] w-[220px] shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-[--border]">
        <span className="text-xs font-semibold text-[--muted] uppercase tracking-widest">
          Sessions
        </span>
        <button
          onClick={onNew}
          disabled={isCreating}
          className="flex items-center justify-center w-6 h-6 rounded border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:text-[--accent] text-[--muted] transition-colors disabled:opacity-40"
          aria-label="New session"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <MessageSquare className="w-6 h-6 text-[--muted]" />
            <p className="text-xs text-[--muted]">No sessions yet</p>
            <button
              onClick={onNew}
              className="text-xs text-[--accent] hover:underline"
            >
              Start one
            </button>
          </div>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className={cn(
                "w-full text-left flex flex-col gap-0.5 px-3 py-2.5 transition-colors",
                s.id === activeId
                  ? "bg-[--accent-dim] border-l-2 border-[--accent]"
                  : "border-l-2 border-transparent hover:bg-[--surface-raised]"
              )}
            >
              <span
                className={cn(
                  "text-xs font-medium truncate",
                  s.id === activeId ? "text-[--accent]" : "text-[--foreground]"
                )}
              >
                {s.id}
              </span>
              <div className="flex items-center gap-1.5 text-[10px] text-[--muted]">
                <Clock className="w-2.5 h-2.5" />
                <span>{relativeTime(s.created_at)}</span>
                <span>·</span>
                <span>{s.message_count} msg</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
