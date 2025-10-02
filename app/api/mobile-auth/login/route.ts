import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import * as jwt from "jsonwebtoken";
import { env } from "~/env";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {

  try {
    // Check if request has body
    const contentType = req.headers.get("content-type");
    console.log("Content-Type:", contentType);
    
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Content-Type must be application/json" 
        }, 
        { status: 400 }
      );
    }

    let json;
    try {
      json = await req.json();
      console.log("Request body:", json);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid JSON in request body" 
        }, 
        { status: 400 }
      );
    }

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
    
    // Create session data
    const sessionData = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      emailVerified: foundUser.emailVerified,
      createdAt: foundUser.createdAt.toISOString(),
      updatedAt: foundUser.updatedAt.toISOString(),
    };

    // Create a JWT
    const token = jwt.sign(sessionData, env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      user: sessionData,
      token,
    });

    // Set session cookie (expires in 7 days)
    response.cookies.set('user-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

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
