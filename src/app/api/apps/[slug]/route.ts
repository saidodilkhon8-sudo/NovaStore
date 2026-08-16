import { NextRequest, NextResponse } from "next/server";
import { getApplicationDetails } from "@/lib/firestore-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const app = await getApplicationDetails(slug);

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (app.status !== "published") {
      const user = await (await import("@/lib/auth")).getCurrentUser();
      const isOwner = user?.developerId === app.developerId;
      const isAdmin = user?.role === "admin";
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: "Application not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(app);
  } catch (error) {
    console.error("Error fetching app:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}
