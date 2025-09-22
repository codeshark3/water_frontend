import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { tests } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateTestSchema = z.object({
  name: z.string().optional(),
  gender: z.string().optional(),
  age: z.coerce.number().int().optional(),
  location: z.string().optional(),
  oncho: z.string().optional(),
  schistosomiasis: z.string().optional(),
  lf: z.string().optional(),
  helminths: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;
    
    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    const json = await request.json();
    const data = UpdateTestSchema.parse(json);

    // Check if test exists
    const existingTest = await db.select().from(tests).where(eq(tests.id, testId));
    if (existingTest.length === 0) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Update the test
    const updatedTest = await db
      .update(tests)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(tests.id, testId))
      .returning();

    return NextResponse.json({ 
      success: true, 
      data: updatedTest[0],
      message: "Test updated successfully" 
    });

  } catch (error) {
    console.error("Error updating test:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update test" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;
    
    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    const test = await db.select().from(tests).where(eq(tests.id, testId));
    
    if (test.length === 0) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json({ data: test[0] });

  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: testId } = await params;
    
    if (!testId) {
      return NextResponse.json({ error: "Test ID is required" }, { status: 400 });
    }

    // Check if test exists
    const existingTest = await db.select().from(tests).where(eq(tests.id, testId));
    if (existingTest.length === 0) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Delete the test
    await db.delete(tests).where(eq(tests.id, testId));

    return NextResponse.json({ 
      success: true,
      message: "Test deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json(
      { error: "Failed to delete test" },
      { status: 500 }
    );
  }
}
