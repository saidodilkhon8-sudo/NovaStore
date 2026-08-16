"use client";

import Link from "next/link";
import { LogoIcon } from "@/components/header";
import { useLanguage } from "@/components/language-provider";

export function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <LogoIcon className="w-7 h-7" />
              <span className="text-xl font-bold tracking-tight text-foreground">Nova Store</span>
            </Link>
            <p className="text-secondary-text text-sm max-w-sm">
              {t("footer.description")}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("footer.marketplace")}</h3>
            <ul className="space-y-2 text-sm text-secondary-text">
              <li><Link href="/explore" className="hover:text-foreground transition-colors">{t("nav.explore")}</Link></li>
              <li><Link href="/categories" className="hover:text-foreground transition-colors">{t("nav.categories")}</Link></li>
              <li><Link href="/developers" className="hover:text-foreground transition-colors">{t("nav.developers")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t("footer.account")}</h3>
            <ul className="space-y-2 text-sm text-secondary-text">
              <li><Link href="/login" className="hover:text-foreground transition-colors">{t("footer.signIn")}</Link></li>
              <li><Link href="/register" className="hover:text-foreground transition-colors">{t("footer.register")}</Link></li>
              <li><Link href="/favorites" className="hover:text-foreground transition-colors">{t("footer.favorites")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted">
            {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
}
