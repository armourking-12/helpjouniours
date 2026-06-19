import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionCookie } from "@/lib/firebase/admin";

/**
 * GET /api/auth/me
 *
 * Get the current authenticated user from the session cookie.
 * Returns the decoded token claims (uid, email, etc.)
 * or 401 if not authenticated.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const decodedClaims = await verifySessionCookie(sessionCookie);

    return NextResponse.json({
      success: true,
      data: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        emailVerified: decodedClaims.email_verified,
        name: decodedClaims.name,
        picture: decodedClaims.picture,
      },
    });
  } catch (error) {
    console.error("Session verification failed:", error);
    return NextResponse.json(
      { success: false, error: "Invalid or expired session" },
      { status: 401 }
    );
  }
}
