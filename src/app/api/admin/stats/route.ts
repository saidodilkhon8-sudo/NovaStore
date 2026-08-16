import { NextResponse } from "next/server";
import { getStats, getDeveloperStats } from "@/lib/firestore-service";

export async function GET() {
  try {
    await (await import("@/lib/auth")).requireAdmin();

    const stats = await getStats();
    const developersSnapshot = await (await import("@/lib/firestore-service")).db()
      .collection("developers")
      .get();

    return NextResponse.json({
      totalApps: stats.totalApps,
      totalUsers: stats.totalUsers,
      totalDevelopers: developersSnapshot.size,
      totalDownloads: stats.totalDownloads,
      totalReviews: stats.totalReviews,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
