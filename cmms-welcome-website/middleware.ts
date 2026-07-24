import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Decodes a JWT token payload without signature verification.
 * Safe for use in Next.js Edge Runtime.
 */
function decodeJwt(token: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("access_token")?.value;

  // 1. If accessing a protected route (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    // If token is missing, redirect to /login
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Decode and validate token expiration
    const payload = decodeJwt(token);
    if (!payload || !payload.exp || Date.now() >= payload.exp * 1000) {
      // Token is invalid or has expired -> redirect to /login and clear invalid cookie
      const loginUrl = new URL("/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("access_token");
      return response;
    }
  }

  // 2. If already authenticated and trying to access /login
  if (pathname === "/login") {
    if (token) {
      const payload = decodeJwt(token);
      if (payload && payload.exp && Date.now() < payload.exp * 1000) {
        // Token is valid -> redirect to dashboard
        const dashboardUrl = new URL("/dashboard", request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return NextResponse.next();
}

// Apply middleware to all dashboard routes and the login page
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
