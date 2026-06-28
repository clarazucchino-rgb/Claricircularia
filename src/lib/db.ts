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
