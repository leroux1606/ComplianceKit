import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;
  const pathname = nextUrl.pathname;

  // Redirect authenticated users away from auth pages
  const isAuthPage =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect dashboard and admin routes
  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/consent") ||
    pathname.startsWith("/accept-invite");

  if (isProtected && !isLoggedIn) {
    const signInUrl = new URL("/sign-in", nextUrl);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /api/auth    (NextAuth endpoints)
     * - /api/widget  (public widget embed routes)
     * - /api/dsar    (public DSAR form routes)
     * - /api/health  (uptime monitoring)
     * - /api/webhooks (payment webhooks)
     * - /api/v1       (API key-authenticated routes)
     * - /dsar         (public DSAR form page)
     * - /_next        (Next.js internals)
     * - static files  (.png, .ico, etc.)
     */
    "/((?!api/auth|api/widget|api/dsar|api/health|api/webhooks|api/v1|dsar|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js)$).*)",
  ],
};
