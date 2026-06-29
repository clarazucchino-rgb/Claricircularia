import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureDiagnosticsSchema, getSql } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export const runtime = "nodejs";

type Decision = "open" | "accepted" | "dismissed";
const decisions: Decision[] = ["open", "accepted", "dismissed"];

async function getCurrentUser() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (user.role !== "designer") {
    return NextResponse.json({ error: "Solo diseño puede resolver comentarios." }, { status: 403 });
  }

  const { id, commentId } = await params;
  const body = (await request.json().catch(() => ({}))) as { decision?: Decision };
  if (!body.decision || !decisions.includes(body.decision)) {
    return NextResponse.json({ error: "Decision invalida." }, { status: 400 });
  }

  await ensureDiagnosticsSchema();
  const sql = getSql();
  const rows = (await sql`
    update diagnostic_comments c
    set decision = ${body.decision}, updated_at = now()
    from diagnostics d
    where c.id = ${commentId}
      and c.diagnostic_id = d.id
      and d.id = ${id}
      and d.user_id = ${user.id}
    returning c.id, c.decision;
  `) as unknown as Array<{ id: string; decision: Decision }>;

  if (!rows[0]) {
    return NextResponse.json({ error: "Comentario no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ comment: rows[0] });
}
