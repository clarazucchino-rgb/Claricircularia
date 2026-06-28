import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ensureAuthSchema, getSql } from "@/lib/db";
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, signSession } from "@/lib/session";

export const runtime = "nodejs";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Completa email y contraseña." }, { status: 400 });
  }

  await ensureAuthSchema();
  const sql = getSql();
  const users = (await sql`
    select id, email, name, password_hash
    from users
    where lower(email) = ${email}
    limit 1;
  `) as unknown as Array<{ id: string; email: string; name: string | null; password_hash: string }>;

  const user = users[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Email o contraseña incorrectos." }, { status: 401 });
  }

  const token = await signSession({ id: user.id, email: user.email, name: user.name });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  return response;
}
