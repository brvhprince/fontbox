import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "fontbox.session";
const publicRoutes = ["/login", "/register", "/api/auth", "/_next", "/favicon", "/assets"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  const hasSession = request.cookies.has(AUTH_COOKIE);

  if (!hasSession && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && ["/login", "/register", "/"].includes(pathname)) {
    return NextResponse.redirect(new URL("/fonts", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"]
};
