"use client";

import { useState, useEffect } from "react";

const USER_ID_KEY = "jp_code_user_id";

/** Returns a stable, anonymous user ID stored in localStorage. */
export function useUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    try {
      let id = localStorage.getItem(USER_ID_KEY);
      if (!id) {
        // Generate a random ID — crypto.randomUUID is available in all modern browsers
        id = crypto.randomUUID();
        localStorage.setItem(USER_ID_KEY, id);
      }
      setUserId(id);
    } catch {
      // localStorage unavailable (e.g. incognito in some browsers) — use session fallback
      setUserId("guest");
    }
  }, []);

  return userId;
}
