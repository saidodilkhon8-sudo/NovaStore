"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppCard } from "@/components/app-card";
import { AppGridSkeleton } from "@/components/loading-skeleton";
import { Application } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";

export function ExploreContent() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "20");
        params.set("sort", "newest");
        if (searchParams.get("category")) {
          params.set("category", searchParams.get("category") || "");
        }
        if (searchParams.get("search")) {
          params.set("search", searchParams.get("search") || "");
        }

        const res = await fetch(`/api/apps?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        setApps(data.apps || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, [searchParams]);

  if (loading) return <AppGridSkeleton />;
  if (error) return <div className="text-center text-foreground py-12">{error}</div>;
  if (apps.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary-text text-lg">{t("noResults")}</p>
        <p className="text-muted text-sm mt-2">{t("noResults.desc")}</p>
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
