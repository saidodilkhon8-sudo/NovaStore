"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Menu, X, User, Download, LayoutDashboard, Shield, LogOut, Star } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useTheme } from "@/components/theme-provider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "backdrop-blur-xl border-b"
          : "bg-transparent"
      }`}
      style={isScrolled ? { backgroundColor: "var(--color-background)", borderColor: "var(--color-border)" } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <LogoIcon className="w-7 h-7" />
              <span className="text-lg font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>Nova Store</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 flex-1 justify-center max-w-2xl mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-muted)" }} />
              <input
                type="text"
                placeholder={t("hero.search")}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 transition-all"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                  borderWidth: "1px"
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-foreground)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--color-border)";
                }}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <nav className="flex items-center gap-6">
              <Link href="/explore" className="text-sm transition-colors" style={{ color: "var(--color-secondary-text)" }}>
                {t("nav.explore")}
              </Link>
              <Link href="/categories" className="text-sm transition-colors" style={{ color: "var(--color-secondary-text)" }}>
                {t("nav.categories")}
              </Link>
              <Link href="/developers" className="text-sm transition-colors" style={{ color: "var(--color-secondary-text)" }}>
                {t("nav.developers")}
              </Link>
            </nav>

            <LanguageSwitcher />
            <ThemeSwitcher />

            {user ? (
              <div className="flex items-center gap-3">
                {user.role === "developer" && (
                  <Link
                    href="/developer"
                    className="text-sm transition-colors flex items-center gap-1"
                    style={{ color: "var(--color-secondary-text)" }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t("nav.dashboard")}
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="text-sm transition-colors flex items-center gap-1"
                    style={{ color: "var(--color-secondary-text)" }}
                  >
                    <Shield className="w-4 h-4" />
                    {t("nav.admin")}
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-sm transition-colors" style={{ color: "var(--color-secondary-text)" }}>
                    <div className="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-medium" style={{ backgroundColor: "var(--color-elevated)", borderColor: "var(--color-border)", color: "var(--color-foreground)" }}>
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1" style={{ backgroundColor: "var(--color-elevated)", borderColor: "var(--color-border)", borderWidth: "1px" }}>
                    <Link href="/favorites" className="flex items-center gap-2 px-4 py-2 text-sm transition-colors" style={{ color: "var(--color-secondary-text)" }}>
                      <Star className="w-4 h-4" /> {t("nav.favorites")}
                    </Link>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm transition-colors" style={{ color: "var(--color-secondary-text)" }}>
                      <User className="w-4 h-4" /> {t("nav.profile")}
                    </Link>
                    <hr style={{ borderColor: "var(--color-border)" }} className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm transition-colors w-full text-left"
                      style={{ color: "var(--color-secondary-text)" }}
                    >
                      <LogOut className="w-4 h-4" /> {t("nav.logout")}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm transition-colors"
                  style={{ color: "var(--color-secondary-text)" }}
                >
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/register"
                  className="text-sm px-4 py-1.5 rounded-lg transition-colors"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-background)" }}
                >
                  {t("nav.getStarted")}
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <button
              className="p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t" style={{ backgroundColor: "var(--color-elevated)", borderColor: "var(--color-border)" }}>
          <div className="px-4 py-3 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--color-muted)" }} />
              <input
                type="text"
                placeholder={t("hero.search")}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none"
                style={{
                  backgroundColor: "var(--color-surface)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-foreground)",
                  borderWidth: "1px"
                }}
              />
            </div>
            <Link href="/explore" className="block text-sm py-2" style={{ color: "var(--color-secondary-text)" }}>{t("nav.explore")}</Link>
            <Link href="/categories" className="block text-sm py-2" style={{ color: "var(--color-secondary-text)" }}>{t("nav.categories")}</Link>
            {user ? (
              <>
                <Link href="/favorites" className="block text-sm py-2" style={{ color: "var(--color-secondary-text)" }}>{t("nav.favorites")}</Link>
                <Link href="/profile" className="block text-sm py-2" style={{ color: "var(--color-secondary-text)" }}>{t("nav.profile")}</Link>
                <button onClick={handleLogout} className="block text-sm py-2" style={{ color: "var(--color-secondary-text)" }}>{t("nav.logout")}</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-sm py-2" style={{ color: "var(--color-secondary-text)" }}>{t("nav.signIn")}</Link>
                <Link href="/register" className="block text-sm py-2" style={{ color: "var(--color-foreground)" }}>{t("nav.getStarted")}</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function LogoIcon({ className }: { className?: string }) {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === "system") {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } else {
      setIsDark(theme === "dark");
    }
  }, [theme]);

  const bagColor = isDark ? "#FFFFFF" : "#000000";
  const nColor = isDark ? "#000000" : "#FFFFFF";

  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="3" y="7" width="26" height="22" rx="3" fill={bagColor} />
      <path d="M9 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" stroke={nColor} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 24V13.5L20 24" stroke={nColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 13.5V24" stroke={nColor} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M12 13.5L20 13.5" stroke={nColor} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}