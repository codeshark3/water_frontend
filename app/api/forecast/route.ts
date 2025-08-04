import { NextResponse } from "next/server";
import { getForecastData } from "~/server/dashboard_queries";

export async function GET(request: Request) {
  try {
    // Get disease type from URL
    const url = new URL(request.url);
    const diseaseType = url.searchParams.get("disease");

    if (!diseaseType) {
      return NextResponse.json({ error: "Disease type is required" }, { status: 400 });
    }

    const data = await getForecastData(diseaseType);
    
    return NextResponse.json({ data, status: data ? "success" : "no_data" });
  } catch (error) {
    console.error("Error fetching forecast data:", error);
    return NextResponse.json(
      { error: "Failed to fetch forecast data" },
      { status: 500 }
    );
  }
} 