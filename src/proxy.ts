import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hasAccessToken = Boolean(request.cookies.get("admin_access_token")?.value);

  if (!hasAccessToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
