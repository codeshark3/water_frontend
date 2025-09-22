import { NextResponse } from "next/server";
import { getDiseaseStats } from "~/server/dashboard_queries";

export async function GET() {
  try {
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