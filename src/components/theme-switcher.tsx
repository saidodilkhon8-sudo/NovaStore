"use client";

import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      case "system":
        return <Monitor className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-sm transition-colors" style={{ color: "var(--color-secondary-text)" }}>
        {getIcon()}
      </button>
      <div className="absolute right-0 mt-2 w-32 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50" style={{ backgroundColor: "var(--color-elevated)", borderColor: "var(--color-border)", borderWidth: "1px" }}>
        {(["light", "dark", "system"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className="w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2"
            style={{
              color: theme === t ? "var(--color-foreground)" : "var(--color-secondary-text)",
              backgroundColor: theme === t ? "rgba(255, 255, 255, 0.1)" : "transparent"
            }}
          >
            {t === "light" && <Sun className="w-4 h-4" />}
            {t === "dark" && <Moon className="w-4 h-4" />}
            {t === "system" && <Monitor className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
