"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Download, ExternalLink, Globe, Shield, ChevronLeft, Heart, History, Calendar, HardDrive } from "lucide-react";
import { Application, ApplicationVersion } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

export function AppDetails({ slug }: { slug: string }) {
  const [app, setApp] = useState<Application | null>(null);
  const [versions, setVersions] = useState<ApplicationVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appRes, versionsRes] = await Promise.all([
          fetch(`/api/apps/${slug}`),
          fetch(`/api/apps/${slug}/versions`),
        ]);
        if (!appRes.ok) throw new Error("Application not found");
        const appData = await appRes.json();
        setApp(appData);
        if (versionsRes.ok) {
          const versionsData = await versionsRes.json();
          setVersions(versionsData.versions || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load application");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleDownload = async (version?: ApplicationVersion) => {
    try {
      const res = await fetch(`/api/apps/${slug}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "windows" }),
      });
      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const toggleFavorite = async () => {
    try {
      const res = await fetch(`/api/apps/${slug}/favorite`, { method: "POST" });
      const data = await res.json();
      setIsFavorited(data.favorited);
    } catch (err) {
      console.error("Favorite error:", err);
    }
  };

  if (loading) return <div className="animate-pulse space-y-6">{t("app.loading")}</div>;
  if (error || !app) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">{t("app.notFound")}</h1>
        <p className="text-secondary-text mb-6">{error || t("app.notFound.desc")}</p>
        <Link href="/explore" className="text-foreground hover:underline">{t("app.browse")}</Link>
      </div>
    );
  }

  const latestVersion = app.versions?.[0];
  const avgRating = app.averageRating || 0;
  const reviewCount = app._count?.reviews || 0;
  const downloadCount = app._count?.downloads || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 text-sm text-secondary-text">
        <Link href="/explore" className="hover:text-foreground transition-colors flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> {t("nav.explore")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{app.name}</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-6">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-elevated border border-border flex-shrink-0">
          {app.iconUrl ? (
            <Image
              src={app.iconUrl}
              alt={app.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary bg-surface">
              {app.name[0]}
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold">{app.name}</h1>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              {app.category?.name || t("app.other")}
            </span>
          </div>
          <p className="text-secondary-text mb-4">{app.shortDescription}</p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-secondary-text">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-warning text-warning" />
              <span className="font-medium text-foreground">{avgRating.toFixed(1)}</span>
              <span>({reviewCount} {t("app.reviews")})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{downloadCount} {t("app.downloads")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <span>{app.developer?.user?.username || t("app.unknown")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => handleDownload(latestVersion)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-foreground rounded-lg font-medium transition-colors"
        >
          <Download className="w-5 h-5" />
          {latestVersion ? `${t("app.download")} v${latestVersion.version}` : t("app.download")}
        </button>
        <button
          onClick={toggleFavorite}
          className={`inline-flex items-center gap-2 px-6 py-3 border rounded-lg font-medium transition-colors ${
            isFavorited
              ? "bg-error/10 border-error text-error"
              : "bg-elevated border-border hover:border-primary/50"
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
          {isFavorited ? t("app.favorited") : t("app.favorite")}
        </button>
        {app.websiteUrl && (
          <a
            href={app.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-elevated border border-border hover:border-primary/50 rounded-lg font-medium transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            {t("app.website")}
          </a>
        )}
      </div>

      {latestVersion && (
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h3 className="font-semibold mb-2">{t("app.latestVersion")}: {latestVersion.version}</h3>
          <p className="text-sm text-secondary-text">
          {t("app.platform")} {latestVersion.platform} {latestVersion.architecture && `(${latestVersion.architecture})`}
            {latestVersion.fileSize && ` • ${latestVersion.fileSize}`}
          </p>
          {latestVersion.changelog && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-1">{t("app.whatsNew")}</h4>
              <p className="text-sm text-secondary-text whitespace-pre-wrap">{latestVersion.changelog}</p>
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          {t("versionHistory.title")}
        </h2>
        {versions.length === 0 ? (
          <p className="text-secondary-text text-sm">{t("versionHistory.empty")}</p>
        ) : (
          <div className="space-y-3">
            {versions.map((v) => {
              const isLatest = latestVersion?.id === v.id;
              return (
                <div
                  key={v.id}
                  className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{v.version}</span>
                      {isLatest && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          {t("versionHistory.latest")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-text">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(v.releaseDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3" />
                        {v.platform}{v.architecture ? ` / ${v.architecture}` : ""}
                      </span>
                      {v.fileSize && <span>{v.fileSize}</span>}
                    </div>
                    {v.changelog && (
                      <p className="text-xs text-secondary-text mt-1 line-clamp-2">{v.changelog}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownload(v)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-primary hover:bg-primary/90 text-foreground rounded-lg font-medium transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {t("versionHistory.download")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {app.screenshots && app.screenshots.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t("app.screenshots")}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {app.screenshots.map((screenshot) => (
              <div
                key={screenshot.id}
                className="relative w-80 h-48 rounded-xl overflow-hidden border border-border flex-shrink-0"
              >
                <Image
                  src={screenshot.imageUrl}
                  alt={`${app.name} screenshot`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">{t("app.about")}</h2>
        <p className="text-secondary-text whitespace-pre-wrap leading-relaxed">
          {app.description || app.shortDescription}
        </p>
      </div>

      {latestVersion && (
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-accent" />
            {t("app.downloadInfo")}
          </h3>
          <div className="text-sm text-secondary-text space-y-1">
            <p>{t("app.provider")}: {latestVersion.provider || "direct"}</p>
            {latestVersion.externalFileId && <p>{t("app.fileId")}: {latestVersion.externalFileId}</p>}
            <p className="text-muted text-xs mt-2">
              {t("app.noBinary")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
