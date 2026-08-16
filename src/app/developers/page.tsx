"use client";

import { Suspense } from "react";
import { DevelopersList } from "./list";
import { AppGridSkeleton } from "@/components/loading-skeleton";

import { useLanguage } from "@/components/language-provider";

export default function DevelopersPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t("developers.title")}</h1>
          <p className="text-secondary-text">{t("developers.subtitle")}</p>
        </div>
        <Suspense fallback={<AppGridSkeleton count={6} />}>
          <DevelopersList />
        </Suspense>
      </div>
    </div>
  );
}
