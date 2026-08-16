import { NextRequest, NextResponse } from "next/server";
import { getApplicationBySlug, getLatestPublishedVersion } from "@/lib/firestore-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const app = await getApplicationBySlug(slug);
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const latestVersion = await getLatestPublishedVersion(app.id);

    if (!latestVersion) {
      return NextResponse.json({ error: "No published version" }, { status: 404 });
    }

    return NextResponse.json({ version: latestVersion });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
