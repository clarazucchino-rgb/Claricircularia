import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureAuthSchema, getSql } from "@/lib/db";
import { SESSION_COOKIE, UserRole, verifySession } from "@/lib/session";

export const runtime = "nodejs";

const roles: UserRole[] = ["admin", "designer", "finance", "marketing", "sustainability", "operations"];

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

async function canManageUsers(user: { role: UserRole }) {
  if (user.role === "admin") return true;

  const sql = getSql();
  const admins = (await sql`select count(*)::int as count from users where role = 'admin';`) as unknown as Array<{ count: number }>;
  return user.role === "designer" && (admins[0]?.count ?? 0) === 0;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  await ensureAuthSchema();
  if (!(await canManageUsers(user))) {
    return NextResponse.json({ error: "Solo admin puede gestionar usuarios." }, { status: 403 });
  }

  const sql = getSql();
  const users = (await sql`
    select id, email, name, role, created_at
    from users
    order by created_at desc;
  `) as unknown as Array<{ id: string; email: string; name: string | null; role: UserRole; created_at: string }>;

  return NextResponse.json({
    users: users.map((item) => ({
      id: item.id,
      email: item.email,
      name: item.name,
      role: item.role,
      createdAt: item.created_at,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  await ensureAuthSchema();
  if (!(await canManageUsers(user))) {
    return NextResponse.json({ error: "Solo admin puede crear usuarios." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as CreateUserBody;
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const name = body.name?.trim() || null;
  const role = body.role ?? "designer";

  if (!email || password.length < 8 || !roles.includes(role)) {
    return NextResponse.json({ error: "Usa email, rol valido y contraseña de al menos 8 caracteres." }, { status: 400 });
  }

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
