"use client";

import { Suspense } from "react";
import { AppGridSkeleton } from "@/components/loading-skeleton";
import { ExploreContent } from "@/components/explore-content";
import { useLanguage } from "@/components/language-provider";

export default function ExplorePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("explore.title")}</h1>
          <p className="text-secondary-text">{t("explore.subtitle")}</p>
        </div>
        <Suspense fallback={<AppGridSkeleton />}>
          <ExploreContent />
        </Suspense>
      </div>
    </div>
  );
}
