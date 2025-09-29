import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Check for session cookie
    const sessionCookie = req.cookies.get('user-session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({
        success: false,
        message: "No session found"
      }, { status: 401 });
    }

    // Parse session data
    const sessionData = JSON.parse(sessionCookie);
    
    return NextResponse.json({
      success: true,
      user: sessionData
    });

  } catch (error: any) {
    console.error("Session check error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Internal server error" 
      }, 
      { status: 500 }
    );
  }
}
