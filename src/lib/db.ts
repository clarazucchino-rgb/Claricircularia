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
      password_hash text not null,
      created_at timestamptz not null default now()
    );
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
      ficha jsonb not null,
      answers jsonb not null,
      stage_summary jsonb not null,
      totals jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
  `;

  await sql`
    create index if not exists diagnostics_user_updated_idx
    on diagnostics (user_id, updated_at desc);
  `;
}
