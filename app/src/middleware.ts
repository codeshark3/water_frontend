import { betterFetch } from "@better-fetch/fetch";
import { NextResponse, type NextRequest } from "next/server";
import type { Session } from "~/lib/auth";

// Type for route matching
const publicRoutes = [
  "/",
  "/search",
  // "/datasets",
  // "/dataset/[id]",
  "/api/uploadthing",
  "/searchpage",
  "/searchpage/[id]",
];
const authRoutes = ["/sign-in", "/sign-up"];
const passwordRoutes = ["/reset-password", "/forgot-password"];
const staffRoutes = [
  "/staff",
  "/datasets",
  "/datasets/create",
  "/datasets/update/:id*",
  "/access",
  "/access/[id]",
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
  "/access",
];
const customerRoutes = [
  "/customer",
  "/datasets",
  "/customer/access",
  "/customer/access/[id]",
];

export default async function authMiddleware(request: NextRequest) {
  const pathName = request.nextUrl.pathname;
  // Check if it's a dynamic dataset route like /datasets/123
  const isDynamicDatasetRoute = /^\/datasets\/[^\/]+$/.test(pathName);
  // Check if it's a dynamic searchpage route
  const isDynamicSearchRoute = /^\/searchpage\/[^\/]+$/.test(pathName);
  // Check if the request path matches any of the defined routes
  const isPublicRoute =
    publicRoutes.includes(pathName) ||
    isDynamicDatasetRoute ||
    isDynamicSearchRoute;
  const isAuthRoute = authRoutes.includes(pathName);
  const isPasswordRoute = passwordRoutes.includes(pathName);
  const isStaffRoute = staffRoutes.includes(pathName);
  const isDynamicAdminRoute = /^\/admin\/[^\/]+/.test(pathName);
  const isAdminRoute = adminRoutes.includes(pathName) || isDynamicAdminRoute;
  const isCustomerRoute = customerRoutes.includes(pathName);

  // Add a check for dynamic access routes
  const isDynamicAccessRoute = /^\/access\/[^\/]+$/.test(pathName);

  console.log(
    "Path:",
    pathName,
    "isDynamicRoute:",
    isDynamicDatasetRoute || isDynamicSearchRoute,
    "isPublic:",
    isPublicRoute,
    "isAdmin:",
    isAdminRoute,
    "isStaff:",
    isStaffRoute,
    "isCustomer:",
    isCustomerRoute,
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
  if (role === "staff") {
    if (isPublicRoute || isStaffRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/staff", request.url));
  }

  // Admin can access public and admin routes only
  if (role === "admin") {
    if (isPublicRoute || isAdminRoute || isStaffRoute || isDynamicAccessRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // Customers can access public and customer routes only
  if (role === "user") {
    if (isPublicRoute || isCustomerRoute) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/customer", request.url));
  }

  // Default: Redirect unauthorized access to home
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};

// import { betterFetch } from "@better-fetch/fetch";
// import { NextResponse, type NextRequest } from "next/server";
// import type { Session } from "~/lib/auth";

// // Define route groups
// const publicRoutes = ["/", "/search", "/datasets", "/datasets/create"];
// const authRoutes = ["/sign-in", "/sign-up"];
// const passwordRoutes = ["/reset-password", "/forgot-password"];
// const staffRoutes = ["/staff"];
// const adminRoutes = ["/admin", "/admin/users", "/admin/users/new"];
// const customerRoutes = ["/customer"];

// // Middleware function
// export default async function authMiddleware(request: NextRequest) {
//   const pathName = request.nextUrl.pathname;

//   // Match dynamic routes (e.g., /datasets/123, /admin/users/123)
//   const isDynamicDatasetRoute = /^\/datasets\/[^\/]+$/.test(pathName);
//   const isDynamicAdminRoute = /^\/admin\/users\/[^\/]+$/.test(pathName);

//   // Check if path matches predefined routes
//   const isPublicRoute = publicRoutes.includes(pathName) || isDynamicDatasetRoute;
//   const isAuthRoute = authRoutes.includes(pathName);
//   const isPasswordRoute = passwordRoutes.includes(pathName);
//   const isStaffRoute = staffRoutes.includes(pathName);
//   const isAdminRoute =
//     adminRoutes.includes(pathName) || isDynamicAdminRoute;
//   const isCustomerRoute = customerRoutes.includes(pathName);

//   console.log("Checking route:", pathName, {
//     isPublicRoute,
//     isAdminRoute,
//     isDynamicDatasetRoute,
//   });

//   // Fetch session
//   let session: Session | null = null;
//   try {
//     const response = await betterFetch<Session>("/api/auth/get-session", {
//       baseURL: process.env.BETTER_AUTH_URL,
//       headers: { cookie: request.headers.get("cookie") || "" },
//     });

//     session = response?.data || null;
//   } catch (error) {
//     console.error("Failed to fetch session:", error);
//   }

//   // If no session (unauthenticated)
//   if (!session) {
//     if (isPublicRoute || isAuthRoute || isPasswordRoute) {
//       return NextResponse.next();
//     }
//     return NextResponse.redirect(new URL("/sign-in", request.url));
//   }

//   // Role-based access control
//   const { role } = session.user;

//   if (role === "staff") {
//     if (isPublicRoute || isStaffRoute) return NextResponse.next();
//     return NextResponse.redirect(new URL("/staff", request.url));
//   }

//   if (role === "admin") {
//     if (isPublicRoute || isAdminRoute) return NextResponse.next();
//     return NextResponse.redirect(new URL("/admin", request.url));
//   }

//   if (role === "user") {
//     if (isPublicRoute || isCustomerRoute) return NextResponse.next();
//     return NextResponse.redirect(new URL("/customer", request.url));
//   }

//   return NextResponse.redirect(new URL("/", request.url));
// }

// // Match all routes except static assets and API routes
// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|.*\\.(png|jpg|jpeg|svg|ico)$).*)"],
// };
