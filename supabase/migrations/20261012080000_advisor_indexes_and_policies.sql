-- Performance fixes from the Supabase advisor. No change to who can read or write what.
--
-- 1. Index every foreign key column that had no covering index.
-- 2. Each table had two permissive SELECT policies (the admin "for all" policy and the
--    public read policy), so Postgres evaluated both on every read. The admin policy is
--    split into insert / update / delete, and admin reads fold into the single SELECT
--    policy. is_admin() is wrapped in a subquery so it runs once per statement, not per row.

create index if not exists home_settings_updated_by_idx on public.home_settings (updated_by);
create index if not exists news_items_updated_by_idx on public.news_items (updated_by);
create index if not exists projects_updated_by_idx on public.projects (updated_by);
create index if not exists project_facts_project_id_idx on public.project_facts (project_id);
create index if not exists project_images_project_id_idx on public.project_images (project_id);
create index if not exists project_stats_project_id_idx on public.project_stats (project_id);
create index if not exists project_steps_project_id_idx on public.project_steps (project_id);
create index if not exists service_items_service_id_idx on public.service_items (service_id);

-- ── faqs ──
drop policy if exists admin_all_faqs on public.faqs;
drop policy if exists public_read_faqs on public.faqs;
create policy public_read_faqs on public.faqs for select using (published_at is not null or (select public.is_admin()));
create policy admin_insert_faqs on public.faqs for insert with check ((select public.is_admin()));
create policy admin_update_faqs on public.faqs for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_faqs on public.faqs for delete using ((select public.is_admin()));

-- ── news_items ──
drop policy if exists admin_all_news on public.news_items;
drop policy if exists public_read_news on public.news_items;
create policy public_read_news on public.news_items for select using (published_at is not null or (select public.is_admin()));
create policy admin_insert_news on public.news_items for insert with check ((select public.is_admin()));
create policy admin_update_news on public.news_items for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_news on public.news_items for delete using ((select public.is_admin()));

-- ── process_steps ──
drop policy if exists admin_all_process on public.process_steps;
drop policy if exists public_read_process on public.process_steps;
create policy public_read_process on public.process_steps for select using (true);
create policy admin_insert_process on public.process_steps for insert with check ((select public.is_admin()));
create policy admin_update_process on public.process_steps for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_process on public.process_steps for delete using ((select public.is_admin()));

-- ── project_facts ──
drop policy if exists admin_all_facts on public.project_facts;
drop policy if exists public_read_facts on public.project_facts;
create policy public_read_facts on public.project_facts for select using (exists (select 1 from public.projects p where p.id = project_facts.project_id and p.published_at is not null) or (select public.is_admin()));
create policy admin_insert_facts on public.project_facts for insert with check ((select public.is_admin()));
create policy admin_update_facts on public.project_facts for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_facts on public.project_facts for delete using ((select public.is_admin()));

-- ── project_images ──
drop policy if exists admin_all_images on public.project_images;
drop policy if exists public_read_images on public.project_images;
create policy public_read_images on public.project_images for select using (exists (select 1 from public.projects p where p.id = project_images.project_id and p.published_at is not null) or (select public.is_admin()));
create policy admin_insert_images on public.project_images for insert with check ((select public.is_admin()));
create policy admin_update_images on public.project_images for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_images on public.project_images for delete using ((select public.is_admin()));

-- ── project_stack ──
drop policy if exists admin_all_project_stack on public.project_stack;
drop policy if exists public_read_project_stack on public.project_stack;
create policy public_read_project_stack on public.project_stack for select using (exists (select 1 from public.projects p where p.id = project_stack.project_id and p.published_at is not null) or (select public.is_admin()));
create policy admin_insert_project_stack on public.project_stack for insert with check ((select public.is_admin()));
create policy admin_update_project_stack on public.project_stack for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_project_stack on public.project_stack for delete using ((select public.is_admin()));

-- ── project_stats ──
drop policy if exists admin_all_stats on public.project_stats;
drop policy if exists public_read_stats on public.project_stats;
create policy public_read_stats on public.project_stats for select using (exists (select 1 from public.projects p where p.id = project_stats.project_id and p.published_at is not null) or (select public.is_admin()));
create policy admin_insert_stats on public.project_stats for insert with check ((select public.is_admin()));
create policy admin_update_stats on public.project_stats for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_stats on public.project_stats for delete using ((select public.is_admin()));

-- ── project_steps ──
drop policy if exists admin_all_steps on public.project_steps;
drop policy if exists public_read_steps on public.project_steps;
create policy public_read_steps on public.project_steps for select using (exists (select 1 from public.projects p where p.id = project_steps.project_id and p.published_at is not null) or (select public.is_admin()));
create policy admin_insert_steps on public.project_steps for insert with check ((select public.is_admin()));
create policy admin_update_steps on public.project_steps for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_steps on public.project_steps for delete using ((select public.is_admin()));

-- ── projects ──
drop policy if exists admin_all_projects on public.projects;
drop policy if exists public_read_projects on public.projects;
create policy public_read_projects on public.projects for select using (published_at is not null or (select public.is_admin()));
create policy admin_insert_projects on public.projects for insert with check ((select public.is_admin()));
create policy admin_update_projects on public.projects for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_projects on public.projects for delete using ((select public.is_admin()));

-- ── redirects ──
drop policy if exists admin_all_redirects on public.redirects;
drop policy if exists public_read_redirects on public.redirects;
create policy public_read_redirects on public.redirects for select using (true);
create policy admin_insert_redirects on public.redirects for insert with check ((select public.is_admin()));
create policy admin_update_redirects on public.redirects for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_redirects on public.redirects for delete using ((select public.is_admin()));

-- ── service_items ──
drop policy if exists admin_all_items on public.service_items;
drop policy if exists public_read_items on public.service_items;
create policy public_read_items on public.service_items for select using (true);
create policy admin_insert_items on public.service_items for insert with check ((select public.is_admin()));
create policy admin_update_items on public.service_items for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_items on public.service_items for delete using ((select public.is_admin()));

-- ── services ──
drop policy if exists admin_all_services on public.services;
drop policy if exists public_read_services on public.services;
create policy public_read_services on public.services for select using (true);
create policy admin_insert_services on public.services for insert with check ((select public.is_admin()));
create policy admin_update_services on public.services for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_services on public.services for delete using ((select public.is_admin()));

-- ── site_settings ──
drop policy if exists admin_all_settings on public.site_settings;
drop policy if exists public_read_settings on public.site_settings;
create policy public_read_settings on public.site_settings for select using (true);
create policy admin_insert_settings on public.site_settings for insert with check ((select public.is_admin()));
create policy admin_update_settings on public.site_settings for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_settings on public.site_settings for delete using ((select public.is_admin()));

-- ── stack_groups ──
drop policy if exists admin_all_stack on public.stack_groups;
drop policy if exists public_read_stack on public.stack_groups;
create policy public_read_stack on public.stack_groups for select using (true);
create policy admin_insert_stack on public.stack_groups for insert with check ((select public.is_admin()));
create policy admin_update_stack on public.stack_groups for update using ((select public.is_admin())) with check ((select public.is_admin()));
create policy admin_delete_stack on public.stack_groups for delete using ((select public.is_admin()));
