begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.influencer_category as enum (
    'gym_fitness',
    'fashion_moda',
    'beauty_skincare',
    'lifestyle',
    'travel'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.user_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  category public.influencer_category,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_profile
  add column if not exists email text;

alter table public.user_profile
  add column if not exists category public.influencer_category;

alter table public.user_profile
  add column if not exists onboarding_completed boolean not null default false;

alter table public.user_profile
  add column if not exists created_at timestamptz not null default now();

alter table public.user_profile
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profile_updated_at on public.user_profile;

create trigger trg_user_profile_updated_at
before update on public.user_profile
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profile (
    id,
    email,
    onboarding_completed
  )
  values (
    new.id,
    new.email,
    false
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_user_profile on auth.users;

create trigger on_auth_user_created_user_profile
after insert on auth.users
for each row
execute function public.handle_new_auth_user_profile();

insert into public.user_profile (id, email, onboarding_completed)
select
  u.id,
  u.email,
  false
from auth.users u
left join public.user_profile p on p.id = u.id
where p.id is null;

alter table public.user_profile enable row level security;

drop policy if exists "user_profile_select_own" on public.user_profile;
create policy "user_profile_select_own"
on public.user_profile
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "user_profile_insert_own" on public.user_profile;
create policy "user_profile_insert_own"
on public.user_profile
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "user_profile_update_own" on public.user_profile;
create policy "user_profile_update_own"
on public.user_profile
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create index if not exists idx_user_profile_category
on public.user_profile (category);

commit;
