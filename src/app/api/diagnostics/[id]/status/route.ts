import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureDiagnosticsSchema, getSql } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export const runtime = "nodejs";

type Status = "in_progress" | "in_review" | "approved";

const allowedStatuses: Status[] = ["in_progress", "in_review", "approved"];

async function getCurrentUser() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (user.role !== "designer" && user.role !== "admin") {
    return NextResponse.json({ error: "Solo diseño o admin puede cambiar el estado." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { status?: Status };
  if (!body.status || !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Estado invalido." }, { status: 400 });
  }

  await ensureDiagnosticsSchema();
  const sql = getSql();
  const rows = (await sql`
    update diagnostics
    set status = ${body.status}, updated_at = now()
    where id = ${id} and (${user.role} = 'admin' or user_id = ${user.id})
    returning id, status;
  `) as unknown as Array<{ id: string; status: Status }>;

  if (!rows[0]) {
    return NextResponse.json({ error: "Proyecto no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ diagnostic: rows[0] });
}
