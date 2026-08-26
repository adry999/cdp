-- Storage bucket + RLS policies for project images (cover/hero/gallery).
-- Applied to the remote project on 2026-08-05 but never captured as a local
-- migration file until this reconstruction — this was genuinely manual,
-- undocumented infrastructure: a fresh Supabase project had no way to get
-- this bucket or its policies from the repository alone.

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', true)
on conflict (id) do nothing;

create policy public_read_project_media on storage.objects
  for select using (bucket_id = 'project-media');

create policy admin_insert_project_media on storage.objects
  for insert with check (bucket_id = 'project-media' and is_admin());

create policy admin_update_project_media on storage.objects
  for update using (bucket_id = 'project-media' and is_admin())
  with check (bucket_id = 'project-media' and is_admin());

create policy admin_delete_project_media on storage.objects
  for delete using (bucket_id = 'project-media' and is_admin());
