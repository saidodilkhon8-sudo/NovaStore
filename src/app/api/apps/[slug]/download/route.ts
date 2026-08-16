import { NextRequest, NextResponse } from "next/server";
import { getApplicationBySlug, getLatestVersion, createDownload } from "@/lib/firestore-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const platform = body.platform || "unknown";

    const app = await getApplicationBySlug(slug);

    if (!app || app.status !== "published") {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const version =
      platform === "unknown"
        ? await getLatestVersion(app.id)
        : await getLatestVersion(app.id, platform);

    if (!version) {
      return NextResponse.json(
        { error: "No downloadable version found" },
        { status: 404 }
      );
    }

    const user = await (await import("@/lib/auth")).getCurrentUser();

    await createDownload({
      applicationId: app.id,
      versionId: version.id,
      userId: user?.id,
      platform: platform !== "unknown" ? platform : undefined,
    });

    return NextResponse.json({
      downloadUrl: version.downloadUrl,
      provider: version.provider,
      version: version.version,
    });
  } catch (error) {
    console.error("Error recording download:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}
