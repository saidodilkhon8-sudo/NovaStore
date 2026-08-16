import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 });
    }

    const decodedToken = await getFirebaseAdminAuth().verifyIdToken(idToken);
    const db = getFirebaseAdminDb();

    let userDoc = await db.collection("users").doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      const username = decodedToken.email?.split("@")[0] || `user_${Date.now()}`;
      await db.collection("users").doc(decodedToken.uid).set({
        email: decodedToken.email || "",
        username,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      userDoc = await db.collection("users").doc(decodedToken.uid).get();
    }

    const user = userDoc.data() as any;
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.collection("sessions").doc(sessionToken).set({
      userId: decodedToken.uid,
      token: sessionToken,
      expiresAt,
      createdAt: new Date(),
    });

    const response = NextResponse.json({
      user: {
        id: decodedToken.uid,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        developerId: user.developerId,
      },
    });

    response.cookies.set("session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Firebase session error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
