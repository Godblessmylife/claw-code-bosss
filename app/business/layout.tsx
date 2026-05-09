import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <Suspense fallback={<div className="flex-1 bg-[--background]" />}>
        {children}
      </Suspense>
    </AppShell>
  );
}
