#!/usr/bin/env node
/**
 * One-shot Deplio Supabase bootstrap:
 * - creates an admin auth user (if missing)
 * - applies supabase/migrations/20260324120000_init.sql when SUPABASE_ACCESS_TOKEN is set
 *
 * Usage:
 *   node --env-file=.env scripts/setup-supabase.mjs
 *
 * Optional env:
 *   SETUP_ADMIN_EMAIL / SETUP_ADMIN_PASSWORD
 *   SUPABASE_ACCESS_TOKEN  (https://supabase.com/dashboard/account/tokens)
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const email = process.env.SETUP_ADMIN_EMAIL ?? "admin@deplio.local";
const password = process.env.SETUP_ADMIN_PASSWORD ?? "DeplioAdmin123!";

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const ref = new URL(url).hostname.split(".")[0];

async function ensureUser() {
  const listRes = await fetch(`${url}/auth/v1/admin/users?page=1&per_page=200`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
  });
  const list = await listRes.json();
  const existing = (list.users ?? []).find((u) => u.email === email);
  if (existing) {
    console.log(`User already exists: ${email}`);
    return;
  }

  const createRes = await fetch(`${url}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: "Deplio Admin" },
    }),
  });
  const body = await createRes.json();
  if (!createRes.ok) {
    console.error("Failed to create user:", body);
    process.exit(1);
  }
  console.log(`Created user: ${email}`);
  console.log(`Password: ${password}`);
}

async function applyMigration() {
  const sqlPath = resolve(
    root,
    "supabase/migrations/20260324120000_init.sql"
  );
  const query = readFileSync(sqlPath, "utf8");

  if (!accessToken) {
    console.log(`
Schema not applied automatically (no SUPABASE_ACCESS_TOKEN).

1. Open: https://supabase.com/dashboard/project/${ref}/sql/new
2. Paste contents of supabase/migrations/20260324120000_init.sql
3. Click Run

Or re-run with:
  SUPABASE_ACCESS_TOKEN=<token from https://supabase.com/dashboard/account/tokens> \\
    node --env-file=.env scripts/setup-supabase.mjs
`);
    return;
  }

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${ref}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }
  );
  const text = await res.text();
  if (!res.ok) {
    console.error("Migration failed:", res.status, text);
    process.exit(1);
  }
  console.log("Migration applied.");
}

await ensureUser();
await applyMigration();
