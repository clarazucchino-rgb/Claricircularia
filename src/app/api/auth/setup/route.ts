import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { ensureAuthSchema, getSql } from "@/lib/db";

export const runtime = "nodejs";

type SetupBody = {
  setupSecret?: string;
  email?: string;
  password?: string;
  name?: string;
  role?: "designer" | "finance" | "marketing" | "sustainability" | "operations";
};

export async function POST(request: Request) {
  const expectedSecret = process.env.SETUP_SECRET;
  if (!expectedSecret) {
    return NextResponse.json({ error: "Setup is disabled." }, { status: 404 });
  }

  const body = (await request.json().catch(() => ({}))) as SetupBody;
  if (body.setupSecret !== expectedSecret) {
    return NextResponse.json({ error: "Setup secret invalido." }, { status: 401 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const name = body.name?.trim() || null;
  const role = body.role ?? "designer";

  if (!email || password.length < 8) {
    return NextResponse.json({ error: "Usa un email y una contraseña de al menos 8 caracteres." }, { status: 400 });
  }

  await ensureAuthSchema();
  const sql = getSql();
  const existing = (await sql`select count(*)::int as count from users;`) as unknown as Array<{ count: number }>;
  if (existing[0]?.count > 0) {
    return NextResponse.json({ error: "Ya existe un usuario. Setup bloqueado." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await sql`
    insert into users (email, name, role, password_hash)
    values (${email}, ${name}, ${role}, ${passwordHash});
  `;

  return NextResponse.json({ ok: true });
}
