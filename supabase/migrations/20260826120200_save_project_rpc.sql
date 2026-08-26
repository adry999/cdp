-- Transactional project save.
--
-- Replaces the previous client-side sequence, which had two defects that lost
-- data in production:
--
--   * The upsert used `onConflict: slug_ro`. Editing the slug of an existing
--     project made the conflict target match nothing, so Postgres INSERTed a
--     second project instead of renaming the first.
--   * Facts, steps, stats and images were deleted and re-inserted as four
--     independent round trips. A failure between them left the case study with
--     no child content, and the DELETE's own error was masked by the INSERT
--     that followed it.
--
-- A function body is a single transaction, so either the whole project saves or
-- none of it does. Runs as the caller (security invoker), so the existing
-- admin_all_* RLS policies remain the authorization boundary.

create or replace function public.save_project(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id           uuid := nullif(payload->>'id', '')::uuid;
  v_slug_ro      text := btrim(payload->>'slug_ro');
  v_slug_en      text := coalesce(nullif(btrim(payload->>'slug_en'), ''), btrim(payload->>'slug_ro'));
  v_publish      boolean := coalesce((payload->>'published')::boolean, false);
  v_prev         record;
  v_published_at timestamptz;
begin
  if not is_admin() then
    raise exception 'Not authorised to edit projects' using errcode = '42501';
  end if;

  if v_slug_ro is null or v_slug_ro !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Invalid slug: %', v_slug_ro using errcode = '22023';
  end if;

  if v_id is not null then
    select id, slug_ro, slug_en, published_at
      into v_prev
      from projects
     where id = v_id;

    if not found then
      raise exception 'Project % no longer exists', v_id using errcode = 'P0002';
    end if;
  end if;

  -- Publishing stamps a date once; re-saving a published project keeps it.
  v_published_at := case
    when not v_publish then null
    else coalesce(v_prev.published_at, now())
  end;

  if v_id is null then
    insert into projects (
      slug_ro, slug_en, title_ro, title_en, card_title_ro, card_title_en,
      summary_ro, summary_en, lead_ro, lead_en, year, tech,
      cover_path, cover_alt_ro, cover_alt_en, hero_path, hero_alt_ro, hero_alt_en,
      context_heading_ro, context_heading_en, context_body_ro, context_body_en,
      solution_heading_ro, solution_heading_en,
      quote_ro, quote_en, quote_author, quote_role_ro, quote_role_en, quote_company,
      next_title_ro, next_title_en, sort_order, published_at, updated_by
    )
    select
      v_slug_ro, v_slug_en, p.title_ro, p.title_en, p.card_title_ro, p.card_title_en,
      p.summary_ro, p.summary_en, p.lead_ro, p.lead_en, p.year,
      coalesce(p.tech, '{}'::text[]),
      p.cover_path, p.cover_alt_ro, p.cover_alt_en, p.hero_path, p.hero_alt_ro, p.hero_alt_en,
      p.context_heading_ro, p.context_heading_en, p.context_body_ro, p.context_body_en,
      p.solution_heading_ro, p.solution_heading_en,
      p.quote_ro, p.quote_en, p.quote_author, p.quote_role_ro, p.quote_role_en, p.quote_company,
      p.next_title_ro, p.next_title_en,
      coalesce(p.sort_order, (select coalesce(max(sort_order), -1) + 1 from projects)),
      v_published_at, auth.uid()
    from jsonb_to_record(payload) as p(
      title_ro text, title_en text, card_title_ro text, card_title_en text,
      summary_ro text, summary_en text, lead_ro text, lead_en text, year int, tech text[],
      cover_path text, cover_alt_ro text, cover_alt_en text,
      hero_path text, hero_alt_ro text, hero_alt_en text,
      context_heading_ro text, context_heading_en text, context_body_ro text, context_body_en text,
      solution_heading_ro text, solution_heading_en text,
      quote_ro text, quote_en text, quote_author text, quote_role_ro text,
      quote_role_en text, quote_company text,
      next_title_ro text, next_title_en text, sort_order int
    )
    returning id into v_id;
  else
    update projects set
      slug_ro = v_slug_ro, slug_en = v_slug_en,
      title_ro = p.title_ro, title_en = p.title_en,
      card_title_ro = p.card_title_ro, card_title_en = p.card_title_en,
      summary_ro = p.summary_ro, summary_en = p.summary_en,
      lead_ro = p.lead_ro, lead_en = p.lead_en,
      year = p.year, tech = coalesce(p.tech, '{}'::text[]),
      cover_path = p.cover_path, cover_alt_ro = p.cover_alt_ro, cover_alt_en = p.cover_alt_en,
      hero_path = p.hero_path, hero_alt_ro = p.hero_alt_ro, hero_alt_en = p.hero_alt_en,
      context_heading_ro = p.context_heading_ro, context_heading_en = p.context_heading_en,
      context_body_ro = p.context_body_ro, context_body_en = p.context_body_en,
      solution_heading_ro = p.solution_heading_ro, solution_heading_en = p.solution_heading_en,
      quote_ro = p.quote_ro, quote_en = p.quote_en, quote_author = p.quote_author,
      quote_role_ro = p.quote_role_ro, quote_role_en = p.quote_role_en,
      quote_company = p.quote_company,
      next_title_ro = p.next_title_ro, next_title_en = p.next_title_en,
      sort_order = coalesce(p.sort_order, projects.sort_order),
      published_at = v_published_at,
      updated_by = auth.uid()
    from jsonb_to_record(payload) as p(
      title_ro text, title_en text, card_title_ro text, card_title_en text,
      summary_ro text, summary_en text, lead_ro text, lead_en text, year int, tech text[],
      cover_path text, cover_alt_ro text, cover_alt_en text,
      hero_path text, hero_alt_ro text, hero_alt_en text,
      context_heading_ro text, context_heading_en text, context_body_ro text, context_body_en text,
      solution_heading_ro text, solution_heading_en text,
      quote_ro text, quote_en text, quote_author text, quote_role_ro text,
      quote_role_en text, quote_company text,
      next_title_ro text, next_title_en text, sort_order int
    )
    where projects.id = v_id;

    -- A published project that changes slug must keep its old URLs alive.
    if v_prev.published_at is not null then
      if v_prev.slug_ro is distinct from v_slug_ro then
        insert into redirects (from_path, to_path, status)
        values ('/proiecte/' || v_prev.slug_ro, '/proiecte/' || v_slug_ro, 301)
        on conflict (from_path) do update set to_path = excluded.to_path;

        -- Keep older redirects pointing at the current location rather than
        -- chaining a -> b -> c.
        update redirects set to_path = '/proiecte/' || v_slug_ro
         where to_path = '/proiecte/' || v_prev.slug_ro;
      end if;

      if coalesce(v_prev.slug_en, v_prev.slug_ro) is distinct from v_slug_en then
        insert into redirects (from_path, to_path, status)
        values ('/en/work/' || coalesce(v_prev.slug_en, v_prev.slug_ro), '/en/work/' || v_slug_en, 301)
        on conflict (from_path) do update set to_path = excluded.to_path;

        update redirects set to_path = '/en/work/' || v_slug_en
         where to_path = '/en/work/' || coalesce(v_prev.slug_en, v_prev.slug_ro);
      end if;
    end if;
  end if;

  -- A project must never redirect to itself.
  delete from redirects where from_path = to_path;

  -- Children are replaced wholesale. Safe here: if any statement below raises,
  -- the whole function rolls back and the previous rows survive.
  delete from project_facts  where project_id = v_id;
  delete from project_steps  where project_id = v_id;
  delete from project_stats  where project_id = v_id;
  delete from project_images where project_id = v_id;

  insert into project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
  select v_id, f.label_ro, f.label_en, f.value_ro, f.value_en,
         coalesce(f.sort_order, ordinality::int - 1)
    from jsonb_to_recordset(coalesce(payload->'facts', '[]'::jsonb))
      with ordinality as f(label_ro text, label_en text, value_ro text, value_en text, sort_order int);

  insert into project_steps (project_id, title_ro, title_en, body_ro, body_en, sort_order)
  select v_id, s.title_ro, s.title_en, s.body_ro, s.body_en,
         coalesce(s.sort_order, ordinality::int - 1)
    from jsonb_to_recordset(coalesce(payload->'steps', '[]'::jsonb))
      with ordinality as s(title_ro text, title_en text, body_ro text, body_en text, sort_order int);

  insert into project_stats (project_id, value, label_ro, label_en, sort_order)
  select v_id, st.value, st.label_ro, st.label_en,
         coalesce(st.sort_order, ordinality::int - 1)
    from jsonb_to_recordset(coalesce(payload->'stats', '[]'::jsonb))
      with ordinality as st(value text, label_ro text, label_en text, sort_order int);

  -- Blank paths are dropped rather than stored; project_images.path is NOT NULL
  -- and a '' path renders a broken image on the case study.
  insert into project_images (project_id, path, alt_ro, alt_en, aspect, sort_order)
  select v_id, btrim(img.path), coalesce(nullif(btrim(img.alt_ro), ''), '—'), img.alt_en,
         coalesce(img.aspect, '4/3'), coalesce(img.sort_order, ordinality::int - 1)
    from jsonb_to_recordset(coalesce(payload->'images', '[]'::jsonb))
      with ordinality as img(path text, alt_ro text, alt_en text, aspect text, sort_order int)
   where coalesce(btrim(img.path), '') <> '';

  return jsonb_build_object('id', v_id, 'slug_ro', v_slug_ro, 'slug_en', v_slug_en);
end $$;

revoke all on function public.save_project(jsonb) from public, anon;
grant execute on function public.save_project(jsonb) to authenticated;

comment on function public.save_project(jsonb) is
  'Atomically creates or updates a project and replaces its child rows. Keyed on id, never slug.';
