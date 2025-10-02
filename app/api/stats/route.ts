import { NextResponse } from "next/server";
import { verifyToken } from "~/lib/auth-mobile";
import { getDiseaseStats } from "~/server/dashboard_queries";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDiseaseStats();
    return NextResponse.json({ data: stats, status: "success" });
  } catch (error) {
    console.error("Error fetching disease stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch disease stats" },
      { status: 500 }
    );
  }
} 