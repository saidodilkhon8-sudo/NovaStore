import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUserByUsername, updateUser } from "@/lib/firestore-service";

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, avatar } = body;

    if (username !== undefined && username !== user.username) {
      const existing = await getUserByUsername(username);
      if (existing && existing.id !== user.id) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
    }

    const updated = await updateUser(user.id, {
      username: username ?? user.username,
      avatar: avatar ?? user.avatar,
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        avatar: updated.avatar,
        role: updated.role,
        developerId: user.developerId,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "An error occurred while updating profile" },
      { status: 500 }
    );
  }
}
