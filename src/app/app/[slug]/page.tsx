import { Suspense } from "react";
import { DetailsSkeleton } from "@/components/loading-skeleton";
import { AppDetails } from "@/components/app-details";

export default function AppPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Suspense fallback={<DetailsSkeleton />}>
          <AppDetails slug={(params as any).slug} />
        </Suspense>
      </div>
    </div>
  );
}
