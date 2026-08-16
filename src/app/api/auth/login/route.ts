import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = getFirebaseAdminDb();
    const usersSnapshot = await db.collection("users").where("email", "==", email).get();
    
    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = usersSnapshot.docs[0].data() as any;
    
    return NextResponse.json({
      user: {
        id: usersSnapshot.docs[0].id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        developerId: user.developerId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
