"use client";

import { useEffect } from "react";

export type Platform = "web" | "mobile" | "extension";

/** Best-effort platform detection. Mobile/extension apps override via setPlatform(). */
let current: Platform = "web";

export function setPlatform(p: Platform): void {
  current = p;
}

export function usePlatform(): Platform {
  useEffect(() => {
    // Extension content scripts run under chrome-extension://
    if (typeof window !== "undefined" && window.location.protocol === "chrome-extension:") {
      current = "extension";
    }
  }, []);
  return current;
}
