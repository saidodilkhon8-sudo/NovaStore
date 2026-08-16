"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppCard } from "@/components/app-card";
import { AppGridSkeleton } from "@/components/loading-skeleton";
import { Application } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";

export function FavoritesContent() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await fetch("/api/favorites");
        if (!res.ok) {
          if (res.status === 401) {
            setError(t("favorites.authRequired"));
            setAuthRequired(true);
            return;
          }
          throw new Error(t("favorites.fetchError"));
        }
        const data = await res.json();
        setApps(data.apps || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : t("error.generic"));
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  if (loading) return <AppGridSkeleton />;
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary-text text-lg">{error}</p>
        {authRequired && (
          <Link href="/login" className="text-foreground hover:underline mt-4 inline-block">
            {t("favorites.signIn")}
          </Link>
        )}
      </div>
    );
  }
  if (apps.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary-text text-lg">{t("favorites.empty")}</p>
        <p className="text-muted text-sm mt-2">{t("favorites.empty.desc")}</p>
        <Link href="/explore" className="text-foreground hover:underline mt-4 inline-block">
          {t("favorites.explore")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {apps.map((app) => (
        <AppCard key={app.id} app={app} />
      ))}
    </div>
  );
}
