import { NextRequest, NextResponse } from "next/server";
import { getApplications, createApplication, getCategoryBySlug, getDeveloperByUserId } from "@/lib/firestore-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "newest";
    const search = searchParams.get("search");
    const platform = searchParams.get("platform");

    let categoryId: string | undefined;
    if (category) {
      const cat = await getCategoryBySlug(category);
      if (cat) {
        categoryId = cat.id;
      }
    }

    const apps = await getApplications({
      categoryId,
      status: "published",
      search: search || undefined,
      platform: platform || undefined,
    });

    let sortedApps = apps;
    if (sort === "newest") {
      sortedApps = apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = sortedApps.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedApps = sortedApps.slice(start, start + limit);

    return NextResponse.json({
      apps: paginatedApps,
      total,
      page,
      limit,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching apps:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await (await import("@/lib/auth")).requireAuth();
    const body = await request.json();

    const { name, shortDescription, description, categoryId, license, isFree, platforms, iconUrl, websiteUrl, privacyPolicyUrl } = body;

    if (!name || !shortDescription || !categoryId) {
      return NextResponse.json(
        { error: "Name, short description, and category are required" },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existingApps = await getApplications();
    const existingApp = existingApps.find((app) => app.slug === slug);

    if (existingApp) {
      return NextResponse.json(
        { error: "An application with this name already exists" },
        { status: 409 }
      );
    }

    const developer = await getDeveloperByUserId(user.id);
    if (!developer) {
      return NextResponse.json(
        { error: "Developer profile not found" },
        { status: 403 }
      );
    }

    const category = await getCategoryBySlug(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const app = await createApplication({
      name,
      slug,
      shortDescription,
      description,
      categoryId: category.id,
      categoryName: category.name,
      license,
      isFree: isFree ?? true,
      platforms: platforms || ["windows"],
      iconUrl,
      websiteUrl,
      privacyPolicyUrl,
      developerId: developer.id,
      developerName: developer.displayName,
      status: "published",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("Error creating app:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
