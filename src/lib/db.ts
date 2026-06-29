import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  sqlClient ??= neon(databaseUrl);
  return sqlClient;
}

export async function ensureAuthSchema() {
  const sql = getSql();

  await sql`
    create extension if not exists pgcrypto;
  `;

  await sql`
    create table if not exists users (
      id uuid primary key default gen_random_uuid(),
      email text not null unique,
      name text,
      role text not null default 'designer',
      password_hash text not null,
      created_at timestamptz not null default now()
    );
  `;

  await sql`
    alter table users
    add column if not exists role text not null default 'designer';
  `;
}

export async function ensureDiagnosticsSchema() {
  await ensureAuthSchema();

  const sql = getSql();
  await sql`
    create table if not exists diagnostics (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      title text not null,
      project_code text not null,
      status text not null default 'in_progress',
      ficha jsonb not null,
      answers jsonb not null,
      stage_summary jsonb not null,
      totals jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `;

  await sql`
    alter table diagnostics
    add column if not exists project_code text;
  `;

  await sql`
    alter table diagnostics
    add column if not exists status text not null default 'in_progress';
  `;

  await sql`
    update diagnostics
    set project_code = 'CIR-' || upper(substr(id::text, 1, 8))
    where project_code is null;
  `;

  await sql`
    alter table diagnostics
    alter column project_code set not null;
  `;

  await sql`
    create table if not exists diagnostic_comments (
      id uuid primary key default gen_random_uuid(),
      diagnostic_id uuid not null references diagnostics(id) on delete cascade,
      user_id uuid not null references users(id) on delete cascade,
      area text not null,
      body text not null,
      decision text not null default 'open',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `;

  await sql`
    create index if not exists diagnostic_comments_diagnostic_created_idx
    on diagnostic_comments (diagnostic_id, created_at desc);
  `;

  await sql`
    create index if not exists diagnostics_user_updated_idx
    on diagnostics (user_id, updated_at desc);
  `;
}
