import { NextRequest, NextResponse } from "next/server";
import { getApplicationBySlug, getFavorites, createFavorite, deleteFavorite } from "@/lib/firestore-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await (await import("@/lib/auth")).requireAuth();
    const { slug } = await params;

    const app = await getApplicationBySlug(slug);

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const existing = await getFavorites(user.id);
    const found = existing.find((f) => f.applicationId === app.id);

    if (found) {
      await deleteFavorite(user.id, app.id);
      return NextResponse.json({ favorited: false });
    }

    await createFavorite({
      userId: user.id,
      applicationId: app.id,
    });

    return NextResponse.json({ favorited: true });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 }
    );
  }
}
