"use client";

import { useState, useEffect } from "react";
import { DeveloperCard } from "@/components/developer-card";
import { useLanguage } from "@/components/language-provider";
import { AppGridSkeleton } from "@/components/loading-skeleton";

export function DevelopersList() {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/developers")
      .then((res) => res.json())
      .then((data) => setDevelopers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-surface border border-border animate-pulse space-y-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-elevated flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-elevated rounded w-32" />
                <div className="h-4 bg-elevated rounded w-48" />
              </div>
            </div>
            <div className="h-4 bg-elevated rounded w-full" />
            <div className="h-4 bg-elevated rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (developers.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary-text text-lg">{t("developers.empty")}</p>
        <p className="text-muted text-sm mt-2">{t("developers.empty.desc")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {developers.map((dev) => (
        <DeveloperCard
          key={dev.id}
          id={dev.id}
          name={dev.displayName}
          username={dev.user?.username}
          description={dev.description}
          avatar={dev.avatar || dev.user?.avatar}
          appCount={dev._count?.applications || 0}
        />
      ))}
    </div>
  );
}
