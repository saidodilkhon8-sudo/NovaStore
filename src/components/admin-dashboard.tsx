"use client";

import { useEffect, useState } from "react";
import { Shield, Users, Download, Star, MessageSquare } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

interface App {
  id: string;
  name: string;
  slug: string;
  status: string;
  developer: {
    user: { username: string };
  };
  versions: any[];
  _count: { reviews: number; downloads: number };
}

export function AdminDashboard() {
  const [apps, setApps] = useState<App[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appsRes, statsRes] = await Promise.all([
          fetch("/api/admin/apps"),
          fetch("/api/admin/stats"),
        ]);
        if (appsRes.ok) {
          const data = await appsRes.json();
          setApps(data.apps || []);
        }
        if (statsRes.ok) {
          setStats(await statsRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
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
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
          <Shield className="w-8 h-8 text-foreground" />
          {t("admin.title")}
        </h1>
        <p className="text-secondary-text mt-1">{t("admin.subtitle")}</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Download className="w-5 h-5 text-foreground" />} label={t("admin.totalApps")} value={stats.totalApps} />
          <StatCard icon={<Users className="w-5 h-5 text-foreground" />} label={t("admin.users")} value={stats.totalUsers} />
          <StatCard icon={<Star className="w-5 h-5 text-foreground" />} label={t("admin.downloads")} value={stats.totalDownloads} />
          <StatCard icon={<MessageSquare className="w-5 h-5 text-foreground" />} label={t("admin.reviews")} value={stats.totalReviews} />
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4 text-foreground">{t("admin.applications")}</h2>
        {apps.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-surface border border-border">
            <p className="text-secondary-text">{t("admin.noApplications")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app) => (
              <div
                key={app.id}
                className="p-5 rounded-2xl bg-surface border border-border"
              >
                <div className="flex items-start justify-between gap-4">
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
                        {app.status === "published" ? t("admin.published") : app.status === "draft" ? t("admin.draft") : t("admin.archived")}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-text">
                      by {app.developer.user.username}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted">
                      <span>{app._count.downloads} downloads</span>
                      <span>{app._count.reviews} reviews</span>
                      <span>v{app.versions[0]?.version || "0.0.0"}</span>
                    </div>
                  </div>
                </div>
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
