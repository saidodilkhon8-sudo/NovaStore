import { NextRequest, NextResponse } from "next/server";
import { getApplicationBySlug, getReviews, createReview, updateReview } from "@/lib/firestore-service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const app = await getApplicationBySlug(slug);

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const allReviews = await getReviews(app.id);
    const sortedReviews = allReviews.sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
    const total = sortedReviews.length;
    const start = (page - 1) * limit;
    const reviews = sortedReviews.slice(start, start + limit).map((r) => ({
      ...r,
      user: { username: r.username, avatar: r.avatar },
    }));

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await (await import("@/lib/auth")).requireAuth();
    const { slug } = await params;
    const { rating, text } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    const app = await getApplicationBySlug(slug);

    if (!app) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    const allReviews = await getReviews(app.id);
    const existingReview = allReviews.find(
      (r) => r.userId === user.id && r.applicationId === app.id
    );

    if (existingReview) {
      const updated = await updateReview(existingReview.id, { rating, text });
      return NextResponse.json({
        ...updated,
        user: { username: updated.username, avatar: updated.avatar },
      });
    }

    const review = await createReview({
      applicationId: app.id,
      userId: user.id,
      username: user.username,
      avatar: user.avatar,
      rating,
      text,
    });

    return NextResponse.json(
      { ...review, user: { username: review.username, avatar: review.avatar } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
