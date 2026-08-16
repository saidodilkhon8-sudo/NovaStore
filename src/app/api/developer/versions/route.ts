import { NextRequest, NextResponse } from "next/server";
import {
  getAppById,
  getDeveloperByUserId,
  createVersion,
  updateApplicationStatus,
} from "@/lib/firestore-service";
import { extractGoogleDriveFileId, isValidGoogleDriveUrl } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const user = await (await import("@/lib/auth")).requireAuth();
    const body = await request.json();

    const {
      applicationId,
      version,
      changelog,
      platform,
      architecture,
      fileSize,
      downloadUrl,
      provider,
      externalFileId,
      checksum,
    } = body;

    if (!applicationId || !version || !platform || !downloadUrl) {
      return NextResponse.json(
        { error: "Application ID, version, platform, and download URL are required" },
        { status: 400 }
      );
    }

    const app = await getAppById(applicationId);

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const developer = await getDeveloperByUserId(app.developerId);
    if (developer?.userId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const normalizedUrl = downloadUrl.trim();
    if (!normalizedUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Download URL must use HTTPS" },
        { status: 400 }
      );
    }

    let finalExternalFileId = externalFileId;
    let isGoogleDrive = false;

    if (isValidGoogleDriveUrl(normalizedUrl)) {
      isGoogleDrive = true;
      const extractedFileId = extractGoogleDriveFileId(normalizedUrl);
      if (extractedFileId) {
        finalExternalFileId = extractedFileId;
      }
    }

    const versionRecord = await createVersion(applicationId, {
      version,
      changelog,
      platform,
      architecture,
      fileSize,
      downloadUrl: normalizedUrl,
      provider: provider || "direct",
      externalFileId: finalExternalFileId,
      checksum,
      status: "published",
    });

    if (app.status === "draft") {
      await updateApplicationStatus(applicationId, "published");
    }

    return NextResponse.json(
      { ...versionRecord, isGoogleDrive, externalFileId: finalExternalFileId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating version:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create version" },
      { status: 500 }
    );
  }
}
