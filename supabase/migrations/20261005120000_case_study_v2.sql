-- Case study v2. The page is restructured into seven fixed sections, so projects
-- gain a per-locale kind and tags, an optional live link, one text column per
-- prose section and a screens_demo flag; the stack becomes a child table
-- (project_stack) mirroring project_facts. The old heading / next-title columns
-- and project_steps stay in place but the editor no longer writes them.
--
-- save_project() is otherwise identical to 20260921120000_add_project_featured.sql,
-- except that publishing now requires the problem text (context_body_ro) instead
-- of the context heading.

alter table public.projects
  add column if not exists kind_ro text, add column if not exists kind_en text,
  add column if not exists tags_ro text[] not null default '{}', add column if not exists tags_en text[] not null default '{}',
  add column if not exists live_url text, add column if not exists live_url_label_ro text, add column if not exists live_url_label_en text,
  add column if not exists solution_body_ro text, add column if not exists solution_body_en text,
  add column if not exists obstacles_body_ro text, add column if not exists obstacles_body_en text,
  add column if not exists changes_body_ro text, add column if not exists changes_body_en text,
  add column if not exists result_body_ro text, add column if not exists result_body_en text,
  add column if not exists screens_demo boolean not null default false;

create table if not exists public.project_stack (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  role_ro text not null,
  role_en text,
  sort_order int not null default 0
);

create index if not exists project_stack_project_id_idx on public.project_stack (project_id);

alter table public.project_stack enable row level security;

create policy public_read_project_stack on public.project_stack for select using (
  exists (select 1 from projects p where p.id = project_id and p.published_at is not null));

create policy admin_all_project_stack on public.project_stack for all using (is_admin()) with check (is_admin());

create or replace function public.save_project(payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id                 uuid := nullif(payload->>'id', '')::uuid;
  v_slug_ro             text := btrim(payload->>'slug_ro');
  v_slug_en             text := coalesce(nullif(btrim(payload->>'slug_en'), ''), btrim(payload->>'slug_ro'));
  v_publish             boolean := coalesce((payload->>'published')::boolean, false);
  v_prev_slug_ro        text;
  v_prev_slug_en        text;
  v_prev_published_at   timestamptz;
  v_published_at        timestamptz;
begin
  if not is_admin() then
    raise exception 'Not authorised to edit projects' using errcode = '42501';
  end if;

  if v_slug_ro is null or v_slug_ro !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'Invalid slug: %', v_slug_ro using errcode = '22023';
  end if;

  if exists (
    select 1 from projects
     where id is distinct from v_id
       and (slug_ro in (v_slug_ro, v_slug_en) or slug_en in (v_slug_ro, v_slug_en))
  ) then
    raise exception 'Slug already used by another project: % / %', v_slug_ro, v_slug_en using errcode = '23505';
  end if;

  if v_publish then
    if coalesce(btrim(payload->>'title_ro'), '') = ''
       or coalesce(btrim(payload->>'card_title_ro'), '') = ''
       or coalesce(btrim(payload->>'summary_ro'), '') = ''
       or coalesce(btrim(payload->>'lead_ro'), '') = ''
       or coalesce(btrim(payload->>'context_body_ro'), '') = ''
    then
      raise exception 'Cannot publish: title, card title, summary, lead and problem text (RO) are required'
        using errcode = '23514';
    end if;
  end if;

  if v_id is not null then
    select slug_ro, slug_en, published_at
      into v_prev_slug_ro, v_prev_slug_en, v_prev_published_at
      from projects
     where id = v_id;

    if not found then
      raise exception 'Project % no longer exists', v_id using errcode = 'P0002';
    end if;
  end if;

  v_published_at := case
    when not v_publish then null
    else coalesce(v_prev_published_at, now())
  end;

  if v_id is null then
    insert into projects (
      slug_ro, slug_en, title_ro, title_en, card_title_ro, card_title_en,
      summary_ro, summary_en, lead_ro, lead_en, year, tech, service_tag, featured,
      kind_ro, kind_en, tags_ro, tags_en, live_url, live_url_label_ro, live_url_label_en, screens_demo,
      cover_path, cover_alt_ro, cover_alt_en, hero_path, hero_alt_ro, hero_alt_en,
      context_heading_ro, context_heading_en, context_body_ro, context_body_en,
      solution_heading_ro, solution_heading_en,
      solution_body_ro, solution_body_en, obstacles_body_ro, obstacles_body_en,
      changes_body_ro, changes_body_en, result_body_ro, result_body_en,
      quote_ro, quote_en, quote_author, quote_role_ro, quote_role_en, quote_company,
      next_title_ro, next_title_en, sort_order, published_at, updated_by
    )
    select
      v_slug_ro, v_slug_en, p.title_ro, p.title_en, p.card_title_ro, p.card_title_en,
      p.summary_ro, p.summary_en, p.lead_ro, p.lead_en, p.year,
      coalesce(p.tech, '{}'::text[]),
      nullif(btrim(p.service_tag), ''), coalesce(p.featured, false),
      p.kind_ro, p.kind_en, coalesce(p.tags_ro, '{}'::text[]), coalesce(p.tags_en, '{}'::text[]),
      p.live_url, p.live_url_label_ro, p.live_url_label_en, coalesce(p.screens_demo, false),
      p.cover_path, p.cover_alt_ro, p.cover_alt_en, p.hero_path, p.hero_alt_ro, p.hero_alt_en,
      p.context_heading_ro, p.context_heading_en, p.context_body_ro, p.context_body_en,
      p.solution_heading_ro, p.solution_heading_en,
      p.solution_body_ro, p.solution_body_en, p.obstacles_body_ro, p.obstacles_body_en,
      p.changes_body_ro, p.changes_body_en, p.result_body_ro, p.result_body_en,
      p.quote_ro, p.quote_en, p.quote_author, p.quote_role_ro, p.quote_role_en, p.quote_company,
      p.next_title_ro, p.next_title_en,
      coalesce(p.sort_order, (select coalesce(max(sort_order), -1) + 1 from projects)),
      v_published_at, auth.uid()
    from jsonb_to_record(payload) as p(
      title_ro text, title_en text, card_title_ro text, card_title_en text,
      summary_ro text, summary_en text, lead_ro text, lead_en text, year int, tech text[],
      service_tag text, featured boolean,
      kind_ro text, kind_en text, tags_ro text[], tags_en text[],
      live_url text, live_url_label_ro text, live_url_label_en text, screens_demo boolean,
      cover_path text, cover_alt_ro text, cover_alt_en text,
      hero_path text, hero_alt_ro text, hero_alt_en text,
      context_heading_ro text, context_heading_en text, context_body_ro text, context_body_en text,
      solution_heading_ro text, solution_heading_en text,
      solution_body_ro text, solution_body_en text, obstacles_body_ro text, obstacles_body_en text,
      changes_body_ro text, changes_body_en text, result_body_ro text, result_body_en text,
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
      service_tag = nullif(btrim(p.service_tag), ''),
      featured = coalesce(p.featured, projects.featured),
      kind_ro = p.kind_ro, kind_en = p.kind_en,
      tags_ro = coalesce(p.tags_ro, '{}'::text[]), tags_en = coalesce(p.tags_en, '{}'::text[]),
      live_url = p.live_url, live_url_label_ro = p.live_url_label_ro, live_url_label_en = p.live_url_label_en,
      screens_demo = coalesce(p.screens_demo, projects.screens_demo),
      cover_path = p.cover_path, cover_alt_ro = p.cover_alt_ro, cover_alt_en = p.cover_alt_en,
      hero_path = p.hero_path, hero_alt_ro = p.hero_alt_ro, hero_alt_en = p.hero_alt_en,
      context_heading_ro = p.context_heading_ro, context_heading_en = p.context_heading_en,
      context_body_ro = p.context_body_ro, context_body_en = p.context_body_en,
      solution_heading_ro = p.solution_heading_ro, solution_heading_en = p.solution_heading_en,
      solution_body_ro = p.solution_body_ro, solution_body_en = p.solution_body_en,
      obstacles_body_ro = p.obstacles_body_ro, obstacles_body_en = p.obstacles_body_en,
      changes_body_ro = p.changes_body_ro, changes_body_en = p.changes_body_en,
      result_body_ro = p.result_body_ro, result_body_en = p.result_body_en,
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
      service_tag text, featured boolean,
      kind_ro text, kind_en text, tags_ro text[], tags_en text[],
      live_url text, live_url_label_ro text, live_url_label_en text, screens_demo boolean,
      cover_path text, cover_alt_ro text, cover_alt_en text,
      hero_path text, hero_alt_ro text, hero_alt_en text,
      context_heading_ro text, context_heading_en text, context_body_ro text, context_body_en text,
      solution_heading_ro text, solution_heading_en text,
      solution_body_ro text, solution_body_en text, obstacles_body_ro text, obstacles_body_en text,
      changes_body_ro text, changes_body_en text, result_body_ro text, result_body_en text,
      quote_ro text, quote_en text, quote_author text, quote_role_ro text,
      quote_role_en text, quote_company text,
      next_title_ro text, next_title_en text, sort_order int
    )
    where projects.id = v_id;

    if v_prev_published_at is not null and v_published_at is not null then
      if v_prev_slug_ro is distinct from v_slug_ro then
        insert into redirects (from_path, to_path, status)
        values ('/proiecte/' || v_prev_slug_ro, '/proiecte/' || v_slug_ro, 301)
        on conflict (from_path) do update set to_path = excluded.to_path;

        update redirects set to_path = '/proiecte/' || v_slug_ro
         where to_path = '/proiecte/' || v_prev_slug_ro;
      end if;

      if coalesce(v_prev_slug_en, v_prev_slug_ro) is distinct from v_slug_en then
        insert into redirects (from_path, to_path, status)
        values ('/en/work/' || coalesce(v_prev_slug_en, v_prev_slug_ro), '/en/work/' || v_slug_en, 301)
        on conflict (from_path) do update set to_path = excluded.to_path;

        update redirects set to_path = '/en/work/' || v_slug_en
         where to_path = '/en/work/' || coalesce(v_prev_slug_en, v_prev_slug_ro);
      end if;
    end if;

    if v_published_at is null then
      delete from redirects
       where to_path = '/proiecte/' || v_slug_ro
          or to_path = '/en/work/' || v_slug_en;
    end if;
  end if;

  delete from redirects where from_path = to_path;

  delete from project_facts  where project_id = v_id;
  delete from project_steps  where project_id = v_id;
  delete from project_stats  where project_id = v_id;
  delete from project_stack  where project_id = v_id;
  delete from project_images where project_id = v_id;

  insert into project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
  select v_id, f.label_ro, f.label_en, f.value_ro, f.value_en, coalesce(f.sort_order, f.ord::int - 1)
    from rows from (
      jsonb_to_recordset(coalesce(payload->'facts', '[]'::jsonb))
        as (label_ro text, label_en text, value_ro text, value_en text, sort_order int)
    ) with ordinality as f(label_ro, label_en, value_ro, value_en, sort_order, ord);

  insert into project_steps (project_id, title_ro, title_en, body_ro, body_en, sort_order)
  select v_id, s.title_ro, s.title_en, s.body_ro, s.body_en, coalesce(s.sort_order, s.ord::int - 1)
    from rows from (
      jsonb_to_recordset(coalesce(payload->'steps', '[]'::jsonb))
        as (title_ro text, title_en text, body_ro text, body_en text, sort_order int)
    ) with ordinality as s(title_ro, title_en, body_ro, body_en, sort_order, ord);

  insert into project_stack (project_id, name, role_ro, role_en, sort_order)
  select v_id, sk.name, sk.role_ro, sk.role_en, coalesce(sk.sort_order, sk.ord::int - 1)
    from rows from (
      jsonb_to_recordset(coalesce(payload->'stack', '[]'::jsonb))
        as (name text, role_ro text, role_en text, sort_order int)
    ) with ordinality as sk(name, role_ro, role_en, sort_order, ord)
   where coalesce(btrim(sk.name), '') <> '';

  insert into project_stats (project_id, value, label_ro, label_en, sort_order)
  select v_id, st.value, st.label_ro, st.label_en, coalesce(st.sort_order, st.ord::int - 1)
    from rows from (
      jsonb_to_recordset(coalesce(payload->'stats', '[]'::jsonb))
        as (value text, label_ro text, label_en text, sort_order int)
    ) with ordinality as st(value, label_ro, label_en, sort_order, ord);

  insert into project_images (project_id, path, alt_ro, alt_en, aspect, sort_order)
  select v_id, btrim(img.path), coalesce(nullif(btrim(img.alt_ro), ''), '—'), img.alt_en,
         coalesce(img.aspect, '4/3'), coalesce(img.sort_order, img.ord::int - 1)
    from rows from (
      jsonb_to_recordset(coalesce(payload->'images', '[]'::jsonb))
        as (path text, alt_ro text, alt_en text, aspect text, sort_order int)
    ) with ordinality as img(path, alt_ro, alt_en, aspect, sort_order, ord)
   where coalesce(btrim(img.path), '') <> '';

  return jsonb_build_object('id', v_id, 'slug_ro', v_slug_ro, 'slug_en', v_slug_en);
end $$;

revoke all on function public.save_project(jsonb) from public, anon;
grant execute on function public.save_project(jsonb) to authenticated;

comment on function public.save_project(jsonb) is
  'Atomically creates or updates a project and replaces its child rows. Keyed on id, never slug.';
