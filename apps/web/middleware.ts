import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge middleware: security headers on every response + API version banner.
 * No auth state (self-custodial desk — no accounts by design).
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("x-api-version", "v1");
  res.headers.set("x-content-type-options", "nosniff");
  res.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  res.headers.set("x-frame-options", "DENY");
  res.headers.set("permissions-policy", "camera=(), microphone=(), geolocation=()");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
