import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureAuthSchema, getSql } from "@/lib/db";
import { SESSION_COOKIE, UserRole, verifySession } from "@/lib/session";

export const runtime = "nodejs";

const roles: UserRole[] = ["admin", "designer", "finance", "marketing", "sustainability", "operations"];

type UpdateUserBody = {
  name?: string | null;
  role?: UserRole;
  password?: string;
};

async function getCurrentUser() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (currentUser.role !== "admin") {
    return NextResponse.json({ error: "Solo admin puede editar usuarios." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as UpdateUserBody;
  const name = body.name === undefined ? undefined : body.name?.trim() || null;
  const role = body.role;
  const password = body.password ?? "";

  if (role && !roles.includes(role)) {
    return NextResponse.json({ error: "Rol invalido." }, { status: 400 });
  }
  if (password && password.length < 8) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres." }, { status: 400 });
  }

  await ensureAuthSchema();
  const sql = getSql();

  if (name !== undefined) {
    await sql`update users set name = ${name} where id = ${id};`;
  }
  if (role) {
    await sql`update users set role = ${role} where id = ${id};`;
  }
  if (password) {
    const passwordHash = await bcrypt.hash(password, 12);
    await sql`update users set password_hash = ${passwordHash} where id = ${id};`;
  }

  const rows = (await sql`
    select id, email, name, role, created_at
    from users
    where id = ${id}
    limit 1;
  `) as unknown as Array<{ id: string; email: string; name: string | null; role: UserRole; created_at: string }>;

  if (!rows[0]) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: rows[0].id,
      email: rows[0].email,
      name: rows[0].name,
      role: rows[0].role,
      createdAt: rows[0].created_at,
    },
  });
}
