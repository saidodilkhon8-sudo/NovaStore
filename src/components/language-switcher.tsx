"use client";

import { useLanguage } from "@/components/language-provider";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-sm text-secondary-text hover:text-foreground transition-colors">
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{language.toUpperCase()}</span>
      </button>
      <div className="absolute right-0 mt-2 w-32 bg-elevated border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50">
        {(["en", "ru", "uz"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${
              language === lang
                ? "text-foreground bg-primary/10"
                : "text-secondary-text hover:bg-surface hover:text-foreground"
            }`}
          >
            {lang === "en" ? "English" : lang === "ru" ? "Русский" : "O'zbek"}
          </button>
        ))}
      </div>
    </div>
  );
}
