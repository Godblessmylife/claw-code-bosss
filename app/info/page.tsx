"use client";

import {
  Shield,
  Code2,
  MessageSquare,
  Briefcase,
  Zap,
  Lock,
  Cpu,
  Globe,
  GitBranch,
  Terminal,
  ChevronRight,
  Info,
} from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    desc: "Conversational AI assistant powered by Claude. Ask anything about code, architecture, debugging, or best practices. Each user has their own isolated history.",
    href: "/chat",
  },
  {
    icon: Code2,
    title: "Code Editor",
    desc: "Describe what you want to build. JP Code generates full, production-quality code with a VS Code-style file explorer and live preview for HTML/CSS/JS.",
    href: "/code",
  },
  {
    icon: Briefcase,
    title: "AI Business",
    desc: "AI-powered business automation assistant for social media platforms — Facebook, YouTube, Instagram, TikTok, Twitter/X, and Kick.",
    href: "/business",
  },
];

const TECH_STACK = [
  ["Frontend",   "Next.js 16, React 19, Tailwind CSS v4"],
  ["AI Layer",   "Vercel AI SDK, Claude claude-opus-4-6"],
  ["Backend",    "Rust (Axum) — optional local agent"],
  ["Storage",    "Per-user localStorage (no server required)"],
  ["Auth",       "Anonymous user IDs — no login needed"],
  ["Themes",     "6 themes: Matrix, Crimson, Cyan, Amber, White, Aurora"],
];

const PRIVACY_NOTES = [
  "Your chat history is stored only in your browser — no server-side storage.",
  "Each device/browser gets its own isolated user ID automatically.",
  "No login, no account, no tracking — fully anonymous by default.",
  "Clearing browser storage removes all your history permanently.",
];

export default function InfoPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[--background]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-[--border] bg-[--surface] shrink-0">
        <Info className="w-4 h-4 text-[--accent]" />
        <h1 className="text-xs font-mono font-bold text-[--foreground] tracking-wider uppercase">
          About JP Code
        </h1>
        <span className="text-[10px] font-mono text-[--muted] border border-[--border] px-1.5 py-0.5 rounded">
          v1.6.1
        </span>
      </div>

      <div className="px-4 md:px-6 py-6 space-y-8 max-w-2xl">

        {/* Hero */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl border border-[--accent]/40 bg-[--accent-dim]">
              <Shield className="w-6 h-6 text-[--accent]" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold text-[--accent] terminal-cursor">JP_CODE</h2>
              <p className="text-[11px] font-mono text-[--muted]">AI Coding Assistant</p>
            </div>
          </div>
          <p className="text-sm font-mono text-[--foreground] leading-relaxed border-l-2 border-[--accent] pl-4">
            JP Code is an advanced AI-powered coding workspace. Write code, debug issues,
            generate entire projects, and automate business workflows — all in a sleek
            terminal-inspired interface.
          </p>
        </section>

        {/* Features */}
        <section>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted] mb-3">
            {"// features"}
          </p>
          <div className="flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, title, desc, href }) => (
              <Link
                key={href}
                href={href}
                className="group flex gap-4 p-4 rounded-xl border border-[--border] bg-[--surface] hover:border-[--accent] hover:bg-[--accent-dim] transition-all duration-150"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-[--border] bg-[--surface-raised] group-hover:border-[--accent]/40 shrink-0 transition-colors">
                  <Icon className="w-4 h-4 text-[--accent]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-[--foreground]">{title}</span>
                    <ChevronRight className="w-3 h-3 text-[--muted] group-hover:text-[--accent] transition-colors" />
                  </div>
                  <p className="text-[11px] font-mono text-[--muted] leading-relaxed">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Cpu className="w-3.5 h-3.5 text-[--muted]" />
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted]">
              {"// tech_stack"}
            </p>
          </div>
          <div className="rounded-xl border border-[--border] bg-[--surface] overflow-hidden">
            {TECH_STACK.map(([k, v], i) => (
              <div
                key={k}
                className="flex items-start gap-4 px-4 py-3 border-b border-[--border-subtle] last:border-0"
              >
                <span className="text-[11px] font-mono text-[--muted] w-24 shrink-0">{k}</span>
                <span className="text-[11px] font-mono text-[--foreground] leading-relaxed">{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="w-3.5 h-3.5 text-[--muted]" />
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted]">
              {"// privacy"}
            </p>
          </div>
          <div className="rounded-xl border border-[--border] bg-[--surface] p-4 space-y-2.5">
            {PRIVACY_NOTES.map((note) => (
              <div key={note} className="flex items-start gap-2.5">
                <span className="text-[--accent] font-mono text-[11px] shrink-0 mt-0.5">{">"}</span>
                <span className="text-[11px] font-mono text-[--muted] leading-relaxed">{note}</span>
              </div>
            ))}
          </div>
        </section>

        {/* System info */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Terminal className="w-3.5 h-3.5 text-[--muted]" />
            <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted]">
              {"// system_info"}
            </p>
          </div>
          <div className="rounded-xl border border-[--border] bg-[--surface] overflow-hidden">
            {[
              ["product",   "JP Code"],
              ["version",   "1.6.1"],
              ["model",     "claude-opus-4-6"],
              ["framework", "Next.js 16 + React 19"],
              ["backend",   "Rust / Axum (optional)"],
              ["status",    "ONLINE"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-4 py-2.5 border-b border-[--border-subtle] last:border-0">
                <span className="text-[11px] font-mono text-[--muted]">{k}</span>
                <span className={`text-[11px] font-mono ${k === "status" ? "text-[--success]" : "text-[--accent]"}`}>{v}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center gap-2 pt-2 pb-4 text-[10px] font-mono text-[--muted]">
          <GitBranch className="w-3 h-3" />
          <span>JP Code v1.6.1 — built with Next.js + Claude AI</span>
        </div>
      </div>
    </div>
  );
}
