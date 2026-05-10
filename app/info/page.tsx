"use client";

import {
  Shield,
  Code2,
  MessageSquare,
  Briefcase,
  Lock,
  GitBranch,
  Terminal,
  ChevronRight,
  Info,
  Rocket,
  FolderOpen,
  Palette,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLang } from "@/lib/langContext";

// ── Telegram animated button ──────────────────────────────────────────────────

function TelegramButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="https://t.me/web3elchapo"
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex items-center gap-3 px-5 py-3.5 rounded-2xl overflow-hidden transition-all duration-300 active:scale-95"
      style={{
        background: hovered
          ? "linear-gradient(135deg, #0088cc, #00aaff)"
          : "linear-gradient(135deg, #006bad, #0088cc)",
        boxShadow: hovered
          ? "0 0 24px rgba(0, 136, 204, 0.6), 0 4px 20px rgba(0, 136, 204, 0.3)"
          : "0 0 12px rgba(0, 136, 204, 0.3), 0 2px 8px rgba(0, 0, 0, 0.3)",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
      }}
    >
      {/* Animated background pulse */}
      <span
        className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Telegram SVG icon */}
      <span className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.504-1.356 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      </span>

      <div className="relative flex flex-col">
        <span className="text-white font-mono font-bold text-sm leading-tight">
          @web3elchapo
        </span>
        <span className="text-white/70 font-mono text-[10px] leading-tight">
          Telegram · Follow for updates
        </span>
      </div>

      {/* Arrow */}
      <ChevronRight
        className="relative w-4 h-4 text-white/60 ml-auto transition-transform duration-300"
        style={{ transform: hovered ? "translateX(3px)" : "translateX(0)" }}
      />
    </a>
  );
}

// ── Bilingual features ────────────────────────────────────────────────────────

const BILINGUAL_FEATURES = [
  {
    icon: MessageSquare,
    en: { title: "AI Chat Assistant", desc: "Conversational AI powered by Claude O.G. Ask anything — code, architecture, debugging, security, or best practices. Full conversation history per user." },
    ru: { title: "ИИ Чат Ассистент", desc: "Разговорный ИИ на базе Claude O.G. Спрашивай о коде, архитектуре, отладке, безопасности. Полная история разговоров для каждого пользователя." },
    href: "/chat",
  },
  {
    icon: Code2,
    en: { title: "AI Code Editor", desc: "Describe what to build — JP Code generates complete, production-quality files with a VS Code-style explorer, live preview, and ZIP download." },
    ru: { title: "ИИ Редактор Кода", desc: "Опиши что создать — JP Code генерирует готовые файлы с проводником в стиле VS Code, превью и скачиванием ZIP." },
    href: "/code",
  },
  {
    icon: FolderOpen,
    en: { title: "Projects Manager", desc: "Auto-saves every generated project. Rename, download, or delete any project. Full project history stored locally in your browser." },
    ru: { title: "Менеджер Проектов", desc: "Автосохранение каждого проекта. Переименование, скачивание и удаление. История хранится локально в браузере." },
    href: "/projects",
  },
  {
    icon: Briefcase,
    en: { title: "AI Business Tools", desc: "AI automation for social platforms: Facebook, YouTube, Instagram, TikTok, Twitter/X, Kick. Generate posts, captions, and strategies." },
    ru: { title: "ИИ Бизнес Инструменты", desc: "ИИ автоматизация для соцсетей: Facebook, YouTube, Instagram, TikTok, Twitter/X, Kick. Генерация постов, подписей, стратегий." },
    href: "/business",
  },
  {
    icon: Download,
    en: { title: "Download & Deploy", desc: "Download any project as a ZIP archive, then deploy directly to Vercel with one click. Connect your own custom domain." },
    ru: { title: "Скачать и Развернуть", desc: "Скачай проект как ZIP, затем разверни на Vercel одним кликом. Подключи собственный домен." },
    href: "/code",
  },
  {
    icon: Palette,
    en: { title: "6 Visual Themes", desc: "Matrix, Crimson, Cyan, Amber, White, and animated Aurora theme. Switch anytime from the top bar." },
    ru: { title: "6 Визуальных Тем", desc: "Matrix, Crimson, Cyan, Amber, White и анимированная Aurora. Переключай в любой момент из верхней панели." },
    href: "/settings",
  },
  {
    icon: Lock,
    en: { title: "Full Privacy", desc: "Zero server-side storage. All chat history and projects live only in your browser. No login, no tracking, fully anonymous." },
    ru: { title: "Полная Конфиденциальность", desc: "Никакого серверного хранения. Вся история чатов и проекты только в вашем браузере. Без входа и отслеживания." },
    href: "/info",
  },
  {
    icon: Rocket,
    en: { title: "Mobile Ready", desc: "Fully optimized for mobile. Bottom navigation, swipe-friendly panels, static screen without zoom on input focus." },
    ru: { title: "Мобильная Версия", desc: "Полностью оптимизировано для мобильных. Нижняя навигация, удобные панели, статичный экран без зума при вводе." },
    href: "/info",
  },
];

const TECH_STACK = [
  ["Frontend",   "Next.js 16, React 19, Tailwind CSS v4"],
];

const PRIVACY_NOTES = [
  { en: "Your chat history is stored only in your browser — no server-side storage.", ru: "История чатов хранится только в браузере — без серверного хранения." },
  { en: "Each device/browser gets its own isolated user ID automatically.", ru: "Каждое устройство автоматически получает изолированный ID пользователя." },
  { en: "No login, no account, no tracking — fully anonymous by default.", ru: "Без входа, аккаунта и отслеживания — полностью анонимно." },
  { en: "Clearing browser storage removes all history permanently.", ru: "Очистка хранилища браузера удаляет всю историю безвозвратно." },
];

export default function InfoPage() {
  const { lang } = useLang();

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[--background]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 md:px-6 py-3 border-b border-[--border] bg-[--surface] shrink-0">
        <Info className="w-4 h-4 text-[--accent]" />
        <h1 className="text-xs font-mono font-bold text-[--foreground] tracking-wider uppercase flex-1">
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
              <p className="text-[11px] font-mono text-[--muted]">
                {lang === "en" ? "AI Coding Assistant · Claude O.G" : "ИИ Помощник по Коду · Claude O.G"}
              </p>
            </div>
          </div>
          <p className="text-sm font-mono text-[--foreground] leading-relaxed border-l-2 border-[--accent] pl-4">
            {lang === "en"
              ?             "JP Code is an advanced AI-powered coding workspace. Write code, debug issues, generate entire projects, and automate business workflows — all in a sleek terminal-inspired interface powered by Claude O.G."
              : "JP Code — продвинутое рабочее пространство на базе ИИ. Пиши код, отлаживай, генерируй целые проекты и автоматизируй бизнес-процессы — всё в стильном терминальном интерфейсе на Claude O.G."}
          </p>
        </section>

        {/* Telegram CTA */}
        <section>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted] mb-3">
            {"// community"}
          </p>
          <TelegramButton />
        </section>

        {/* Bilingual features */}
        <section>
          <p className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted] mb-3">
            {"// features"}
          </p>
          <div className="flex flex-col gap-3">
            {BILINGUAL_FEATURES.map(({ icon: Icon, en, ru, href }) => {
              const content = lang === "en" ? en : ru;
              return (
                <Link
                  key={href + en.title}
                  href={href}
                  className="group flex gap-4 p-4 rounded-xl border border-[--border] bg-[--surface] hover:border-[--accent] hover:bg-[--accent-dim] transition-all duration-150"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-[--border] bg-[--surface-raised] group-hover:border-[--accent]/40 shrink-0 transition-colors">
                    <Icon className="w-4 h-4 text-[--accent]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-semibold text-[--foreground]">{content.title}</span>
                      <ChevronRight className="w-3 h-3 text-[--muted] group-hover:text-[--accent] transition-colors" />
                    </div>
                    <p className="text-[11px] font-mono text-[--muted] leading-relaxed">{content.desc}</p>
                  </div>
                </Link>
              );
            })}
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
              <div key={note.en} className="flex items-start gap-2.5">
                <span className="text-[--accent] font-mono text-[11px] shrink-0 mt-0.5">{">"}</span>
                <span className="text-[11px] font-mono text-[--muted] leading-relaxed">
                  {lang === "en" ? note.en : note.ru}
                </span>
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
              ["model",     "Claude O.G"],
              ["framework", "Next.js 16 + React 19"],
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
        <div className="flex items-center gap-2 pt-2 pb-8 text-[10px] font-mono text-[--muted]">
          <GitBranch className="w-3 h-3" />
          <span>JP Code v1.6.1 — Built With Love</span>
        </div>

      </div>
    </div>
  );
}
