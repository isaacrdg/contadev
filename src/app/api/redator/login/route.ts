import { NextResponse } from "next/server";

const COOKIE_NAME = "cd_redator_auth";
const ONE_WEEK = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  const expected = process.env.REDATOR_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "REDATOR_PASSWORD não configurado" },
      { status: 500 }
    );
  }

  let body: { password?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body inválido" }, { status: 400 });
  }

  if (body.password !== expected) {
    return NextResponse.json({ ok: false, error: "Senha incorreta" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_WEEK,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
