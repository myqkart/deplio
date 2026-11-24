# Deplio

Internal tool to trigger AWS Amplify Incoming Webhooks and record trigger history. Built with Next.js App Router, Supabase Auth/Postgres, and a dark-only UI.

## Setup

1. Copy `.env.example` → `.env` and fill Supabase values.
2. Apply the schema + create an admin user:
   - `node --env-file=.env scripts/setup-supabase.mjs`
   - Or paste `supabase/migrations/20260324120000_init.sql` in the Supabase SQL editor, then create a user under Authentication → Users.
3. Disable public sign-ups in Supabase Auth.
4. `npm install && npm run dev`

See `docs/runbook.md` for production ops and `docs/phases.md` for architecture.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm test` | Unit tests (validation, trigger, cooldown) |

## Docs

- `docs/phases.md` — roadmap & decisions
- `docs/design.md` — visual spec
- `docs/content.md` — copy
- `docs/pages.md` / `docs/sections.md` — structure
- `docs/inspection-note.md` — Phase 1 starter reconciliation
- `docs/security-checklist.md` — Phase 6 security sign-off
