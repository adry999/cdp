-- Data-integrity guards for the project editor.
--
-- Three defects made it into production data:
--   1. Blank gallery slots were saved as project_images rows with path = '',
--      which render as <img src=""> on the case study.
--   2. Slugs were free text in the editor while the public API only resolves
--      ^[a-z0-9-]+$, so a project could be published at a URL that 404s.
--   3. updated_at was set by the client and could be omitted entirely.

-- ── 1. Remove the rows already written, then make them impossible ────────────

delete from public.project_images where coalesce(path, '') = '';

alter table public.project_images
  drop constraint if exists project_images_path_not_blank;
alter table public.project_images
  add constraint project_images_path_not_blank check (btrim(path) <> '');

-- ── 2. Slugs must match what the public route can resolve ────────────────────

alter table public.projects drop constraint if exists projects_slug_ro_format;
alter table public.projects
  add constraint projects_slug_ro_format
  check (slug_ro ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

alter table public.projects drop constraint if exists projects_slug_en_format;
alter table public.projects
  add constraint projects_slug_en_format
  check (slug_en is null or slug_en ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- 'nou' is the create route (/admin/projects/nou), so it can never be a project.
alter table public.projects drop constraint if exists projects_slug_not_reserved;
alter table public.projects
  add constraint projects_slug_not_reserved
  check (slug_ro not in ('nou', 'new') and (slug_en is null or slug_en not in ('nou', 'new')));

-- ── 3. updated_at belongs to the database, not the client ────────────────────

create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();
