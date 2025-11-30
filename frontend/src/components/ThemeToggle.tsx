import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "theme"; // 'dark' | 'light' | 'system'

type ThemeChoice = "dark" | "light" | "system";

function getPreferredTheme(): ThemeChoice {
  const fromStorage = (typeof window !== "undefined" && window.localStorage.getItem(THEME_KEY)) as
    | ThemeChoice
    | null;
  if (fromStorage === "dark" || fromStorage === "light" || fromStorage === "system") return fromStorage;
  const m = typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)");
  if (m && typeof m.matches === "boolean") return "system";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeChoice>(getPreferredTheme());

  useEffect(() => {
    const apply = () => {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const mode = theme === "system" ? (prefersDark ? "dark" : "light") : theme;
      if (mode === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    };
    apply();
    let mm: MediaQueryList | undefined;
    if (theme === "system" && window.matchMedia) {
      mm = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => apply();
      // @ts-ignore older TS lib types
      mm.addEventListener ? mm.addEventListener("change", handler) : mm.addListener?.(handler);
      return () => {
        // @ts-ignore older TS lib types
        mm?.removeEventListener ? mm.removeEventListener("change", handler) : mm?.removeListener?.(handler);
      };
    }
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {}
    return;
  }, [theme]);

  return (
    <Button
      variant="outline"
      onClick={() => setTheme((t) => (t === "light" ? "dark" : t === "dark" ? "system" : "light"))}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "🌙 Dark" : theme === "light" ? "☀️ Light" : "🖥️ System"}
    </Button>
  );
}
