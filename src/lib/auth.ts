import { cookies } from "next/headers";
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import { Session } from "@/lib/types";

export async function getCurrentUser(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) return null;

  try {
    const db = getFirebaseAdminDb();
    const sessionDoc = await db.collection("sessions").doc(token).get();
    if (!sessionDoc.exists) return null;

    const session = sessionDoc.data() as any;
    const expiresAt = session.expiresAt?.toDate?.() || new Date(session.expiresAt);
    if (expiresAt < new Date()) {
      await db.collection("sessions").doc(token).delete();
      return null;
    }

    const userDoc = await db.collection("users").doc(session.userId).get();
    if (!userDoc.exists) return null;

    const user = userDoc.data() as any;
    const developerDoc = user.developerId ? await db.collection("developers").doc(user.developerId).get() : null;

    return {
      id: userDoc.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar ?? undefined,
      role: user.role as "user" | "developer" | "admin",
      developerId: developerDoc?.id,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<Session> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin(): Promise<Session> {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}
