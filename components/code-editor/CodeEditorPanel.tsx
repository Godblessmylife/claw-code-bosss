"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────

interface CodeFile {
  name: string;
  language: string;
  content: string;
}

interface CodeMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  codeFiles?: CodeFile[];
  timestamp: number;
}

// ── Demo data ────────────────────────────────────────────────────────────────

const DEMO_FILES: CodeFile[] = [
  {
    name: "main.rs",
    language: "rust",
    content: `use axum::{Router, routing::get};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(|| async { "Hello, Claw!" }));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    
    axum::serve(listener, app).await.unwrap();
}`,
  },
  {
    name: "Cargo.toml",
    language: "toml",
    content: `[package]
name = "claw-server"
version = "0.1.0"
edition = "2021"

[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"`,
  },
];

const DEMO_MESSAGES: CodeMessage[] = [
  {
    id: "1",
    role: "user",
    text: "Create a simple Axum web server with a hello world endpoint",
    timestamp: Date.now() - 30000,
  },
  {
    id: "2",
    role: "assistant",
    text: "I'll create a minimal Axum server for you. Here are the files:",
    codeFiles: DEMO_FILES,
    timestamp: Date.now() - 25000,
  },
];

// ── Sub-components ───────────────────────────────────────────────────────────

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

function FileTab({
  file,
  active,
  onClick,
}: {
  file: CodeFile;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors whitespace-nowrap",
        active
          ? "border-[--accent] text-[--accent] bg-[--surface-raised]"
          : "border-transparent text-[--muted] hover:text-[--foreground] hover:bg-[--surface-raised]"
      )}
    >
      <FileText className="w-3 h-3" />
      {file.name}
    </button>
  );
}

function CodePane({ files }: { files: CodeFile[] }) {
  const [activeFile, setActiveFile] = useState(0);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
        <FolderOpen className="w-8 h-8 text-[--muted]" />
        <p className="text-sm text-[--muted]">
          Files will appear here as Claw generates code
        </p>
      </div>
    );
  }

  const file = files[activeFile];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs bar */}
      <div className="flex items-center border-b border-[--border] bg-[--surface] overflow-x-auto shrink-0">
        <div className="flex items-center gap-px px-2">
          <button
            onClick={() => setActiveTab("code")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-xs border-b-2 transition-colors mr-2",
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

        <div className="h-4 w-px bg-[--border] mx-1" />

        <div className="flex items-center overflow-x-auto">
          {files.map((f, i) => (
            <FileTab
              key={f.name}
              file={f}
              active={i === activeFile}
              onClick={() => setActiveFile(i)}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "code" ? (
        <div className="flex-1 overflow-auto bg-[--background]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[--border] sticky top-0 bg-[--surface] z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[--muted]">
                {file.name}
              </span>
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
            <p className="text-sm font-medium text-[--foreground] mb-1">
              Preview
            </p>
            <p className="text-xs text-[--muted]">
              Connect the Rust backend to run the code and see output here
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-[--border] bg-[--surface-raised]">
            <span className="w-2 h-2 rounded-full bg-[--muted]" />
            <span className="text-xs font-mono text-[--muted]">
              cargo run — not connected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function CodeChatMessage({ message }: { message: CodeMessage }) {
  const isUser = message.role === "user";

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
          <span className="text-[10px] font-semibold">U</span>
        ) : (
          <Zap className="w-3.5 h-3.5" />
        )}
      </div>
      <div className={cn("flex flex-col gap-2 max-w-[85%]", isUser && "items-end")}>
        <div
          className={cn(
            "rounded-xl px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-[--surface-raised] border border-[--border-subtle]"
              : "bg-[--surface] border border-[--border]"
          )}
        >
          {message.text}
        </div>
        {message.codeFiles && message.codeFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.codeFiles.map((f) => (
              <div
                key={f.name}
                className="flex items-center gap-1.5 px-2 py-1 rounded border border-[--border] bg-[--surface-raised] text-[10px] font-mono text-[--muted]"
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

// ── Main panel ───────────────────────────────────────────────────────────────

export function CodeEditorPanel() {
  const [messages, setMessages] = useState<CodeMessage[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [activeFiles, setActiveFiles] = useState<CodeFile[]>(DEMO_FILES);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMsg: CodeMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    // Simulate response (will be replaced by real Rust backend call)
    setTimeout(() => {
      const assistantMsg: CodeMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: `I understand you want to: "${trimmed}". Connect the Claw Code Rust backend (running on port 3001) to get real responses. The server exposes POST /sessions/{id}/message and SSE /sessions/{id}/events.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsSending(false);
    }, 1200);
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
            <Code2 className="w-4 h-4 text-[--accent]" />
            <span className="text-sm font-medium text-[--foreground]">
              Claw Code
            </span>
          </div>
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-[--border] bg-[--surface-raised] hover:border-[--accent] hover:text-[--accent] text-[--muted] text-xs transition-colors">
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-2">
          {messages.map((msg) => (
            <CodeChatMessage key={msg.id} message={msg} />
          ))}
          {isSending && (
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
              disabled={isSending || !input.trim()}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0",
                input.trim() && !isSending
                  ? "bg-[--accent] text-white hover:bg-[--accent-hover]"
                  : "bg-[--border] text-[--muted] cursor-not-allowed"
              )}
            >
              {isSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right: Code pane */}
      <div className="flex-1 min-w-0 overflow-hidden bg-[--background]">
        <CodePane files={activeFiles} />
      </div>
    </div>
  );
}
