import { NextRequest, NextResponse } from "next/server";
import {
  getApplicationBySlug,
  getVersionById,
  updateVersion,
  getVersions,
  db,
} from "@/lib/firestore-service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; versionId: string }> }
) {
  try {
    const { slug, versionId } = await params;
    const body = await request.json();
    const { changelog, fileSize, architecture, platform, status } = body;

    const app = await getApplicationBySlug(slug);
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const version = await getVersionById(app.id, versionId);
    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const updateData: Record<string, string> = {};
    if (changelog !== undefined) updateData.changelog = changelog;
    if (fileSize !== undefined) updateData.fileSize = fileSize;
    if (architecture !== undefined) updateData.architecture = architecture;
    if (platform !== undefined) updateData.platform = platform;
    if (status !== undefined) updateData.status = status;

    const updated = await updateVersion(app.id, versionId, updateData);

    return NextResponse.json({ version: updated });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; versionId: string }> }
) {
  try {
    const { slug, versionId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!["publish", "archive", "rollback"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const app = await getApplicationBySlug(slug);
    if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const version = await getVersionById(app.id, versionId);
    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    if (action === "rollback") {
      const allVersions = await getVersions(app.id);
      const batch = db().batch();
      allVersions.forEach((v) => {
        batch.update(
          db()
            .collection("applications")
            .doc(app.id)
            .collection("versions")
            .doc(v.id),
          { status: "archived" }
        );
      });
      await batch.commit();
      await updateVersion(app.id, versionId, { status: "published" });
    } else if (action === "archive") {
      await updateVersion(app.id, versionId, { status: "archived" });
    } else if (action === "publish") {
      await updateVersion(app.id, versionId, { status: "published" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
