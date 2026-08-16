"use client";

import Link from "next/link";
import { Search, Download, Star, Shield, Zap, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900 to-black" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-foreground/20 text-foreground text-sm mb-8">
            <Zap className="w-4 h-4" />
            <span>{t("hero.badge")}</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-foreground">
            {t("hero.title.line1")}
            <span className="block">
              {t("hero.title.line2")}
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-secondary-text max-w-2xl mx-auto mb-10">
            {t("hero.subtitle")}
            {t("hero.subtitle.extra")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-background rounded-lg font-medium transition-colors hover:bg-neutral-200"
            >
              <Search className="w-5 h-5" />
              {t("hero.cta.explore")}
            </Link>
            <Link
              href="/developer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-transparent border border-foreground rounded-lg font-medium transition-colors hover:bg-primary/10"
            >
              <Download className="w-5 h-5" />
              {t("hero.cta.publish")}
            </Link>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder={t("hero.search")}
              className="w-full pl-12 pr-4 py-4 bg-surface border border-border rounded-xl focus:outline-none focus:border-foreground focus:ring-2 focus:ring-foreground/20 transition-all placeholder:text-muted"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">{t("features.title")}</h2>
            <p className="text-secondary-text max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-foreground/50 transition-colors duration-200">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t("features.fast")}</h3>
              <p className="text-secondary-text text-sm">
                {t("features.fast.desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-foreground/50 transition-colors duration-200">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t("features.secure")}</h3>
              <p className="text-secondary-text text-sm">
                {t("features.secure.desc")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-surface border border-border hover:border-foreground/50 transition-colors duration-200">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{t("features.community")}</h3>
              <p className="text-secondary-text text-sm">
                {t("features.community.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-border">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              {t("cta.title")}
            </h2>
            <p className="text-secondary-text mb-8 max-w-xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <Link
              href="/developer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-background rounded-lg font-medium transition-colors hover:bg-neutral-200"
            >
              {t("cta.button")}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
