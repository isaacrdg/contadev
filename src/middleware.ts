import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_COOKIE = "cd_admin_auth";
const REDATOR_COOKIE = "cd_redator_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── /admin/* ───
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return NextResponse.next();

    const cookie = req.cookies.get(ADMIN_COOKIE);
    if (cookie?.value === expected) return NextResponse.next();

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── /redator/* ───
  if (pathname.startsWith("/redator")) {
    if (pathname === "/redator/login") return NextResponse.next();

    const expected = process.env.REDATOR_PASSWORD;
    if (!expected) return NextResponse.next();

    const cookie = req.cookies.get(REDATOR_COOKIE);
    if (cookie?.value === expected) return NextResponse.next();

    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/redator/login";
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/redator/:path*"],
};
