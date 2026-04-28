"use client";

import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { Zap, User, Wrench } from "lucide-react";

interface Props {
  message: UIMessage;
}

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function formatText(text: string): React.ReactNode {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="bg-[--surface-raised] border border-[--border] rounded-md px-3.5 py-3 my-2 overflow-x-auto"
          >
            <code className="text-xs font-mono text-[--foreground] leading-relaxed">
              {codeLines.join("\n")}
            </code>
          </pre>
        );
        codeLines = [];
        codeLang = "";
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        void codeLang;
      }
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else {
      const parts = line.split(/(`[^`]+`)/g);
      const rendered = parts.map((part, j) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code
            key={j}
            className="text-xs font-mono bg-[--surface-raised] border border-[--border] rounded px-1 py-0.5 text-[--accent]"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <span key={j}>{part}</span>
        )
      );
      elements.push(
        <span key={`line-${i}`} className="block min-h-[1em]">
          {rendered}
        </span>
      );
    }
  }

  if (inCodeBlock && codeLines.length > 0) {
    elements.push(
      <pre
        key="code-unclosed"
        className="bg-[--surface-raised] border border-[--border] rounded-md px-3.5 py-3 my-2 overflow-x-auto"
      >
        <code className="text-xs font-mono text-[--foreground] leading-relaxed">
          {codeLines.join("\n")}
        </code>
      </pre>
    );
  }

  return <>{elements}</>;
}

export function ChatMessageItem({ message }: Props) {
  const isUser = message.role === "user";
  const text = getMessageText(message);

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5",
          isUser
            ? "bg-[--surface-raised] text-[--foreground]"
            : "bg-[--accent-dim] text-[--accent]"
        )}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5" />
        ) : (
          <Zap className="w-3.5 h-3.5" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[80%]",
          isUser
            ? "bg-[--surface-raised] border border-[--border-subtle]"
            : "bg-[--surface] border border-[--border]"
        )}
      >
        <div className="prose-chat text-[--foreground]">
          {formatText(text)}
        </div>
        <div
          className={cn(
            "text-[10px] mt-1.5 text-[--muted]",
            isUser ? "text-right" : "text-left"
          )}
        >
          {isUser ? "You" : "Claw"}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 text-[--accent] bg-[--accent-dim]">
        <Zap className="w-3.5 h-3.5" />
      </div>
      <div className="rounded-xl px-3.5 py-3 bg-[--surface] border border-[--border]">
        <div className="flex items-center gap-1 h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="typing-dot w-1.5 h-1.5 rounded-full bg-[--muted]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ToolCallIndicator({ name }: { name: string }) {
  return (
    <div className="flex gap-3 px-4 py-2">
      <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 bg-[--surface-raised] text-[--muted]">
        <Wrench className="w-3.5 h-3.5" />
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[--border] bg-[--surface-raised] text-xs text-[--muted] font-mono">
        Running <span className="text-[--accent]">{name}</span>…
      </div>
    </div>
  );
}
