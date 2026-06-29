import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureDiagnosticsSchema, getSql } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export const runtime = "nodejs";

const reviewerRoles = ["admin", "finance", "marketing", "sustainability", "operations"];

async function getCurrentUser() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  await ensureDiagnosticsSchema();
  const sql = getSql();
  const access = user.role === "admin"
    ? (await sql`select id from diagnostics where id = ${id};`)
    : user.role === "designer"
    ? (await sql`select id from diagnostics where id = ${id} and user_id = ${user.id};`)
    : (await sql`select id from diagnostics where id = ${id} and status in ('in_review', 'approved');`);

  if (!(access as unknown[])[0]) {
    return NextResponse.json({ error: "Proyecto no disponible." }, { status: 404 });
  }

  const rows = (await sql`
    select c.id, c.area, c.body, c.decision, c.created_at, c.updated_at, u.name, u.email, u.role
    from diagnostic_comments c
    join users u on u.id = c.user_id
    where c.diagnostic_id = ${id}
    order by c.created_at desc;
  `) as unknown as Array<{
    id: string;
    area: string;
    body: string;
    decision: "open" | "accepted" | "dismissed";
    created_at: string;
    updated_at: string;
    name: string | null;
    email: string;
    role: string;
  }>;

  return NextResponse.json({
    comments: rows.map((row) => ({
      id: row.id,
      area: row.area,
      body: row.body,
      decision: row.decision,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      authorName: row.name,
      authorEmail: row.email,
      authorRole: row.role,
    })),
  });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!reviewerRoles.includes(user.role)) {
    return NextResponse.json({ error: "Solo perfiles revisores pueden comentar." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { body?: string };
  const comment = body.body?.trim();
  if (!comment) {
    return NextResponse.json({ error: "Escribe un comentario." }, { status: 400 });
  }

  await ensureDiagnosticsSchema();
  const sql = getSql();
  const diagnostic = (await sql`
    select id from diagnostics
    where id = ${id} and status = 'in_review';
  `) as unknown as Array<{ id: string }>;
  if (!diagnostic[0]) {
    return NextResponse.json({ error: "Solo se puede comentar en proyectos en revision." }, { status: 409 });
  }

  const rows = (await sql`
    insert into diagnostic_comments (diagnostic_id, user_id, area, body)
    values (${id}, ${user.id}, ${user.role}, ${comment})
    returning id, area, body, decision, created_at, updated_at;
  `) as unknown as Array<{
    id: string;
    area: string;
    body: string;
    decision: "open" | "accepted" | "dismissed";
    created_at: string;
    updated_at: string;
  }>;

  const created = rows[0];
  return NextResponse.json({
    comment: {
      id: created.id,
      area: created.area,
      body: created.body,
      decision: created.decision,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
      authorName: user.name,
      authorEmail: user.email,
      authorRole: user.role,
    },
  });
}
