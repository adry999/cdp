-- Redirects for renamed news slugs, as save_project() does for projects.
--
-- Changing the slug of a published item left the old /noutati/<slug> (or /en/news/<slug>)
-- as a 404. A trigger keeps the `redirects` table in step instead of an RPC, because a news
-- item is a single-row write and the admin repository does plain updates. It runs as the
-- caller (admin_all_redirects covers the write).

create or replace function public.news_items_sync_redirects() returns trigger
language plpgsql set search_path = public as $$
declare
  v_old_en text := coalesce(old.slug_en, old.slug_ro);
  v_new_en text := coalesce(new.slug_en, new.slug_ro);
begin
  if old.published_at is not null and new.published_at is not null then
    if old.slug_ro is distinct from new.slug_ro then
      insert into redirects (from_path, to_path, status)
      values ('/noutati/' || old.slug_ro, '/noutati/' || new.slug_ro, 301)
      on conflict (from_path) do update set to_path = excluded.to_path;

      update redirects set to_path = '/noutati/' || new.slug_ro
       where to_path = '/noutati/' || old.slug_ro;
    end if;

    if v_old_en is distinct from v_new_en then
      insert into redirects (from_path, to_path, status)
      values ('/en/news/' || v_old_en, '/en/news/' || v_new_en, 301)
      on conflict (from_path) do update set to_path = excluded.to_path;

      update redirects set to_path = '/en/news/' || v_new_en
       where to_path = '/en/news/' || v_old_en;
    end if;
  end if;

  -- An unpublished item has no page to land on, so redirects into it would chain into a 404.
  if new.published_at is null then
    delete from redirects
     where to_path = '/noutati/' || new.slug_ro
        or to_path = '/en/news/' || v_new_en;
  end if;

  -- Renaming back to an earlier slug must not leave a self-loop.
  delete from redirects where from_path = to_path;
  return new;
end $$;

drop trigger if exists news_items_sync_redirects on public.news_items;
create trigger news_items_sync_redirects
  after update of slug_ro, slug_en, published_at on public.news_items
  for each row execute function public.news_items_sync_redirects();
