"use client";

import { useState, useCallback } from "react";
import { MatrixIntro } from "./MatrixIntro";
import { LangProvider } from "@/lib/langContext";

export function AppWithIntro({ children }: { children: React.ReactNode }) {
  // Show intro only once per browser session (not on every navigation)
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    const seen = sessionStorage.getItem("jp_intro_seen");
    return !seen;
  });

  const handleDone = useCallback(() => {
    sessionStorage.setItem("jp_intro_seen", "1");
    setShowIntro(false);
  }, []);

  return (
    <LangProvider>
      {showIntro && <MatrixIntro onDone={handleDone} />}
      <div
        style={{
          opacity: showIntro ? 0 : 1,
          transition: showIntro ? "none" : "opacity 0.4s ease-in",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </div>
    </LangProvider>
  );
}
