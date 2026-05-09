"use client";

import { Suspense } from "react";
import { TopBar } from "./TopBar";
import { DesktopSidebar, MobileBottomNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[--background]">
      <TopBar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Desktop sidebar — hidden on mobile */}
        <Suspense fallback={<div className="hidden md:block w-[200px] shrink-0 bg-[--surface] border-r border-[--border]" />}>
          <DesktopSidebar />
        </Suspense>

        {/* Main content — add bottom padding on mobile for the tab bar */}
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative z-10 pb-16 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav — hidden on desktop */}
      <Suspense fallback={null}>
        <MobileBottomNav />
      </Suspense>
    </div>
  );
}
