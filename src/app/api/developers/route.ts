import { NextResponse } from "next/server";
import { getDevelopersWithUserInfo } from "@/lib/firestore-service";

export async function GET() {
  try {
    const developers = await getDevelopersWithUserInfo();

    return NextResponse.json(developers);
  } catch (error) {
    console.error("Error fetching developers:", error);
    return NextResponse.json(
      { error: "Failed to fetch developers" },
      { status: 500 }
    );
  }
}
