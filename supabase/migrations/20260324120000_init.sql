-- Amplify Deployment Manager — initial schema + RLS
-- See docs/phases.md §0

create extension if not exists "pgcrypto";

create type public.environment as enum ('staging', 'uat', 'production');
create type public.trigger_status as enum ('triggered', 'failed');

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_by uuid references auth.users on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications on delete cascade,
  name text not null,
  environment public.environment not null,
  webhook_hint text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id, name)
);

create table public.branch_webhooks (
  branch_id uuid primary key references public.branches on delete cascade,
  webhook_url text not null
);

create table public.deployments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid references public.applications on delete set null,
  branch_id uuid references public.branches on delete set null,
  application_name text not null,
  branch_name text not null,
  environment public.environment not null,
  status public.trigger_status not null,
  http_status int,
  error_message text,
  triggered_by uuid references auth.users on delete set null,
  triggered_by_email text,
  retry_of uuid references public.deployments on delete set null,
  amplify_job_id text,
  build_status text,
  created_at timestamptz not null default now()
);

create index deployments_created_at_desc on public.deployments (created_at desc);
create index deployments_application_created_at_desc
  on public.deployments (application_id, created_at desc);
create index deployments_branch_created_at_desc
  on public.deployments (branch_id, created_at desc);

alter table public.applications enable row level security;
alter table public.branches enable row level security;
alter table public.branch_webhooks enable row level security;
alter table public.deployments enable row level security;

-- applications: full CRUD for authenticated
create policy "applications_select_authenticated"
  on public.applications for select to authenticated using (true);
create policy "applications_insert_authenticated"
  on public.applications for insert to authenticated with check (true);
create policy "applications_update_authenticated"
  on public.applications for update to authenticated using (true) with check (true);
create policy "applications_delete_authenticated"
  on public.applications for delete to authenticated using (true);

-- branches: full CRUD for authenticated
create policy "branches_select_authenticated"
  on public.branches for select to authenticated using (true);
create policy "branches_insert_authenticated"
  on public.branches for insert to authenticated with check (true);
create policy "branches_update_authenticated"
  on public.branches for update to authenticated using (true) with check (true);
create policy "branches_delete_authenticated"
  on public.branches for delete to authenticated using (true);

-- branch_webhooks: RLS on, NO policies for anon/authenticated (service role only)

-- deployments: select only for authenticated
create policy "deployments_select_authenticated"
  on public.deployments for select to authenticated using (true);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

create trigger branches_set_updated_at
  before update on public.branches
  for each row execute function public.set_updated_at();
