import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureDiagnosticsSchema, getSql } from "@/lib/db";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export const runtime = "nodejs";

type DiagnosticPayload = {
  title?: string;
  projectCode?: string;
  ficha?: unknown;
  answers?: unknown;
  stageSummary?: unknown;
  totals?: unknown;
};

async function getCurrentUser() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  await ensureDiagnosticsSchema();
  const sql = getSql();
  const rows = user.role === "designer"
    ? (await sql`
    select id, title, project_code, status, ficha, answers, stage_summary, totals, created_at, updated_at
    from diagnostics
    where user_id = ${user.id}
    order by updated_at desc;
  `)
    : (await sql`
    select id, title, project_code, status, ficha, answers, stage_summary, totals, created_at, updated_at
    from diagnostics
    where status in ('in_review', 'approved')
    order by updated_at desc;
  `);

  const diagnostics = rows as unknown as Array<{
    id: string;
    title: string;
    project_code: string;
    status: "in_progress" | "in_review" | "approved";
    ficha: unknown;
    answers: unknown;
    stage_summary: unknown;
    totals: unknown;
    created_at: string;
    updated_at: string;
  }>;

  return NextResponse.json({
    diagnostics: diagnostics.map((row) => ({
      id: row.id,
      title: row.title,
      projectCode: row.project_code,
      status: row.status,
      ficha: row.ficha,
      answers: row.answers,
      stageSummary: row.stage_summary,
      totals: row.totals,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (user.role !== "designer") {
    return NextResponse.json({ error: "Solo diseño puede crear evaluaciones." }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as DiagnosticPayload;
  if (!body.ficha || !body.answers || !body.stageSummary || !body.totals) {
    return NextResponse.json({ error: "Faltan datos del diagnostico." }, { status: 400 });
  }

  const title = body.title?.trim() || "Diagnostico sin titulo";
  const projectCode = body.projectCode?.trim() || `CIR-${Date.now().toString(36).toUpperCase()}`;

  await ensureDiagnosticsSchema();
  const sql = getSql();
  const rows = (await sql`
    insert into diagnostics (user_id, title, project_code, status, ficha, answers, stage_summary, totals)
    values (
      ${user.id},
      ${title},
      ${projectCode},
      'in_progress',
      ${JSON.stringify(body.ficha)}::jsonb,
      ${JSON.stringify(body.answers)}::jsonb,
      ${JSON.stringify(body.stageSummary)}::jsonb,
      ${JSON.stringify(body.totals)}::jsonb
    )
    returning id, title, project_code, status, ficha, answers, stage_summary, totals, created_at, updated_at;
  `) as unknown as Array<{
    id: string;
    title: string;
    project_code: string;
    status: "in_progress" | "in_review" | "approved";
    ficha: unknown;
    answers: unknown;
    stage_summary: unknown;
    totals: unknown;
    created_at: string;
    updated_at: string;
  }>;

  const diagnostic = rows[0];
  return NextResponse.json({
    diagnostic: {
      id: diagnostic.id,
      title: diagnostic.title,
      projectCode: diagnostic.project_code,
      status: diagnostic.status,
      ficha: diagnostic.ficha,
      answers: diagnostic.answers,
      stageSummary: diagnostic.stage_summary,
      totals: diagnostic.totals,
      createdAt: diagnostic.created_at,
      updatedAt: diagnostic.updated_at,
    },
  });
}
