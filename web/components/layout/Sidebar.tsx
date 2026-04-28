"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Code2,
  Settings,
  GitBranch,
  Zap,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "AI Chat",
    href: "/chat",
    icon: MessageSquare,
    description: "Conversation with Claude",
  },
  {
    label: "Code Editor",
    href: "/code",
    icon: Code2,
    description: "v0-style coding interface",
  },
];

const bottomItems = [
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[220px] shrink-0 border-r border-[--border] bg-[--surface] h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-[--border]">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-[--accent] text-white">
          <Zap className="w-3.5 h-3.5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-[--foreground] tracking-tight">
            Claw Code
          </span>
          <span className="text-[10px] text-[--muted] font-mono">v0.1.0</span>
        </div>
      </div>

      {/* Branch badge */}
      <div className="px-3 py-2.5 border-b border-[--border-subtle]">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[--surface-raised] border border-[--border]">
          <GitBranch className="w-3 h-3 text-[--muted]" />
          <span className="text-[11px] font-mono text-[--muted] truncate">
            master
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[--muted]">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-[--accent-dim] text-[--accent]"
                  : "text-[--muted] hover:text-[--foreground] hover:bg-[--surface-raised]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active ? "text-[--accent]" : "text-[--muted] group-hover:text-[--foreground]"
                  )}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              {active && (
                <ChevronRight className="w-3 h-3 text-[--accent] shrink-0" />
              )}
            </Link>
          );
        })}
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
                "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-[--accent-dim] text-[--accent]"
                  : "text-[--muted] hover:text-[--foreground] hover:bg-[--surface-raised]"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
