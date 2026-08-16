"use client";

import Link from "next/link";
import Image from "next/image";
import { Download, Star, ChevronRight } from "lucide-react";
import { Application } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/components/language-provider";

interface AppCardProps {
  app: Application;
}

export function AppCard({ app }: AppCardProps) {
  const { t } = useLanguage();
  const avgRating = app.averageRating || 0;
  const reviewCount = app._count?.reviews || 0;
  const downloadCount = app._count?.downloads || 0;

  return (
    <Link
      href={`/app/${app.slug}`}
      className="group block p-5 rounded-2xl bg-surface border border-border hover:border-foreground/50 transition-all duration-200"
    >
      <div className="flex gap-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-elevated border border-border flex-shrink-0">
          {app.iconUrl ? (
            <Image
              src={app.iconUrl}
              alt={app.name}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-foreground">
              {app.name[0]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-foreground transition-colors truncate">
                {app.name}
              </h3>
              <p className="text-sm text-secondary-text">
                {app.developer?.user?.username || t("app.unknownDeveloper")}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted group-hover:text-foreground transition-colors flex-shrink-0" />
          </div>

          <p className="text-sm text-secondary-text mt-1 line-clamp-2">
            {app.shortDescription}
          </p>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted">
            {avgRating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
                <span className="text-secondary-text font-medium">{avgRating.toFixed(1)}</span>
                <span>({reviewCount})</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              <span>{downloadCount}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-foreground text-xs">
              {app.category?.name || t("app.other")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
