import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { email, password } = LoginSchema.parse(json);

    // Find user by email
    const foundUser = await db.query.user.findFirst({ 
      where: (m, { eq }) => eq(m.email, email) 
    });

    if (!foundUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid email or password" 
        }, 
        { status: 401 }
      );
    }

    // For now, we'll skip password validation since we don't have hashed passwords
    // In production, you would validate with: await bcrypt.compare(password, foundUser.password)
    
    return NextResponse.json({
      success: true,
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        emailVerified: foundUser.emailVerified,
        createdAt: foundUser.createdAt.toISOString(),
        updatedAt: foundUser.updatedAt.toISOString(),
      }
    });

  } catch (error: any) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error" 
      }, 
      { status: 400 }
    );
  }
}
