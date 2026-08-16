import { NextRequest, NextResponse } from "next/server";
import { getApplicationBySlug, getVersions } from "@/lib/firestore-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const app = await getApplicationBySlug(slug);
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const versions = await getVersions(app.id);

    return NextResponse.json({ versions });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
