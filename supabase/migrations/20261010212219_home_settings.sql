-- Homepage settings the admin can change without a deploy. One row only (id = 1).
-- hero_variant null = use NUXT_PUBLIC_HERO_BG_VARIANT (the env var stays the default).

create table public.home_settings (
  id           smallint primary key default 1,
  hero_variant text,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references public.app_users (id),
  constraint home_settings_single_row check (id = 1),
  constraint home_settings_hero_variant_known check (
    hero_variant is null or hero_variant in ('dot-matrix', 'constellation', 'light-orbs', 'none')
  )
);

insert into public.home_settings (id) values (1);

drop trigger if exists home_settings_touch_updated_at on public.home_settings;
create trigger home_settings_touch_updated_at
  before update on public.home_settings
  for each row execute function public.touch_updated_at();

-- updated_by belongs to the database, not the client.
create or replace function public.home_settings_set_updated_by() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_by := auth.uid();
  return new;
end $$;

drop trigger if exists home_settings_set_updated_by on public.home_settings;
create trigger home_settings_set_updated_by
  before update on public.home_settings
  for each row execute function public.home_settings_set_updated_by();

alter table public.home_settings enable row level security;

create policy public_read_home_settings on public.home_settings for select using (true);
-- Update only: the single row is created here and is never inserted or deleted by the admin.
create policy admin_update_home_settings on public.home_settings for update using (public.is_admin()) with check (public.is_admin());

-- Same grants as the rest of the schema after the 2026-10-06 hardening.
revoke insert, update, delete, truncate on public.home_settings from anon;
