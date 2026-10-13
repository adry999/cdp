-- Atomic project reorder.
--
-- The admin list used to send one UPDATE per project in parallel: a failure halfway left the
-- global ordering half-applied, and an update that matched no row (a slug deleted meanwhile)
-- passed silently. One function body is one transaction: either every project gets its new
-- sort_order or none does. Like save_project() it runs as the caller, so the admin_all_*
-- RLS policy stays the authorization boundary, with an explicit is_admin() check on top.

create or replace function public.reorder_projects(slugs text[])
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_slug  text;
  v_index int;
  v_rows  int;
begin
  if not is_admin() then
    raise exception 'Not authorised to reorder projects' using errcode = '42501';
  end if;

  if slugs is null or cardinality(slugs) = 0 then
    return;
  end if;

  if (select count(distinct s) from unnest(slugs) as s) <> cardinality(slugs) then
    raise exception 'Duplicate slug in project order' using errcode = '22023';
  end if;

  for v_index in 1 .. cardinality(slugs) loop
    v_slug := slugs[v_index];
    update projects set sort_order = v_index - 1 where slug_ro = v_slug;
    get diagnostics v_rows = row_count;
    if v_rows <> 1 then
      raise exception 'Project not found: %', v_slug using errcode = 'P0002';
    end if;
  end loop;
end $$;

revoke all on function public.reorder_projects(text[]) from public, anon;
grant execute on function public.reorder_projects(text[]) to authenticated;
