-- A published page wins over an old redirect from its own address.
--
-- Renaming project A foo -> bar leaves /proiecte/foo -> /proiecte/bar. A new project B later
-- published as foo was unreachable on /proiecte/foo: the redirect middleware runs before the
-- page and sent visitors to A. Same for news. Uniqueness checks only look at the content
-- tables, so the redirect is dropped here, whenever a row is live under a slug.
-- Runs as the caller, like news_items_sync_redirects (admin_all_redirects covers the delete).

create or replace function public.release_live_paths_from_redirects() returns trigger
language plpgsql set search_path = public as $$
declare
  v_ro_prefix text := case tg_table_name when 'projects' then '/proiecte/' else '/noutati/' end;
  v_en_prefix text := case tg_table_name when 'projects' then '/en/work/' else '/en/news/' end;
begin
  if new.published_at is not null then
    delete from redirects
     where from_path in (v_ro_prefix || new.slug_ro, v_en_prefix || coalesce(new.slug_en, new.slug_ro));
  end if;
  return new;
end $$;

drop trigger if exists projects_release_live_paths on public.projects;
create trigger projects_release_live_paths
  after insert or update of slug_ro, slug_en, published_at on public.projects
  for each row execute function public.release_live_paths_from_redirects();

drop trigger if exists news_items_release_live_paths on public.news_items;
create trigger news_items_release_live_paths
  after insert or update of slug_ro, slug_en, published_at on public.news_items
  for each row execute function public.release_live_paths_from_redirects();
