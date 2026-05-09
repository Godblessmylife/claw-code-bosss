"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Code2,
  Briefcase,
  Settings,
  Info,
  Menu,
  X,
  Terminal,
  GitBranch,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { label: "Chat",     href: "/chat",     icon: MessageSquare },
  { label: "Code",     href: "/code",     icon: Code2 },
  { label: "Business", href: "/business", icon: Briefcase },
  { label: "Info",     href: "/info",     icon: Info },
  { label: "Settings", href: "/settings", icon: Settings },
];

const SOCIAL_PLATFORMS = [
  { label: "Facebook",   platform: "facebook",  color: "#1877F2" },
  { label: "Twitter/X",  platform: "twitter",   color: "#1DA1F2" },
  { label: "YouTube",    platform: "youtube",   color: "#FF0000" },
  { label: "Instagram",  platform: "instagram", color: "#E1306C" },
  { label: "TikTok",     platform: "tiktok",    color: "#69C9D0" },
  { label: "Kick",       platform: "kick",      color: "#53FC18" },
];

// Desktop sidebar (visible md+)
export function DesktopSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPlatform = searchParams.get("platform");

  return (
    <aside className="hidden md:flex flex-col w-[200px] shrink-0 border-r border-[--border] bg-[--surface] h-full relative z-10">
      <div className="px-3 py-2.5 border-b border-[--border]">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[--surface-raised] border border-[--border]">
          <Terminal className="w-3 h-3 text-[--muted]" />
          <span className="text-[11px] font-mono text-[--muted]">WORKSPACE</span>
        </div>
      </div>
      <div className="px-3 py-2 border-b border-[--border-subtle]">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[--background] border border-[--border]">
          <GitBranch className="w-3 h-3 text-[--muted]" />
          <span className="text-[11px] font-mono text-[--muted] truncate">master</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[--accent]" />
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted]">
          {"// modules"}
        </p>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between gap-2 px-2.5 py-2 rounded text-sm transition-colors border",
                active
                  ? "border-[--accent]/40 bg-[--accent-dim] text-[--accent]"
                  : "border-transparent text-[--muted] hover:text-[--foreground] hover:bg-[--surface-raised] hover:border-[--border]"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("w-3.5 h-3.5 shrink-0", active ? "text-[--accent]" : "text-[--muted] group-hover:text-[--foreground]")} />
                <span className="font-mono text-xs">{item.label}</span>
              </div>
              {active && <ChevronRight className="w-3 h-3 text-[--accent] shrink-0" />}
            </Link>
          );
        })}

        <div className="pt-3 pb-1">
          <p className="px-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted]">
            {"// social"}
          </p>
          {SOCIAL_PLATFORMS.map(({ label, platform, color }) => {
            const active = pathname === "/business" && currentPlatform === platform;
            return (
              <Link
                key={platform}
                href={`/business?platform=${platform}`}
                className={cn(
                  "group flex items-center justify-between gap-2 px-2.5 py-1.5 rounded text-xs transition-colors border",
                  active
                    ? "border-[--accent]/40 bg-[--accent-dim] text-[--accent]"
                    : "border-transparent text-[--muted] hover:text-[--foreground] hover:bg-[--surface-raised] hover:border-[--border]"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="font-mono">{label}</span>
                </div>
                {active && <ChevronRight className="w-3 h-3 text-[--accent] shrink-0" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-2 py-2 border-t border-[--border]">
        <div className="px-2 pt-1 mt-1">
          <span className="text-[10px] font-mono text-[--muted]">JP Code v1.6.1</span>
        </div>
      </div>
    </aside>
  );
}

// Mobile bottom tab bar + slide-out drawer (visible below md)
export function MobileBottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const mainItems = NAV_ITEMS.slice(0, 4); // Chat, Code, Business, Info

  return (
    <>
      {/* Drawer backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Slide-out drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 md:hidden transition-transform duration-300 ease-in-out",
          drawerOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ maxHeight: "70vh" }}
      >
        <div className="rounded-t-2xl bg-[--surface] border-t border-[--border] overflow-y-auto"
          style={{ maxHeight: "70vh" }}
        >
          {/* Drag handle */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[--border]">
            <span className="text-xs font-mono font-semibold text-[--foreground] uppercase tracking-wider">Menu</span>
            <button onClick={() => setDrawerOpen(false)} className="p-1 rounded text-[--muted] hover:text-[--foreground]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="px-4 py-3 space-y-1">
            <p className="px-2 pb-2 text-[10px] font-mono uppercase tracking-widest text-[--muted]">// modules</p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg border transition-colors",
                    active
                      ? "border-[--accent]/40 bg-[--accent-dim] text-[--accent]"
                      : "border-transparent text-[--muted] hover:bg-[--surface-raised] hover:text-[--foreground] hover:border-[--border]"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", active ? "text-[--accent]" : "text-[--muted]")} />
                  <span className="font-mono text-sm">{item.label}</span>
                  {active && <ChevronRight className="w-4 h-4 text-[--accent] ml-auto shrink-0" />}
                </Link>
              );
            })}

            <p className="px-2 pt-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-[--muted]">// social</p>
            <div className="grid grid-cols-2 gap-2">
              {SOCIAL_PLATFORMS.map(({ label, platform, color }) => (
                <Link
                  key={platform}
                  href={`/business?platform=${platform}`}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[--border] bg-[--surface-raised] text-[--muted] hover:text-[--foreground] hover:border-[--accent] transition-colors"
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="font-mono text-xs truncate">{label}</span>
                </Link>
              ))}
            </div>
          </nav>

          <div className="px-6 pb-6 pt-2 border-t border-[--border] mt-2">
            <span className="text-[10px] font-mono text-[--muted]">JP Code v1.6.1</span>
          </div>
        </div>
      </div>

      {/* Fixed bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch h-16 bg-[--surface] border-t border-[--border] md:hidden safe-area-pb">
        {mainItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 gap-1 transition-colors"
              style={{ color: active ? "var(--accent)" : "var(--muted)" }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-mono uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
        {/* More / drawer trigger */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 gap-1 transition-colors"
          style={{ color: "var(--muted)" }}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[9px] font-mono uppercase tracking-wider">More</span>
        </button>
      </nav>
    </>
  );
}
