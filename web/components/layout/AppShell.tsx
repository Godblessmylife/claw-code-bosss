"use client";

import { Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[--background]">
      <TopBar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Suspense fallback={<div className="w-[200px] shrink-0 bg-[--surface] border-r border-[--border]" />}>
          <Sidebar />
        </Suspense>
        <main className="flex-1 min-w-0 flex flex-col overflow-hidden relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
