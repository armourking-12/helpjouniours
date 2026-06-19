import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSessionCookie } from "@/lib/firebase/admin";

/**
 * POST /api/auth/session
 *
 * Create a server-side session cookie from a Firebase ID token.
 * Called by the client after successful sign-in to establish
 * cookie-based authentication for middleware and SSR.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body as { idToken: string };

    if (!idToken) {
      return NextResponse.json(
        { success: false, error: "Missing idToken" },
        { status: 400 }
      );
    }

    // Create session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await createSessionCookie(idToken, expiresIn);

    // Set the session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set("__session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create session" },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/auth/session
 *
 * Clear the session cookie (sign out server-side).
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("__session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  return response;
}
