import { NextRequest, NextResponse } from "next/server";
import {
  db,
  getApplications,
  searchCategories,
  getDeveloperByUserId,
  getUserById,
} from "@/lib/firestore-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!q || q.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const term = q.toLowerCase();

    const publishedApps = await getApplications({ status: "published" });
    const matchedApps = publishedApps
      .filter(
        (app) =>
          app.name?.toLowerCase().includes(term) ||
          app.shortDescription?.toLowerCase().includes(term) ||
          app.slug?.toLowerCase().startsWith(term)
      )
      .slice(0, limit);

    const developersMap = new Map<string, { user: { username: string } }>();
    const developerIds = [
      ...new Set(matchedApps.map((a) => a.developerId).filter(Boolean)),
    ];
    for (const devId of developerIds) {
      const dev = await getDeveloperByUserId(devId);
      if (dev) {
        const user = await getUserById(dev.userId);
        developersMap.set(devId, {
          user: { username: user?.username || "" },
        });
      }
    }

    const apps = matchedApps.map((app) => ({
      ...app,
      developer: developersMap.get(app.developerId) || { user: { username: "" } },
      _count: {
        reviews: app._count?.reviews || 0,
        downloads: app._count?.downloads || 0,
      },
    }));

    const categories = await searchCategories(q);

    return NextResponse.json({
      apps,
      categories,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
