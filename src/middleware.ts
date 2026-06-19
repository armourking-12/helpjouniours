import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { PROTECTED_ROUTES, AUTH_ROUTES, MODERATOR_ROUTES, ADMIN_ROUTES } from "@/lib/constants";

/**
 * Middleware for route protection.
 *
 * - Unauthenticated users → redirected from protected routes to /login
 * - Authenticated users → redirected from auth routes to /dashboard
 *
 * Note: Role-based authorization is handled client-side by ProtectedRoute/RoleGate
 * because middleware cannot access Firestore directly. The session cookie only
 * confirms authentication, not authorization level.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth session (httpOnly cookie set by POST /api/auth/session)
  const sessionCookie = request.cookies.get("__session")?.value;
  const isAuthenticated = !!sessionCookie;

  // All routes that require authentication (any role)
  const allProtectedRoutes = [
    ...PROTECTED_ROUTES,
    ...MODERATOR_ROUTES,
    ...ADMIN_ROUTES,
  ];

  // Redirect unauthenticated users from protected routes
  const isProtectedRoute = allProtectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next (Next.js internals)
     * - static files (images, fonts, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
