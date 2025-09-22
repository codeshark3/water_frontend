import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomUUID } from "crypto";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { email, password, name } = RegisterSchema.parse(json);

    // Check if user already exists
    const existingUser = await db.query.user.findFirst({ 
      where: (m, { eq }) => eq(m.email, email) 
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User with this email already exists" 
        }, 
        { status: 400 }
      );
    }

    // Create new user
    const newUser = {
      id: randomUUID(),
      email,
      name,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "user",
      banned: false,
      banReason: null,
      image: null,
    };

    await db.insert(user).values(newUser);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt.toISOString(),
        updatedAt: newUser.updatedAt.toISOString(),
      }
    });

  } catch (error: any) {
    console.error("Mobile register error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error" 
      }, 
      { status: 400 }
    );
  }
}
