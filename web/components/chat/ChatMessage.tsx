"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { Zap, User, Wrench, Copy, Check } from "lucide-react";
import { useState } from "react";

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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-[--border] bg-[--surface] text-[--muted] hover:text-[--accent] hover:border-[--accent] text-[10px] font-mono transition-colors"
      aria-label="Copy code"
    >
      {copied ? <Check className="w-3 h-3 text-[--accent]" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const lang = className?.replace("language-", "") ?? "text";
  return (
    <div className="relative group my-2">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[--surface-raised] border border-b-0 border-[--border] rounded-t text-[10px] font-mono text-[--muted]">
        <span>{lang}</span>
      </div>
      <div className="relative">
        <CopyButton text={children} />
        <pre className="bg-[--surface-raised] border border-[--border] border-l-2 border-l-[--accent] rounded-b px-4 py-3 overflow-x-auto">
          <code className="text-xs font-mono text-[--foreground] leading-relaxed">
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}

export function ChatMessageItem({ message }: Props) {
  const isUser = message.role === "user";
  const text = getMessageText(message);

  return (
    <div className={cn("flex gap-3 px-4 py-3 animate-fade-in", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5",
          isUser
            ? "bg-[--surface-raised] text-[--foreground] border border-[--border]"
            : "bg-[--accent-dim] text-[--accent] border border-[--accent]/30"
        )}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "rounded-xl px-3.5 py-2.5 max-w-[82%]",
          isUser
            ? "bg-[--surface-raised] border border-[--border-subtle]"
            : "bg-[--surface] border border-[--border]"
        )}
      >
        <div className="prose-chat text-[--foreground]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const isBlock = className?.startsWith("language-");
                if (isBlock) {
                  return (
                    <CodeBlock className={className}>
                      {String(children).replace(/\n$/, "")}
                    </CodeBlock>
                  );
                }
                return (
                  <code
                    className="text-xs font-mono bg-[--surface-raised] border border-[--border] rounded px-1 py-0.5 text-[--accent]"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
              pre({ children }) {
                return <>{children}</>;
              },
              p({ children }) {
                return <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>;
              },
              li({ children }) {
                return <li className="text-xs leading-relaxed">{children}</li>;
              },
              h1({ children }) {
                return <h1 className="text-sm font-bold text-[--accent] mb-2 mt-1">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-xs font-bold text-[--accent] mb-1.5 mt-1">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-xs font-semibold text-[--foreground] mb-1 mt-1">{children}</h3>;
              },
              blockquote({ children }) {
                return (
                  <blockquote className="border-l-2 border-[--accent] pl-3 text-[--muted] italic my-2">
                    {children}
                  </blockquote>
                );
              },
              strong({ children }) {
                return <strong className="font-bold text-[--accent]">{children}</strong>;
              },
              a({ href, children }) {
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[--accent] underline hover:opacity-80"
                  >
                    {children}
                  </a>
                );
              },
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
        <div
          className={cn(
            "text-[10px] mt-1.5 text-[--muted] font-mono",
            isUser ? "text-right" : "text-left"
          )}
        >
          {isUser ? "> you" : "> jp_code"}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5 text-[--accent] bg-[--accent-dim] border border-[--accent]/30">
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
        Running <span className="text-[--accent]">{name}</span>
      </div>
    </div>
  );
}
