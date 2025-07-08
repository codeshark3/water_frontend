import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "~/lib/auth";
import { auth } from "~/lib/auth";
// Type for route matching
const publicRoutes = [
  "/",
'/flask-api/python',
"/tests"
];
const authRoutes = ["/sign-in", "/sign-up"];
const passwordRoutes = ["/reset-password", "/forgot-password"];
const staffRoutes = [
  "/staff",
  //"/tests",
  "/datasets/create",
  "/datasets/update/:id*",
 "/dashboard",
  "/tests/[id]",
];
const adminRoutes = [
  "/admin",
  "/admin/users",
  "/admin/users/new",
  "/admin/users/[id]",
  "/datasets/create",
  "/datasets/update/:id*",
  "/datasets",
  "/datasets/delete/:id*",
  "/dashboard",
  "/access",
];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  // Check if it's a dynamic dataset route like /datasets/123
  const isDynamicTestRoute = /^\/tests\/[^\/]+$/.test(pathName);

  // Check if the request path matches any of the defined routes
  const isPublicRoute =
    publicRoutes.includes(pathName) ||
    isDynamicTestRoute 
   
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isStaffRoute = staffRoutes.includes(pathName);
  const isDynamicAdminRoute = /^\/admin\/[^\/]+/.test(pathName);
  const isAdminRoute = adminRoutes.includes(pathName) || isDynamicAdminRoute;

  
  console.log(
    "Path:",
    pathName,
    "isDynamicRoute:",
    isDynamicTestRoute ,
    "isPublic:",
    isPublicRoute,
    "isAdmin:",
    isAdminRoute,
    "isStaff:",
    isStaffRoute,
  
  );
  console.log("Middleware Path:", request.nextUrl.pathname);
  console.log("Headers:", request.headers);

 
  let session: Session | null = null;

  try {
    const response = await betterFetch<Session>("/api/auth/get-session", {
      baseURL: process.env.BETTER_AUTH_URL,
      headers: { cookie: request.headers.get("cookie") || "" },
    });

    if (!response || !response.data) {
      console.warn("Session fetch failed, response:", response);
    }

    session = response?.data || null;
  } catch (error) {
    console.error("Failed to fetch session:", error);
  }

  // If no session (unauthenticated)
  if (!session) {
    if (isPublicRoute || isAuthRoute || isPasswordRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If authenticated, restrict access based on role
  const { role } = session.user;

  // Staff can access public and staff routes only
  if (role === "user") {
    if (isPublicRoute || isStaffRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Admin can access public and admin routes only
  if (role === "admin") {
    if (isPublicRoute || isAdminRoute || isStaffRoute || isDynamicTestRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  
  // Default: Redirect unauthorized access to home
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
