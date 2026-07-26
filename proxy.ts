import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, hashPassword, isPasswordProtectionEnabled } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  // If password protection is not configured or disabled, allow all requests
  if (!isPasswordProtectionEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow public static assets and system routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Allow authentication routes (/login and /api/auth)
  if (pathname === "/login" || pathname === "/api/auth") {
    const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const expectedHash = await hashPassword(process.env.WEBSITE_PASSWORD!.trim());

    // If user is already authenticated and visits /login, redirect to homepage or returnTo URL
    if (pathname === "/login" && sessionToken === expectedHash) {
      const returnTo = request.nextUrl.searchParams.get("returnTo") || "/";
      return NextResponse.redirect(new URL(returnTo, request.url));
    }

    return NextResponse.next();
  }

  // Verify session cookie
  const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const expectedHash = await hashPassword(process.env.WEBSITE_PASSWORD!.trim());
  const isAuthenticated = sessionToken === expectedHash;

  if (!isAuthenticated) {
    // Return 401 Unauthorized for API requests
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Unauthorized access. Password protection enabled." },
        { status: 401 }
      );
    }

    // Redirect HTML page requests to /login with returnTo parameter
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("returnTo", pathname + request.nextUrl.search);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and assets.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
