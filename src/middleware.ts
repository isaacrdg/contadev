import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "cd_admin_auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Só protege /admin/* — exclui a própria página de login e API de login
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();
  if (pathname === "/api/admin/login") return NextResponse.next();

  // Se não há senha configurada, libera (modo dev sem auth)
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return NextResponse.next();

  // Verifica cookie
  const cookie = req.cookies.get(COOKIE_NAME);
  if (cookie?.value === expected) {
    return NextResponse.next();
  }

  // Sem auth → redireciona pro login preservando o destino
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
