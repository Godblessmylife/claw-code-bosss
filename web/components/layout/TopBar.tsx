"use client";

import { useState, useEffect, useCallback } from "react";
import { Maximize2, Minimize2, Palette, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "matrix" | "crimson" | "cyan" | "amber";

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: "matrix",  label: "MATRIX",  color: "#00ff41" },
  { id: "crimson", label: "CRIMSON", color: "#ff3c3c" },
  { id: "cyan",    label: "CYAN",    color: "#00d4ff" },
  { id: "amber",   label: "AMBER",   color: "#ffb800" },
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

  // Sync fullscreen state
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

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
        <div className="relative">
          <button
            onClick={() => setShowThemes((v) => !v)}
            title="Change theme"
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono transition-colors",
              showThemes
                ? "border-[--accent] text-[--accent] bg-[--accent-dim]"
                : "border-[--border] text-[--muted] hover:border-[--accent] hover:text-[--accent]"
            )}
          >
            <Palette className="w-3 h-3" />
            <span className="hidden sm:inline">THEME</span>
          </button>

          {showThemes && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-[--surface] border border-[--border] rounded overflow-hidden shadow-lg shadow-black/50 animate-fade-in">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTheme(t.id)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2 w-full text-[11px] font-mono transition-colors",
                    theme === t.id
                      ? "bg-[--accent-dim] text-[--accent]"
                      : "text-[--muted] hover:bg-[--surface-raised] hover:text-[--foreground]"
                  )}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: t.color, boxShadow: `0 0 6px ${t.color}` }}
                  />
                  {t.label}
                  {theme === t.id && <span className="ml-auto">*</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[--border] text-[--muted] hover:border-[--accent] hover:text-[--accent] text-[10px] font-mono transition-colors"
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
