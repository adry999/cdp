-- Security audit 2026-10-06.

-- Public objects are served from /object/public/... without any policy; the
-- broad SELECT policy only let anyone list every key, drafts included.
-- Admins keep SELECT, which upsert and remove need.
drop policy if exists public_read_project_media on storage.objects;
create policy admin_read_project_media on storage.objects
  for select using (bucket_id = 'project-media' and public.is_admin());

-- The editor's 8 MB / image-only check, enforced server-side too.
update storage.buckets
set file_size_limit = 8 * 1024 * 1024,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
where id = 'project-media';

-- Admin-entered URLs: no javascript: links, no off-site redirects.
alter table public.projects
  add constraint projects_live_url_http check (live_url is null or live_url ~ '^https?://');
alter table public.redirects
  add constraint redirects_to_path_local check (to_path ~ '^/([^/]|$)');

-- Anonymous visitors never write through PostgREST (leads go through the
-- service role), and TRUNCATE bypasses RLS.
revoke insert, update, delete, truncate on all tables in schema public from anon;
revoke truncate on all tables in schema public from authenticated;
revoke all on public.leads, public.lead_rate_limits, public.app_users from anon;

alter function public.touch_updated_at() set search_path = '';

-- Event-trigger helper created from the dashboard; never meant to be called directly.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
