"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    // Register right away: the effect runs after hydration, by which point the
    // window "load" event has usually already fired, so gating on it would skip
    // registration entirely.
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration failures are non-fatal; the app still runs in the browser.
    });
  }, []);

  return null;
}
