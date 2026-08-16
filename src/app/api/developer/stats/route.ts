import { NextResponse } from "next/server";
import { getDeveloperStatsDetailed } from "@/lib/firestore-service";

export async function GET() {
  try {
    const user = await (await import("@/lib/auth")).requireAuth();

    const developer = await (await import("@/lib/firestore-service")).getDeveloperByUserId(user.id);

    if (!developer) {
      return NextResponse.json(
        { error: "Developer profile not found" },
        { status: 404 }
      );
    }

    const stats = await getDeveloperStatsDetailed(developer.id);

    return NextResponse.json({
      totalDownloads: stats.totalDownloads,
      totalReviews: stats.totalReviews,
      totalFavorites: stats.totalFavorites,
      appCount: stats.appCount,
      recentDownloads: stats.recentDownloads,
    });
  } catch (error) {
    console.error("Error fetching developer stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
