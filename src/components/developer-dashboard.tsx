"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, BarChart3, Download, Star, Heart, ExternalLink, Upload, CheckCircle, XCircle } from "lucide-react";
import { Application } from "@/lib/types";
import { useLanguage } from "@/components/language-provider";
import { isValidGoogleDriveUrl, extractGoogleDriveFileId, isValidUrl } from "@/lib/validators";

export function DeveloperDashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, statsRes] = await Promise.all([
          fetch("/api/developer/apps"),
          fetch("/api/developer/stats"),
        ]);
        if (appsRes.ok) {
          const appsData = await appsRes.json();
          setApps(appsData.apps || []);
        }
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch (err) {
        console.error(t("errors.fetchFailed"), err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-elevated rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-elevated rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("developer.title")}</h1>
          <p className="text-secondary-text mt-1">{t("developer.subtitle")}</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg font-medium transition-colors hover:bg-neutral-200"
        >
          <Plus className="w-5 h-5" />
          {t("developer.newApp")}
        </button>
      </div>

      {showCreateForm && (
        <CreateAppForm onSuccess={() => setShowCreateForm(false)} />
      )}

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Download className="w-5 h-5 text-foreground" />} label={t("developer.stats.downloads")} value={stats.totalDownloads} />
          <StatCard icon={<Star className="w-5 h-5 text-foreground" />} label={t("developer.stats.reviews")} value={stats.totalReviews} />
          <StatCard icon={<Heart className="w-5 h-5 text-foreground" />} label={t("developer.stats.favorites")} value={stats.totalFavorites} />
          <StatCard icon={<BarChart3 className="w-5 h-5 text-foreground" />} label={t("developer.stats.apps")} value={stats.appCount} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">{t("developer.empty").split(" ")[0]} {t("developer.empty").split(" ").slice(1).join(" ")}</h2>
        {apps.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-surface border border-border">
            <p className="text-secondary-text mb-4">{t("developer.empty")}</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="text-foreground hover:underline"
            >
              {t("developer.createFirst")}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-surface border border-border hover:border-foreground/50 transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-elevated border border-border flex-shrink-0">
                      {app.iconUrl ? (
                        <img src={app.iconUrl} alt={app.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-foreground">
                          {app.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate text-foreground">{app.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          app.status === "published"
                            ? "bg-primary/10 text-foreground"
                            : app.status === "draft"
                            ? "bg-primary/5 text-secondary-text"
                            : "bg-primary/5 text-muted"
                        }`}>
                          {app.status === "published" ? t("status.published") : app.status === "draft" ? t("status.draft") : t("status.archived")}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-text line-clamp-1">{app.shortDescription}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                        <span>{app._count?.downloads || 0} downloads</span>
                        <span>{app._count?.reviews || 0} reviews</span>
                        <span>v{app.versions?.[0]?.version || "0.0.0"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveAppId(activeAppId === app.id ? null : app.id)}
                      className="px-3 py-1.5 text-xs bg-primary text-background rounded-lg font-medium transition-colors hover:bg-neutral-200"
                    >
                      {activeAppId === app.id ? t("developer.hide") : t("developer.addVersion")}
                    </button>
                  </div>
                </div>
                {activeAppId === app.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <AddVersionForm appId={app.id} onSuccess={() => {}} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border">
      <div className="flex items-center gap-3">
        <div className="text-foreground">{icon}</div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-secondary-text">{label}</p>
        </div>
      </div>
    </div>
  );
}

function CreateAppForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, shortDescription, description, categoryId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errors.createFailed"));
        return;
      }
      setSuccess(true);
      setName("");
      setShortDescription("");
      setDescription("");
      setCategoryId("");
      onSuccess();
    } catch {
      setError(t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-surface border border-border space-y-4">
      <h3 className="text-lg font-semibold text-foreground">{t("developer.newApp")}</h3>
      {success && (
        <div className="p-3 rounded-lg bg-primary/10 border border-foreground/20 text-foreground text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {t("developer.published")}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-primary/10 border border-foreground/20 text-foreground text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.appName")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.category")}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
            required
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.shortDescription")}</label>
        <input
          type="text"
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.fullDescription")}</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2.5 bg-elevated border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
          rows={4}
        />
      </div>
      <div className="p-4 rounded-xl bg-elevated border border-border">
        <div className="flex items-start gap-3">
          <Upload className="w-5 h-5 text-foreground mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-medium text-foreground mb-1">{t("developer.instantPublishing")}</h4>
            <p className="text-xs text-secondary-text mb-3">
              {t("developer.instantPublishing.desc")}
            </p>
            <p className="text-xs text-muted">
              {t("developer.supportedFormats")}
            </p>
            <ul className="text-xs text-muted mt-1 list-disc list-inside">
              <li>https://drive.google.com/file/d/.../view</li>
              <li>https://drive.google.com/open?id=...</li>
              <li>https://drive.google.com/uc?id=...</li>
            </ul>
          </div>
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-primary text-background rounded-lg font-medium transition-colors disabled:opacity-50 hover:bg-neutral-200"
      >
        {loading ? t("developer.creating") : t("developer.create")}
      </button>
    </form>
  );
}

function AddVersionForm({ appId, onSuccess }: { appId: string; onSuccess: () => void }) {
  const [version, setVersion] = useState("");
  const [platform, setPlatform] = useState("windows");
  const [architecture, setArchitecture] = useState("x64");
  const [fileSize, setFileSize] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [changelog, setChangelog] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validation, setValidation] = useState<{ valid: boolean; fileId?: string } | null>(null);
  const { t } = useLanguage();

  const validateUrl = () => {
    if (isValidGoogleDriveUrl(downloadUrl)) {
      const fileId = extractGoogleDriveFileId(downloadUrl);
      setValidation({ valid: true, fileId: fileId || undefined });
    } else if (isValidUrl(downloadUrl)) {
      setValidation({ valid: true });
    } else {
      setValidation({ valid: false });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/developer/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: appId,
          version,
          platform,
          architecture,
          fileSize,
          downloadUrl,
          changelog,
          provider: isValidGoogleDriveUrl(downloadUrl) ? "google_drive" : "direct",
          externalFileId: validation?.fileId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || t("errors.createFailed"));
        return;
      }
      setSuccess(true);
      setVersion("");
      setFileSize("");
      setDownloadUrl("");
      setChangelog("");
      setValidation(null);
      onSuccess();
    } catch {
      setError(t("error.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-elevated border border-border space-y-4">
      <h4 className="text-lg font-semibold text-foreground">{t("developer.addVersion")}</h4>
      {success && (
        <div className="p-3 rounded-lg bg-primary/10 border border-foreground/20 text-foreground text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {t("developer.versionPublished")}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-primary/10 border border-foreground/20 text-foreground text-sm flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.version")}</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.0"
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.platform")}</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
          >
            <option value="windows">{t("platform.windows")}</option>
            <option value="linux">{t("platform.linux")}</option>
            <option value="macos">{t("platform.macos")}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.architecture")}</label>
          <select
            value={architecture}
            onChange={(e) => setArchitecture(e.target.value)}
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
          >
            <option value="x64">{t("architecture.x64")}</option>
            <option value="x86">{t("architecture.x86")}</option>
            <option value="arm64">{t("architecture.arm64")}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.fileSize")}</label>
          <input
            type="text"
            value={fileSize}
            onChange={(e) => setFileSize(e.target.value)}
            placeholder="85 MB"
            className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.downloadUrl")}</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={downloadUrl}
            onChange={(e) => { setDownloadUrl(e.target.value); setValidation(null); }}
            placeholder="https://drive.google.com/file/d/.../view"
            className="flex-1 px-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
            required
          />
          <button
            type="button"
            onClick={validateUrl}
            className="px-4 py-2 bg-primary text-background rounded-lg font-medium transition-colors hover:bg-neutral-200"
          >
            {t("developer.validate")}
          </button>
        </div>
        {validation && (
          <div className={`mt-2 text-xs flex items-center gap-1 ${validation.valid ? "text-foreground" : "text-error"}`}>
            {validation.valid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            {validation.valid
              ? validation.fileId
                ? `${t("developer.validGoogleDriveFileId")} ${validation.fileId}`
                : t("developer.validHttpsUrl")
              : t("developer.invalidUrl")}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-secondary-text">{t("developer.changelog")}</label>
        <textarea
          value={changelog}
          onChange={(e) => setChangelog(e.target.value)}
          placeholder={t("developer.changelog.placeholder")}
          className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg focus:outline-none focus:border-foreground text-foreground"
          rows={3}
        />
      </div>
      <button
        type="submit"
        disabled={loading || !validation?.valid}
        className="px-6 py-2.5 bg-primary text-background rounded-lg font-medium transition-colors disabled:opacity-50 hover:bg-neutral-200"
      >
        {loading ? t("developer.publishingButton") : t("developer.publishVersion")}
      </button>
    </form>
  );
}
