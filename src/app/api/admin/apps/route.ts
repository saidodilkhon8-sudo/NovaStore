import { NextRequest, NextResponse } from "next/server";
import { getApplicationsForAdmin } from "@/lib/firestore-service";

export async function GET() {
  try {
    await (await import("@/lib/auth")).requireAdmin();

    const apps = await getApplicationsForAdmin();

    return NextResponse.json({ apps });
  } catch (error) {
    console.error("Error fetching admin apps:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}
