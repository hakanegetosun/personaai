begin;

alter table public.user_profile
  add column if not exists display_name text;

alter table public.user_profile
  add column if not exists age integer;

alter table public.user_profile
  add column if not exists onboarding_step integer not null default 1;

update public.user_profile
set onboarding_step = case
  when onboarding_completed = true then 3
  when category is not null and onboarding_completed = false then 2
  else 1
end
where onboarding_step is null
   or onboarding_step not in (1, 2, 3);

alter table public.user_profile
  drop constraint if exists user_profile_onboarding_step_check;

alter table public.user_profile
  add constraint user_profile_onboarding_step_check
  check (onboarding_step in (1, 2, 3));

create index if not exists idx_user_profile_onboarding_step
on public.user_profile (onboarding_step);

commit;
