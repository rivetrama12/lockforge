"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV !== "production") return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registration failures are non-fatal; the app still runs in the browser.
      });
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
