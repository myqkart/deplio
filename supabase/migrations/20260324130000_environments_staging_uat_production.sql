-- Replace environment enum values: development -> uat
-- Safe for projects that already applied the initial migration.

alter table public.branches
  alter column environment type text using environment::text;

alter table public.deployments
  alter column environment type text using environment::text;

update public.branches
set environment = 'uat'
where environment = 'development';

update public.deployments
set environment = 'uat'
where environment = 'development';

drop type public.environment;

create type public.environment as enum ('staging', 'uat', 'production');

alter table public.branches
  alter column environment type public.environment
  using environment::public.environment;

alter table public.deployments
  alter column environment type public.environment
  using environment::public.environment;
