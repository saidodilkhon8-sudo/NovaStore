import { NextRequest, NextResponse } from "next/server";
import {
  getAppById,
  getDeveloperByUserId,
  getCategoryById,
  getVersions,
  getScreenshots,
  updateApplication,
  deleteApplication,
  getUserById,
} from "@/lib/firestore-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await (await import("@/lib/auth")).requireAuth();
    const { id } = await params;

    const app = await getAppById(id);

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

    const category = await getCategoryById(app.categoryId);
    const versions = await getVersions(app.id);
    const screenshots = await getScreenshots(app.id);

    return NextResponse.json({
      app: {
        ...app,
        developer: developer ? { userId: developer.userId } : null,
        category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
        versions,
        screenshots,
      },
    });
  } catch (error) {
    console.error("Error fetching app:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await (await import("@/lib/auth")).requireAuth();
    const { id } = await params;
    const body = await request.json();

    const app = await getAppById(id);

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

    const updated = await updateApplication(id, {
      name: body.name,
      shortDescription: body.shortDescription,
      description: body.description,
      categoryId: body.categoryId,
      license: body.license,
      isFree: body.isFree,
      platforms: body.platforms,
      iconUrl: body.iconUrl,
      websiteUrl: body.websiteUrl,
      privacyPolicyUrl: body.privacyPolicyUrl,
      status: body.status,
    });

    return NextResponse.json({ app: updated });
  } catch (error) {
    console.error("Error updating app:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await (await import("@/lib/auth")).requireAuth();
    const { id } = await params;

    const app = await getAppById(id);

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

    await deleteApplication(id);

    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    console.error("Error deleting app:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
