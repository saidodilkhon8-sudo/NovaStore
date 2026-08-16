import { Suspense } from "react";
import { DeveloperProfileContent } from "./content";

export default function DeveloperProfilePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={<ProfileSkeleton />}>
          <DeveloperProfileContent id={(params as any).id} />
        </Suspense>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-elevated" />
        <div className="space-y-3 flex-1">
          <div className="h-8 bg-elevated rounded w-48" />
          <div className="h-4 bg-elevated rounded w-96" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 bg-elevated rounded-xl" />
        ))}
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-elevated rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
