import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { tests } from "~/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const limit = url.searchParams.get("limit");
    const offset = url.searchParams.get("offset");

    let query = db.select().from(tests);

    // Filter by user if userId provided
    if (userId) {
      query = query.where(eq(tests.userId, userId));
    }

    // Order by creation date (newest first)
    query = query.orderBy(desc(tests.createdAt));

    // Apply pagination if provided
    if (limit) {
      const limitNum = parseInt(limit);
      if (limitNum > 0) {
        query = query.limit(limitNum);
      }
    }

    if (offset) {
      const offsetNum = parseInt(offset);
      if (offsetNum > 0) {
        query = query.offset(offsetNum);
      }
    }

    const allTests = await query;

    // Format the response to match mobile app expectations
    const formattedTests = allTests.map(test => ({
      id: test.id,
      name: test.name,
      gender: test.gender,
      age: test.age,
      location: test.location,
      participantId: test.participantId || test.id, // Use participantId if available, fallback to id
      userId: test.userId,
      oncho: test.oncho,
      schistosomiasis: test.schistosomiasis,
      lf: test.lf,
      helminths: test.helminths,
      createdAt: test.createdAt?.toISOString(),
      updatedAt: test.updatedAt?.toISOString(),
      // Add sync status for mobile compatibility
      syncStatus: "synced",
      createdBy: test.userId, // Using userId as createdBy for now
    }));

    return NextResponse.json({ 
      success: true,
      data: formattedTests,
      total: formattedTests.length
    });

  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch tests" 
      },
      { status: 500 }
    );
  }
}
