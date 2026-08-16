import { NextRequest, NextResponse } from "next/server";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, role = "user" } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const auth = getFirebaseAdminAuth();
    const db = getFirebaseAdminDb();

    const firebaseUser = await auth.createUser({
      email,
      password,
      displayName: username || email.split("@")[0],
    });

    const userRef = await db.collection("users").doc(firebaseUser.uid).set({
      email,
      username: username || email.split("@")[0],
      role: role === "developer" ? "developer" : "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (role === "developer") {
      await db.collection("developers").add({
        userId: firebaseUser.uid,
        displayName: username || email.split("@")[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json(
        { error: "Email already exists. If you used Google, try signing in with Google instead." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "An error occurred during registration" },
      { status: 500 }
    );
  }
}
