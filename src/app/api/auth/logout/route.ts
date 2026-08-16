import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;

  if (token) {
    try {
      const db = getFirebaseAdminDb();
      await db.collection("sessions").doc(token).delete();
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  const response = NextResponse.json({ message: "Logged out successfully" });
  response.cookies.set("session-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
