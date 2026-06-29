import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureAuthSchema, getSql } from "@/lib/db";
import { SESSION_COOKIE, UserRole, verifySession } from "@/lib/session";

export const runtime = "nodejs";

const roles: UserRole[] = ["designer", "finance", "marketing", "sustainability", "operations"];

type CreateUserBody = {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
};

async function getCurrentUser() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (user.role !== "designer") {
    return NextResponse.json({ error: "Solo diseño puede crear usuarios." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as CreateUserBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const name = body.name?.trim() || null;
  const role = body.role ?? "designer";

  if (!email || password.length < 8 || !roles.includes(role)) {
    return NextResponse.json({ error: "Usa email, rol valido y contraseña de al menos 8 caracteres." }, { status: 400 });
  }

  await ensureAuthSchema();
  const sql = getSql();
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const rows = (await sql`
      insert into users (email, name, role, password_hash)
      values (${email}, ${name}, ${role}, ${passwordHash})
      returning id, email, name, role, created_at;
    `) as unknown as Array<{ id: string; email: string; name: string | null; role: UserRole; created_at: string }>;

    return NextResponse.json({ user: rows[0] });
  } catch {
    return NextResponse.json({ error: "No se pudo crear el usuario. Revisa si el email ya existe." }, { status: 409 });
  }
}
