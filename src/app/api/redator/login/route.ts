import { NextResponse } from "next/server";

const AUTH_COOKIE = "cd_redator_auth";
const USER_COOKIE = "cd_redator_user";
// Sessão curta — redator precisa relogar a cada 8h pra reduzir risco de cookie roubado em máquina compartilhada
const EIGHT_HOURS = 60 * 60 * 8;

export async function POST(req: Request) {
  const expected = process.env.REDATOR_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "REDATOR_PASSWORD não configurado" },
      { status: 500 }
    );
  }

  let body: { password?: string; userId?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido" }, { status: 400 });
  }

  if (body.password !== expected) {
    return NextResponse.json({ ok: false, error: "Senha incorreta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, userId: body.userId });

  // Auth cookie
  res.cookies.set(AUTH_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: EIGHT_HOURS,
    path: "/",
  });

  // User identity cookie (não httpOnly — lido no client via JS)
  if (body.userId) {
    res.cookies.set(USER_COOKIE, body.userId, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: EIGHT_HOURS,
      path: "/",
    });
  }

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(AUTH_COOKIE);
  res.cookies.delete(USER_COOKIE);
  return res;
}
