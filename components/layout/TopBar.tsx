"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Maximize2, Minimize2, Palette, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "matrix" | "crimson" | "cyan" | "amber" | "white" | "aurora";

const THEMES: { id: Theme; label: string; color: string; animated?: boolean }[] = [
  { id: "matrix",  label: "MATRIX",  color: "#00ff41" },
  { id: "crimson", label: "CRIMSON", color: "#ff2060" },
  { id: "cyan",    label: "CYAN",    color: "#00e5ff" },
  { id: "amber",   label: "AMBER",   color: "#ffaa00" },
  { id: "white",   label: "WHITE",   color: "#0052cc" },
  { id: "aurora",  label: "AURORA",  color: "#bf60ff", animated: true },
];

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span className="text-[11px] font-mono text-[--muted] tabular-nums">{time}</span>;
}

export function TopBar() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [theme, setTheme] = useState<Theme>("matrix");
  const [showThemes, setShowThemes] = useState(false);
  const themePickerRef = useRef<HTMLDivElement>(null);

  // Sync fullscreen state
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Close theme picker on outside click
  useEffect(() => {
    if (!showThemes) return;
    const handler = (e: MouseEvent) => {
      if (themePickerRef.current && !themePickerRef.current.contains(e.target as Node)) {
        setShowThemes(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showThemes]);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  const selectTheme = (t: Theme) => {
    setTheme(t);
    setShowThemes(false);
  };

  return (
    <header className="relative z-50 flex items-center justify-between px-4 h-10 shrink-0 border-b border-[--border] bg-[--surface]">
      {/* Left: brand */}
      <div className="flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-[--accent]" />
        <span className="text-xs font-mono font-bold text-[--accent] tracking-wider animate-glitch">
          JP_CODE
        </span>
        <span className="text-[10px] font-mono text-[--muted] border border-[--border] px-1.5 py-0.5 rounded">
          v1.6.1
        </span>
        <span className="hidden sm:flex items-center gap-1 ml-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[--accent] animate-pulse" />
          <span className="text-[10px] font-mono text-[--muted]">SYSTEM_ONLINE</span>
        </span>
      </div>

      {/* Center: status bar */}
      <div className="hidden md:flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 border border-[--border] bg-[--background] rounded">
          <Activity className="w-3 h-3 text-[--accent]" />
          <span className="text-[10px] font-mono text-[--muted]">AI_READY</span>
        </div>
        <Clock />
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-1.5">
        {/* Theme picker */}
        <div className="relative" ref={themePickerRef}>
          <button
            onClick={() => setShowThemes((v) => !v)}
            title="Change theme"
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono transition-all duration-150",
              showThemes
                ? "border-[--accent] bg-[--accent-dim]"
                : "border-[--border] hover:border-[--accent]"
            )}
            style={{
              color: showThemes ? "var(--accent)" : "var(--foreground)",
              opacity: 1,
            }}
          >
            <Palette className="w-3 h-3" style={{ color: "var(--accent)" }} />
            <span className="hidden sm:inline" style={{ color: showThemes ? "var(--accent)" : "var(--foreground)" }}>
              THEME
            </span>
          </button>

          {showThemes && (
            <div className="absolute right-0 top-full mt-1.5 z-50 rounded overflow-hidden shadow-xl animate-fade-in min-w-[160px]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px var(--border)",
              }}
            >
              <div className="px-3 py-1.5 border-b" style={{ borderColor: "var(--border)" }}>
                <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: "var(--muted)" }}>
                  SELECT THEME
                </span>
              </div>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTheme(t.id)}
                  className="flex items-center gap-2.5 px-3 py-2 w-full text-[11px] font-mono transition-all duration-100"
                  style={{
                    background: theme === t.id ? "var(--accent-dim)" : "transparent",
                    color: theme === t.id ? "var(--accent)" : "var(--foreground)",
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== t.id) {
                      e.currentTarget.style.background = "var(--surface-raised)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== t.id) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      background: t.animated
                        ? "linear-gradient(135deg, #bf60ff, #00ffcc, #00a0ff)"
                        : t.color,
                      boxShadow: `0 0 8px ${t.color}`,
                      animation: t.animated ? "aurora-shift 2s ease infinite" : undefined,
                      backgroundSize: t.animated ? "300% 300%" : undefined,
                    }}
                  />
                  <span>{t.label}</span>
                  {t.animated && (
                    <span className="text-[8px] ml-1 px-1 rounded"
                      style={{
                        background: "linear-gradient(90deg, rgba(191,96,255,0.3), rgba(0,255,204,0.3))",
                        color: "#bf60ff",
                        border: "1px solid rgba(191,96,255,0.4)",
                      }}
                    >
                      ANIM
                    </span>
                  )}
                  {theme === t.id && (
                    <span className="ml-auto text-[10px]" style={{ color: "var(--accent)" }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono transition-all duration-150"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--foreground)";
          }}
        >
          {isFullscreen ? (
            <Minimize2 className="w-3 h-3" />
          ) : (
            <Maximize2 className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">{isFullscreen ? "EXIT_FS" : "FULLSCR"}</span>
        </button>
      </div>
    </header>
  );
}
