import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_COOKIE_NAME,
  hashPassword,
  isPasswordProtectionEnabled,
  verifySessionToken,
} from "@/lib/auth";

/**
 * GET /api/auth
 * Check current authentication status and whether protection is enabled.
 */
export async function GET() {
  const protectionEnabled = isPasswordProtectionEnabled();
  if (!protectionEnabled) {
    return NextResponse.json({
      authenticated: true,
      protectionEnabled: false,
    });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const authenticated = await verifySessionToken(token);

  return NextResponse.json({
    authenticated,
    protectionEnabled: true,
  });
}

/**
 * POST /api/auth
 * Verify submitted password and set HTTP-only session cookie.
 */
export async function POST(request: Request) {
  if (!isPasswordProtectionEnabled()) {
    return NextResponse.json({ success: true, protectionEnabled: false });
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (typeof password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const expectedPassword = process.env.WEBSITE_PASSWORD!.trim();

    if (password !== expectedPassword) {
      return NextResponse.json(
        { error: "Invalid password. Please try again." },
        { status: 401 }
      );
    }

    // Compute session hash
    const token = await hashPassword(expectedPassword);

    const cookieStore = await cookies();
    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth
 * Log out user by clearing the session cookie.
 */
export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  return NextResponse.json({ success: true });
}
