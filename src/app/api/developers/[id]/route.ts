import { NextRequest, NextResponse } from "next/server";
import { getDeveloperWithApps } from "@/lib/firestore-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await getDeveloperWithApps(id);

    if (!result) {
      return NextResponse.json(
        { error: "Developer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      developer: result.developer,
      stats: result.stats,
      apps: result.apps,
    });
  } catch (error) {
    console.error("Error fetching developer:", error);
    return NextResponse.json(
      { error: "Failed to fetch developer" },
      { status: 500 }
    );
  }
}
