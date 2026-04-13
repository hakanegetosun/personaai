create table if not exists public.user_boost_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month_key text not null,
  free_allure_remaining integer not null default 0,
  free_consistency_remaining integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, month_key)
);

create table if not exists public.boost_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_job_id uuid null,
  boost_type text not null check (boost_type in ('allure_boost', 'extra_consistency')),
  amount_usd numeric(10,2) not null,
  source text not null default 'one_time',
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.generation_jobs
  add column if not exists allure_boost boolean not null default false,
  add column if not exists extra_consistency boolean not null default false,
  add column if not exists provider_route text,
  add column if not exists duration_seconds integer,
  add column if not exists boost_charge_usd numeric(10,2),
  add column if not exists boost_purchase_required boolean not null default false;

create index if not exists idx_user_boost_entitlements_user_month
  on public.user_boost_entitlements(user_id, month_key);

create index if not exists idx_boost_purchases_user_created
  on public.boost_purchases(user_id, created_at desc);
