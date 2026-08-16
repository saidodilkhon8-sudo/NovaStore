"use client";

import { Suspense } from "react";
import { AdminDashboard } from "@/components/admin-dashboard";
import { useLanguage } from "@/components/language-provider";

export default function AdminPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<div className="animate-pulse space-y-6">{t("admin.loading")}</div>}>
          <AdminDashboard />
        </Suspense>
      </div>
    </div>
  );
}
