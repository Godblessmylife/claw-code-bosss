"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { cn } from "@/lib/utils";
import {
  Send,
  Loader2,
  Code2,
  FileText,
  Terminal,
  Eye,
  Zap,
  ChevronRight,
  Copy,
  Check,
  Plus,
  FolderOpen,
  RotateCcw,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface CodeFile {
  name: string;
  language: string;
  content: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getMessageText(msg: UIMessage): string {
  if (!msg.parts || !Array.isArray(msg.parts)) return "";
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/** Parse all ```lang ... ``` blocks from a text into CodeFile objects */
function parseCodeBlocks(text: string): CodeFile[] {
  const files: CodeFile[] = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const lang = match[1] ?? "text";
    const content = match[2].trimEnd();
    // Look for a filename comment on the first line
    const firstLine = content.split("\n")[0];
    const filenameMatch =
      firstLine.match(/\/\/\s*filename:\s*(.+)/) ??
      firstLine.match(/#\s*filename:\s*(.+)/);
    const name = filenameMatch
      ? filenameMatch[1].trim()
      : `file.${langToExt(lang)}`;
    const cleanContent = filenameMatch
      ? content.split("\n").slice(1).join("\n")
      : content;
    files.push({ name, language: lang, content: cleanContent });
  }
  return files;
}

function langToExt(lang: string): string {
  const map: Record<string, string> = {
    rust: "rs",
    typescript: "ts",
    javascript: "js",
    python: "py",
    go: "go",
    toml: "toml",
    json: "json",
    yaml: "yml",
    html: "html",
    css: "css",
    bash: "sh",
    shell: "sh",
    sql: "sql",
  };
  return map[lang.toLowerCase()] ?? lang;
}

/** Strip code blocks from text leaving prose only */
function stripCodeBlocks(text: string): string {
  return text.replace(/```[\s\S]*?```/g, "").trim();
}

// ── Sub-components ────────────────────────────────────────────────────────────

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
      className="flex items-center gap-1 text-[--muted] hover:text-[--foreground] transition-colors text-[10px]"
    >
      {copied ? (
        <Check className="w-3 h-3 text-[--success]" />
      ) : (
        <Copy className="w-3 h-3" />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodePane({ files }: { files: CodeFile[] }) {
  const [activeFile, setActiveFile] = useState(0);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

  useEffect(() => {
    setActiveFile(0);
  }, [files.length]);

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <FolderOpen className="w-8 h-8 text-[--muted]" />
        <p className="text-sm text-[--muted]">
          Files will appear here as Claw generates code
        </p>
        <p className="text-xs text-[--muted] max-w-xs leading-relaxed">
          Try: &ldquo;Create a Rust HTTP server&rdquo; or &ldquo;Write a Python script to parse JSON&rdquo;
        </p>
      </div>
    );
  }

  const file = files[Math.min(activeFile, files.length - 1)];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs bar */}
      <div className="flex items-center border-b border-[--border] bg-[--surface] overflow-x-auto shrink-0">
        <div className="flex items-center gap-px px-2 shrink-0">
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors mr-1",
              activeTab === "code"
                ? "border-[--accent] text-[--accent]"
                : "border-transparent text-[--muted] hover:text-[--foreground]"
            )}
          >
            <Code2 className="w-3 h-3" />
            Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors",
              activeTab === "preview"
                ? "border-[--accent] text-[--accent]"
                : "border-transparent text-[--muted] hover:text-[--foreground]"
            )}
          >
            <Eye className="w-3 h-3" />
            Preview
          </button>
        </div>

        <div className="h-4 w-px bg-[--border] mx-1 shrink-0" />

        <div className="flex items-center overflow-x-auto">
          {files.map((f, i) => (
            <button
              key={`${f.name}-${i}`}
              onClick={() => setActiveFile(i)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors whitespace-nowrap",
                i === activeFile
                  ? "border-[--accent] text-[--accent] bg-[--surface-raised]"
                  : "border-transparent text-[--muted] hover:text-[--foreground] hover:bg-[--surface-raised]"
              )}
            >
              <FileText className="w-3 h-3" />
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "code" ? (
        <div className="flex-1 overflow-auto bg-[--background]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[--border] sticky top-0 bg-[--surface] z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[--muted]">{file.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-[--border] text-[--muted] font-mono">
                {file.language}
              </span>
            </div>
            <CopyButton text={file.content} />
          </div>
          <pre className="p-4 text-xs font-mono text-[--foreground] leading-relaxed overflow-x-auto">
            <code>{file.content}</code>
          </pre>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 bg-[--surface]">
          <Terminal className="w-8 h-8 text-[--muted]" />
          <div className="text-center">
            <p className="text-sm font-medium text-[--foreground] mb-1">Preview</p>
            <p className="text-xs text-[--muted]">
              Connect the Rust backend to run and preview code output
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-[--border] bg-[--surface-raised]">
            <span className="w-2 h-2 rounded-full bg-[--muted]" />
            <span className="text-xs font-mono text-[--muted]">not connected</span>
          </div>
        </div>
      )}
    </div>
  );
}

function MsgBubble({ msg }: { msg: UIMessage }) {
  const isUser = msg.role === "user";
  const raw = getMessageText(msg);
  const prose = stripCodeBlocks(raw);
  const files = parseCodeBlocks(raw);

  return (
    <div className={cn("flex gap-3 px-4 py-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex items-center justify-center w-7 h-7 rounded-full shrink-0 mt-0.5",
          isUser
            ? "bg-[--surface-raised] text-[--foreground]"
            : "bg-[--accent-dim] text-[--accent]"
        )}
      >
        {isUser ? (
          <span className="text-[10px] font-bold">U</span>
        ) : (
          <Zap className="w-3.5 h-3.5" />
        )}
      </div>
      <div className={cn("flex flex-col gap-2 max-w-[85%]", isUser && "items-end")}>
        {prose && (
          <div
            className={cn(
              "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
              isUser
                ? "bg-[--surface-raised] border border-[--border-subtle]"
                : "bg-[--surface] border border-[--border]"
            )}
          >
            {prose}
          </div>
        )}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 px-2 py-1 rounded border border-[--accent]/30 bg-[--accent-dim] text-[10px] font-mono text-[--accent]"
              >
                <FileText className="w-3 h-3" />
                {f.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function CodeEditorPanel() {
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/code" }),
  });

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";

  // Derive latest code files from last assistant message
  const lastAssistant = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");
  const activeFiles = lastAssistant
    ? parseCodeBlocks(getMessageText(lastAssistant))
    : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    sendMessage({ text: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: Chat pane */}
      <div className="flex flex-col w-[420px] shrink-0 border-r border-[--border] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[--border] bg-[--surface] shrink-0">
          <div className="flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5 text-[--accent]" />
            <span className="text-xs font-mono font-semibold text-[--foreground]">JP_CODE_EDITOR</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[--muted]">claude-opus-4-6</span>
            <button
              onClick={() => setMessages([])}
              title="New session"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:text-[--accent] text-[--muted] text-xs transition-colors"
            >
              <Plus className="w-3 h-3" />
              New
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-2">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
              <Zap className="w-8 h-8 text-[--accent]" />
              <p className="text-xs font-mono text-[--muted] leading-relaxed">
                {'> describe what to build,'}<br/>{'> JP Code generates the code.'}
              </p>
              <div className="flex flex-col gap-2 w-full">
                {[
                  "Create a Rust HTTP server with Axum",
                  "Write a TypeScript React hook for fetching data",
                  "Build a Python FastAPI with JWT auth",
                  "Implement a port scanner in Python",
                ].map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage({ text: p })}
                    className="text-left px-3 py-2 rounded-lg border border-[--border] bg-[--surface] hover:border-[--accent] hover:bg-[--accent-dim] transition-colors text-xs text-[--muted] hover:text-[--accent]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MsgBubble key={msg.id} msg={msg} />
              ))}
              {isStreaming && (
                <div className="flex gap-3 px-4 py-3">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[--accent-dim] text-[--accent] shrink-0">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-[--border] bg-[--surface] shrink-0">
          <div className="flex items-end gap-2 rounded-xl border border-[--border] bg-[--surface-raised] px-3 py-2 focus-within:border-[--accent] transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              rows={1}
              placeholder="Describe what you want to build…"
              className="flex-1 resize-none bg-transparent text-sm text-[--foreground] placeholder:text-[--muted] outline-none leading-relaxed min-h-[24px] max-h-[160px] py-0.5 font-mono"
            />
            <button
              onClick={submit}
              disabled={isStreaming || !input.trim()}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0",
                input.trim() && !isStreaming
                  ? "bg-[--accent] text-white hover:bg-[--accent-hover]"
                  : "bg-[--border] text-[--muted] cursor-not-allowed"
              )}
            >
              {isStreaming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-[--muted] mt-1.5 px-1">
            Shift+Enter for newline
          </p>
        </div>
      </div>

      {/* Right: Code pane */}
      <div className="flex-1 min-w-0 overflow-hidden bg-[--background]">
        <CodePane files={activeFiles} />
      </div>
    </div>
  );
}
