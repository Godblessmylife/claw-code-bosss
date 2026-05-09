"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Code2,
  Settings,
  GitBranch,
  ChevronRight,
  Terminal,
  Briefcase,
} from "lucide-react";

const navItems = [
  {
    label: "AI Chat",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    label: "Code Editor",
    href: "/code",
    icon: Code2,
  },
  {
    label: "AI Business",
    href: "/business",
    icon: Briefcase,
  },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
];

// Social platforms — redirect to /business?platform=X so the AI knows context
const socialPlatforms = [
  { label: "Facebook",  platform: "facebook",  color: "#1877F2" },
  { label: "Twitter/X", platform: "twitter",   color: "#1DA1F2" },
  { label: "YouTube",   platform: "youtube",   color: "#FF0000" },
  { label: "Instagram", platform: "instagram", color: "#E1306C" },
  { label: "TikTok",    platform: "tiktok",    color: "#69C9D0" },
  { label: "Kick",      platform: "kick",      color: "#53FC18" },
];

function PlatformDot({ color }: { color: string }) {
  return (
    <span
      className="shrink-0 w-2 h-2 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPlatform = searchParams.get("platform");

  return (
    <aside className="flex flex-col w-[200px] shrink-0 border-r border-[--border] bg-[--surface] h-full relative z-10">
      {/* Terminal label */}
      <div className="px-3 py-2.5 border-b border-[--border]">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[--surface-raised] border border-[--border]">
          <Terminal className="w-3 h-3 text-[--muted]" />
          <span className="text-[11px] font-mono text-[--muted]">WORKSPACE</span>
        </div>
      </div>

      {/* Branch badge */}
      <div className="px-3 py-2 border-b border-[--border-subtle]">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[--background] border border-[--border]">
          <GitBranch className="w-3 h-3 text-[--muted]" />
          <span className="text-[11px] font-mono text-[--muted] truncate">master</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[--accent]" />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted]">
          {"// modules"}
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (pathname.startsWith(item.href + "/") && item.href !== "/business") ||
            (item.href === "/business" && pathname === "/business" && !currentPlatform);
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
                <Icon
                  className={cn(
                    "w-3.5 h-3.5 shrink-0",
                    active ? "text-[--accent]" : "text-[--muted] group-hover:text-[--foreground]"
                  )}
                />
                <span className="font-mono text-xs">{item.label}</span>
              </div>
              {active && <ChevronRight className="w-3 h-3 text-[--accent] shrink-0" />}
            </Link>
          );
        })}

        {/* Social section */}
        <div className="pt-3 pb-1">
          <p className="px-2 pb-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-[--muted]">
            {"// social"}
          </p>
          {socialPlatforms.map(({ label, platform, color }) => {
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
                  <PlatformDot color={color} />
                  <span className="font-mono">{label}</span>
                </div>
                {active && <ChevronRight className="w-3 h-3 text-[--accent] shrink-0" />}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-2 py-2 border-t border-[--border] space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-2.5 py-2 rounded text-xs font-mono transition-colors border",
                active
                  ? "border-[--accent]/40 bg-[--accent-dim] text-[--accent]"
                  : "border-transparent text-[--muted] hover:text-[--foreground] hover:bg-[--surface-raised] hover:border-[--border]"
              )}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <div className="px-2 pt-2 mt-1 border-t border-[--border-subtle]">
          <span className="text-[10px] font-mono text-[--muted]">JP Code v1.6.1</span>
        </div>
      </div>
    </aside>
  );
}
