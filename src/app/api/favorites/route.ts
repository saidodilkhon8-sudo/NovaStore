import { NextRequest, NextResponse } from "next/server";
import { getFavoritesWithApps } from "@/lib/firestore-service";

export async function GET() {
  try {
    const user = await (await import("@/lib/auth")).requireAuth();

    const favorites = await getFavoritesWithApps(user.id);

    const apps = favorites
      .map((fav) => fav.application)
      .filter((app) => app != null);

    return NextResponse.json({ apps });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}
