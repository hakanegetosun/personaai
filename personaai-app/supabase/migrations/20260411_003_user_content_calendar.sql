begin;

create table if not exists public.user_content_calendar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calendar_month date not null,
  day_number integer not null,
  content_date date not null,
  content_type text not null,
  category public.influencer_category not null,
  title text not null,
  hook text,
  caption text,
  status text not null default 'planned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_content_calendar
  drop constraint if exists user_content_calendar_content_type_check;

alter table public.user_content_calendar
  add constraint user_content_calendar_content_type_check
  check (content_type in ('story', 'reel', 'post'));

alter table public.user_content_calendar
  drop constraint if exists user_content_calendar_status_check;

alter table public.user_content_calendar
  add constraint user_content_calendar_status_check
  check (status in ('planned', 'generated', 'published', 'failed'));

create unique index if not exists idx_user_content_calendar_unique_day
  on public.user_content_calendar (user_id, calendar_month, day_number);

create index if not exists idx_user_content_calendar_user_month
  on public.user_content_calendar (user_id, calendar_month);

create index if not exists idx_user_content_calendar_content_date
  on public.user_content_calendar (content_date);

create or replace function public.set_user_content_calendar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_content_calendar_updated_at on public.user_content_calendar;

create trigger trg_user_content_calendar_updated_at
before update on public.user_content_calendar
for each row
execute function public.set_user_content_calendar_updated_at();

alter table public.user_content_calendar enable row level security;

drop policy if exists "user_content_calendar_select_own" on public.user_content_calendar;
create policy "user_content_calendar_select_own"
on public.user_content_calendar
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_content_calendar_insert_own" on public.user_content_calendar;
create policy "user_content_calendar_insert_own"
on public.user_content_calendar
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_content_calendar_update_own" on public.user_content_calendar;
create policy "user_content_calendar_update_own"
on public.user_content_calendar
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

commit;
