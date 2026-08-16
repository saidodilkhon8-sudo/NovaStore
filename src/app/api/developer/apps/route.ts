import { NextRequest, NextResponse } from "next/server";
import { getDeveloperAppsDetailed } from "@/lib/firestore-service";

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

    const apps = await getDeveloperAppsDetailed(developer.id);

    return NextResponse.json({ apps });
  } catch (error) {
    console.error("Error fetching developer apps:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
