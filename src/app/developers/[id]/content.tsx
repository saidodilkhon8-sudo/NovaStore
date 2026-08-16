"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Star, ExternalLink, Calendar } from "lucide-react";
import { Application } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import { AppCard } from "@/components/app-card";

interface DeveloperProfile {
  developer: {
    id: string;
    userId: string;
    displayName: string;
    description?: string;
    website?: string;
    avatar?: string;
    createdAt: string;
    user?: {
      username: string;
      avatar?: string;
    };
  };
  stats: {
    downloadCount: number;
    appCount: number;
    averageRating: number;
  };
  apps: Application[];
}

interface DeveloperProfileContentProps {
  id: string;
}

export function DeveloperProfileContent({ id }: DeveloperProfileContentProps) {
  const [profile, setProfile] = useState<DeveloperProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/developers/${id}`);
        if (!res.ok) throw new Error("Developer not found");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load developer");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  if (loading) return null;
  if (error || !profile) {
    return (
      <div className="text-center py-20">
        <p className="text-secondary-text text-lg">{error || "Developer not found"}</p>
        <Link href="/developers" className="text-foreground hover:underline mt-4 inline-block">
          {t("app.browse")}
        </Link>
      </div>
    );
  }

  const { developer, stats, apps } = profile;

  return (
    <>
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border mb-8">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-elevated border border-border flex-shrink-0">
            {developer.avatar ? (
              <Image
                src={developer.avatar}
                alt={developer.displayName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-foreground">
                {developer.displayName[0]}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {developer.displayName}
            </h1>
            <p className="text-secondary-text mt-1">@{developer.user?.username}</p>
            {developer.description && (
              <p className="text-secondary-text mt-3 max-w-2xl">{developer.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {developer.website && (
                <a
                  href={developer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  {t("developers.website")}
                </a>
              )}
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <Calendar className="w-4 h-4" />
                {t("developers.memberSince")} {formatDate(developer.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-foreground" />
            <div>
              <p className="text-2xl font-bold text-foreground">{formatNumber(stats.downloadCount)}</p>
              <p className="text-xs text-secondary-text">{t("developers.stats.downloads")}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center text-foreground font-bold text-sm">A</div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.appCount}</p>
              <p className="text-xs text-secondary-text">{t("developers.stats.apps")}</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-surface border border-border">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-foreground" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"}
              </p>
              <p className="text-xs text-secondary-text">{t("developers.stats.rating")}</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {t("developers.viewAllApps")}
        </h2>
        {apps.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-surface border border-border">
            <p className="text-secondary-text mb-2">{t("developers.noApps")}</p>
            <p className="text-muted text-sm">{t("developers.noApps.desc")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
