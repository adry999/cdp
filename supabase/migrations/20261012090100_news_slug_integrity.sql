-- News slugs get the same guards as project slugs.
--
-- slug_ro and slug_en were each unique, but not across the two columns: one item's English
-- slug could equal another's Romanian slug, and the public lookup (slug_ro or slug_en)
-- would then resolve to either. 'nou' / 'new' are the create route and can never be a slug.

alter table public.news_items drop constraint if exists news_items_slug_not_reserved;
alter table public.news_items
  add constraint news_items_slug_not_reserved
  check (slug_ro not in ('nou', 'new') and (slug_en is null or slug_en not in ('nou', 'new')));

-- Runs as the caller; admin_all_news lets an admin see every row, which is the only role that can write.
create or replace function public.news_items_check_slugs() returns trigger
language plpgsql set search_path = public as $$
declare
  v_slug_en text := coalesce(new.slug_en, new.slug_ro);
begin
  if exists (
    select 1 from news_items
     where id is distinct from new.id
       and (slug_ro in (new.slug_ro, v_slug_en) or slug_en in (new.slug_ro, v_slug_en))
  ) then
    raise exception 'Slug already used by another news item: % / %', new.slug_ro, v_slug_en using errcode = '23505';
  end if;
  return new;
end $$;

drop trigger if exists news_items_check_slugs on public.news_items;
create trigger news_items_check_slugs
  before insert or update of slug_ro, slug_en on public.news_items
  for each row execute function public.news_items_check_slugs();
