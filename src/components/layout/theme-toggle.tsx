"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-default bg-surface" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-default bg-surface text-primary shadow-sm transition-all duration-150 hover:scale-105 hover:bg-brand hover:text-white hover:border-brand"
    >
      {isDark ? (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            d="M12 2v2M12 20v2M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M2 12h2M20 12h2M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12.79C20.24 13.07 19.43 13.22 18.6 13.22C13.96 13.22 10.22 9.48 10.22 4.84C10.22 4.01 10.37 3.2 10.65 2.44C7.35 3.64 5 6.89 5 10.66C5 15.3 8.74 19.04 13.38 19.04C17.15 19.04 20.4 16.69 21 12.79Z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
}
