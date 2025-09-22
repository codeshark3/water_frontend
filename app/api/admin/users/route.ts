import { NextResponse } from "next/server";
import { db } from "~/server/db";
import { user as userTable } from "~/server/db/schema";

export async function GET() {
  try {
    const users = await db.query.user.findMany({
      orderBy: (model, { desc }) => desc(model.createdAt),
    });
    // Ensure serializable
    const safeUsers = users.map((u) => ({
      ...u,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : (u.createdAt as any),
      updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : (u.updatedAt as any),
    }));
    return NextResponse.json({ users: safeUsers });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}


