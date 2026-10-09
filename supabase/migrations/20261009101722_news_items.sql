-- "Noutăți" / "News": curated external articles. CODEPEDIA publishes its own short
-- summary plus attribution and a link to the original; it never republishes the source text.
-- Convention as for projects: _ro required, _en optional (falls back to RO at render time).

create table public.news_items (
  id                  uuid primary key default gen_random_uuid(),
  slug_ro             text not null unique,
  slug_en             text unique,
  title_ro            text not null,
  title_en            text,
  summary_ro          text not null,   -- our own 2-4 sentence summary
  summary_en          text,
  why_ro              text,            -- optional "De ce contează"
  why_en              text,
  source_url          text not null,
  source_name         text not null,
  source_author       text,
  source_published_on date,
  category            text,
  published_at        timestamptz,     -- null = draft
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  updated_by          uuid references public.app_users (id),
  constraint news_items_source_url_http check (source_url ~ '^https?://'),
  constraint news_items_category_known check (category is null or category in ('COST', 'ALEG', 'IND', 'AI', 'GRANT', 'PROC', 'MKT')),
  constraint news_items_slug_ro_format check (slug_ro ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint news_items_slug_en_format check (slug_en is null or slug_en ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- A draft may start from a link alone; a published item needs its own summary and the source's name.
  constraint news_items_published_complete check (
    published_at is null or (btrim(title_ro) <> '' and btrim(summary_ro) <> '' and btrim(source_name) <> '')
  )
);

create index news_items_published_idx on public.news_items (published_at, source_published_on);

drop trigger if exists news_items_touch_updated_at on public.news_items;
create trigger news_items_touch_updated_at
  before update on public.news_items
  for each row execute function public.touch_updated_at();

-- updated_by belongs to the database, not the client.
create or replace function public.news_items_set_updated_by() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_by := auth.uid();
  return new;
end $$;

drop trigger if exists news_items_set_updated_by on public.news_items;
create trigger news_items_set_updated_by
  before insert or update on public.news_items
  for each row execute function public.news_items_set_updated_by();

alter table public.news_items enable row level security;

create policy public_read_news on public.news_items for select using (published_at is not null);
create policy admin_all_news on public.news_items for all using (public.is_admin()) with check (public.is_admin());

-- Same grants as the rest of the schema after the 2026-10-06 hardening.
revoke insert, update, delete, truncate on public.news_items from anon;
revoke truncate on public.news_items from authenticated;
