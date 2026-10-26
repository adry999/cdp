-- Case-study sections added after STAR (Adaptare with its safety list, Ce am livrat,
-- Întrebări) plus an optional gallery heading and note, each stored per locale
-- as one jsonb object on projects (all nullable; null hides the section):
--   adapt_*            { heading, body, modules: [{k, v}], integrations: [{k, v}], safety: [{k, v}] }
--   delivered_*        { label, items: [{k, v}] }
--   faq_*              { heading, items: [{q, a}] }
--   gallery_heading_*  { heading, note }
--
-- save_project() is redefined below to read and write the columns. Everything
-- else in it is byte-identical to 20261011070744_projects_nav_services.sql.
-- A payload without one of the new keys keeps the stored value on update and
-- stores null on insert; a key sent as null clears it.
--
-- The last statement fills the columns for startica-app and gives it a single
-- 'walkthrough' link (the hero button, a site-relative url). Idempotent.

alter table public.projects
  add column if not exists adapt_ro jsonb,
  add column if not exists adapt_en jsonb,
  add column if not exists delivered_ro jsonb,
  add column if not exists delivered_en jsonb,
  add column if not exists faq_ro jsonb,
  add column if not exists faq_en jsonb,
  add column if not exists gallery_heading_ro jsonb,
  add column if not exists gallery_heading_en jsonb;

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
  v_links               jsonb := case when jsonb_typeof(payload->'links') = 'array'
                                     then payload->'links' else '[]'::jsonb end;
  v_live                jsonb;
  v_nav_services        text[] := case when jsonb_typeof(payload->'nav_services') = 'array'
                                     then array(
                                       select d.e
                                         from (select t.e, min(t.o) as o
                                                 from jsonb_array_elements_text(payload->'nav_services')
                                                      with ordinality as t(e, o)
                                                where btrim(t.e) <> ''
                                                group by t.e) as d
                                        order by d.o)
                                     else null end;
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

  select l into v_live from jsonb_array_elements(v_links) as l where l->>'kind' = 'live' limit 1;

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
      next_title_ro, next_title_en, sort_order, published_at, updated_by,
      star_cost_ro, star_cost_en, star_goal_ro, star_goal_en,
      star_constraints_ro, star_constraints_en, star_biz_ro, star_biz_en,
      star_incident_ro, star_incident_en, star_gains_ro, star_gains_en,
      star_savings_ro, star_savings_en, links,
      win_value_ro, win_value_en, win_label_ro, win_label_en, nav_services,
      adapt_ro, adapt_en, delivered_ro, delivered_en, faq_ro, faq_en, gallery_heading_ro, gallery_heading_en
    )
    select
      v_slug_ro, v_slug_en, p.title_ro, p.title_en, p.card_title_ro, p.card_title_en,
      p.summary_ro, p.summary_en, p.lead_ro, p.lead_en, p.year,
      coalesce(p.tech, '{}'::text[]),
      nullif(btrim(p.service_tag), ''), coalesce(p.featured, false),
      p.kind_ro, p.kind_en, coalesce(p.tags_ro, '{}'::text[]), coalesce(p.tags_en, '{}'::text[]),
      v_live->>'url', v_live->>'note_ro', v_live->>'note_en', coalesce(p.screens_demo, false),
      p.cover_path, p.cover_alt_ro, p.cover_alt_en, p.hero_path, p.hero_alt_ro, p.hero_alt_en,
      p.context_heading_ro, p.context_heading_en, p.context_body_ro, p.context_body_en,
      p.solution_heading_ro, p.solution_heading_en,
      p.solution_body_ro, p.solution_body_en, p.obstacles_body_ro, p.obstacles_body_en,
      p.changes_body_ro, p.changes_body_en, p.result_body_ro, p.result_body_en,
      p.quote_ro, p.quote_en, p.quote_author, p.quote_role_ro, p.quote_role_en, p.quote_company,
      p.next_title_ro, p.next_title_en,
      coalesce(p.sort_order, (select coalesce(max(sort_order), -1) + 1 from projects)),
      v_published_at, auth.uid(),
      p.star_cost_ro, p.star_cost_en, p.star_goal_ro, p.star_goal_en,
      p.star_constraints_ro, p.star_constraints_en, p.star_biz_ro, p.star_biz_en,
      p.star_incident_ro, p.star_incident_en, p.star_gains_ro, p.star_gains_en,
      p.star_savings_ro, p.star_savings_en, v_links,
      p.win_value_ro, p.win_value_en, p.win_label_ro, p.win_label_en,
      coalesce(v_nav_services, '{}'::text[]),
      p.adapt_ro, p.adapt_en, p.delivered_ro, p.delivered_en, p.faq_ro, p.faq_en, p.gallery_heading_ro, p.gallery_heading_en
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
      next_title_ro text, next_title_en text, sort_order int,
      star_cost_ro jsonb, star_cost_en jsonb, star_goal_ro text, star_goal_en text,
      star_constraints_ro jsonb, star_constraints_en jsonb, star_biz_ro jsonb, star_biz_en jsonb,
      star_incident_ro jsonb, star_incident_en jsonb, star_gains_ro jsonb, star_gains_en jsonb,
      star_savings_ro jsonb, star_savings_en jsonb,
      win_value_ro text, win_value_en text, win_label_ro text, win_label_en text,
      adapt_ro jsonb, adapt_en jsonb, delivered_ro jsonb, delivered_en jsonb, faq_ro jsonb, faq_en jsonb, gallery_heading_ro jsonb, gallery_heading_en jsonb
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
      live_url = v_live->>'url', live_url_label_ro = v_live->>'note_ro', live_url_label_en = v_live->>'note_en',
      links = v_links,
      star_cost_ro = p.star_cost_ro, star_cost_en = p.star_cost_en,
      star_goal_ro = p.star_goal_ro, star_goal_en = p.star_goal_en,
      star_constraints_ro = p.star_constraints_ro, star_constraints_en = p.star_constraints_en,
      star_biz_ro = p.star_biz_ro, star_biz_en = p.star_biz_en,
      star_incident_ro = p.star_incident_ro, star_incident_en = p.star_incident_en,
      star_gains_ro = p.star_gains_ro, star_gains_en = p.star_gains_en,
      star_savings_ro = p.star_savings_ro, star_savings_en = p.star_savings_en,
      win_value_ro = p.win_value_ro, win_value_en = p.win_value_en,
      win_label_ro = p.win_label_ro, win_label_en = p.win_label_en,
      nav_services = coalesce(v_nav_services, projects.nav_services),
      adapt_ro = case when payload ? 'adapt_ro' then p.adapt_ro else projects.adapt_ro end,
      adapt_en = case when payload ? 'adapt_en' then p.adapt_en else projects.adapt_en end,
      delivered_ro = case when payload ? 'delivered_ro' then p.delivered_ro else projects.delivered_ro end,
      delivered_en = case when payload ? 'delivered_en' then p.delivered_en else projects.delivered_en end,
      faq_ro = case when payload ? 'faq_ro' then p.faq_ro else projects.faq_ro end,
      faq_en = case when payload ? 'faq_en' then p.faq_en else projects.faq_en end,
      gallery_heading_ro = case when payload ? 'gallery_heading_ro' then p.gallery_heading_ro else projects.gallery_heading_ro end,
      gallery_heading_en = case when payload ? 'gallery_heading_en' then p.gallery_heading_en else projects.gallery_heading_en end,
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
      next_title_ro text, next_title_en text, sort_order int,
      star_cost_ro jsonb, star_cost_en jsonb, star_goal_ro text, star_goal_en text,
      star_constraints_ro jsonb, star_constraints_en jsonb, star_biz_ro jsonb, star_biz_en jsonb,
      star_incident_ro jsonb, star_incident_en jsonb, star_gains_ro jsonb, star_gains_en jsonb,
      star_savings_ro jsonb, star_savings_en jsonb,
      win_value_ro text, win_value_en text, win_label_ro text, win_label_en text,
      adapt_ro jsonb, adapt_en jsonb, delivered_ro jsonb, delivered_en jsonb, faq_ro jsonb, faq_en jsonb, gallery_heading_ro jsonb, gallery_heading_en jsonb
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


update public.projects set
  adapt_ro = $j${
  "heading": "Module și integrări după nevoile clientului",
  "body": "Startica pornește de la o bază gata de folosit. Fiecare modul se activează, se modifică sau se construiește de la zero pentru regulile grădiniței, iar aplicația se leagă de serviciile pe care le folosiți deja.",
  "modules": [
    {
      "k": "Pornite pe filială",
      "v": "Fiecare filială folosește doar modulele de care are nevoie"
    },
    {
      "k": "Reguli proprii",
      "v": "Taxe, reduceri, servicii și moduri de plată după contractele voastre"
    },
    {
      "k": "Module noi",
      "v": "Activități, cercuri, transport sau orice evidență specifică"
    },
    {
      "k": "Documente și rapoarte",
      "v": "Acorduri, chitanțe și rapoarte în formatul vostru"
    }
  ],
  "integrations": [
    {
      "k": "Cursul zilei",
      "v": "Cursul oficial preluat automat și înghețat pe fiecare plată"
    },
    {
      "k": "SMS",
      "v": "Mesaje către părinți din șabloane, cu previzualizare"
    },
    {
      "k": "Bot Telegram",
      "v": "Notificări către părinți și echipă"
    },
    {
      "k": "Excel, imprimante și altele",
      "v": "Export pentru contabil, bon termic de 58 mm, plus orice serviciu cu API"
    }
  ],
  "safety": [
    {
      "k": "Datele stau la voi",
      "v": "Pe calculatoarele grădiniței, nu într-un cloud străin"
    },
    {
      "k": "Backup automat",
      "v": "Copii pe zile și luni, plus copie într-un folder extern"
    },
    {
      "k": "Salarii sub PIN",
      "v": "Doar cine are PIN-ul vede și plătește salariile"
    },
    {
      "k": "Istoric complet",
      "v": "Fiecare modificare, cu valoarea veche și cea nouă"
    }
  ]
}$j$::jsonb,
  adapt_en = $j${
  "heading": "Modules and integrations built around the client",
  "body": "Startica starts from a ready-to-use base. Each module can be switched on, changed or built from scratch for the kindergarten's rules, and the app connects to the services you already use.",
  "modules": [
    {
      "k": "Per branch",
      "v": "Each branch uses only the modules it needs"
    },
    {
      "k": "Your own rules",
      "v": "Fees, discounts, services and payment methods that follow your contracts"
    },
    {
      "k": "New modules",
      "v": "Activities, clubs, transport or any specific records"
    },
    {
      "k": "Documents and reports",
      "v": "Consent forms, receipts and reports in your format"
    }
  ],
  "integrations": [
    {
      "k": "Daily exchange rate",
      "v": "The official rate fetched automatically and frozen on each payment"
    },
    {
      "k": "SMS",
      "v": "Messages to parents from templates, with a preview"
    },
    {
      "k": "Telegram bot",
      "v": "Notifications for parents and staff"
    },
    {
      "k": "Excel, printers and more",
      "v": "Accountant export, 58 mm thermal receipts, plus any service with an API"
    }
  ],
  "safety": [
    {
      "k": "Your data stays with you",
      "v": "On the kindergarten's computers, not in someone else's cloud"
    },
    {
      "k": "Automatic backup",
      "v": "Copies by day and month, plus a copy to an external folder"
    },
    {
      "k": "Payroll behind a PIN",
      "v": "Only whoever has the PIN can see and pay salaries"
    },
    {
      "k": "Full history",
      "v": "Every change, with the old and the new value"
    }
  ]
}$j$::jsonb,
  delivered_ro = $j${
  "label": "Ce am livrat",
  "items": [
    {
      "k": "Aplicația desktop",
      "v": "Pentru Windows, cu date locale"
    },
    {
      "k": "Tipărituri",
      "v": "Chitanță A4, bon 58 mm, meniu, acorduri"
    },
    {
      "k": "Design system",
      "v": "Culori, tipografie și componente"
    },
    {
      "k": "Mentenanță",
      "v": "6 luni după lansare"
    }
  ]
}$j$::jsonb,
  delivered_en = $j${
  "label": "What we delivered",
  "items": [
    {
      "k": "Desktop app",
      "v": "For Windows, with local data"
    },
    {
      "k": "Printouts",
      "v": "A4 receipt, 58 mm receipt, menu, consent forms"
    },
    {
      "k": "Design system",
      "v": "Colour, type and components"
    },
    {
      "k": "Maintenance",
      "v": "6 months after launch"
    }
  ]
}$j$::jsonb,
  faq_ro = $j${
  "heading": "Întrebări frecvente",
  "items": [
    {
      "q": "Aplicația merge fără internet?",
      "a": "Da. Datele stau pe calculatorul grădiniței, iar aplicația lucrează complet offline. Când există internet, calculatoarele se pot sincroniza între ele."
    },
    {
      "q": "Putem aduce datele pe care le avem în Excel?",
      "a": "Da. La prima pornire, asistentul importă foile Excel și arată pentru fiecare ce devine în aplicație și câte rânduri are."
    },
    {
      "q": "Se potrivește pentru un centru after-school sau un club?",
      "a": "Da. Modulele se pornesc după nevoie, iar activitățile proprii se adaugă ca servicii sau ca module noi."
    },
    {
      "q": "Unde stau datele și cine le vede?",
      "a": "Pe calculatoarele voastre. Accesul se dă pe calculator și pe modul, salariile stau sub PIN, iar fiecare modificare rămâne în istoric."
    },
    {
      "q": "Cât durează implementarea?",
      "a": "Depinde de cerințe și de complexitatea proiectului. Estimarea o facem după prima discuție."
    },
    {
      "q": "Cât costă?",
      "a": "Prețul depinde de module și de adaptări. Am explicat cum se formează în articolul „Cât costă o aplicație web și de ce variază atât”."
    },
    {
      "q": "Ne ajutați după lansare?",
      "a": "Da. Prezentăm aplicația, instruim echipa și vă ajutăm pe tot parcursul celor 6 luni de mentenanță."
    }
  ]
}$j$::jsonb,
  faq_en = $j${
  "heading": "FAQ",
  "items": [
    {
      "q": "Does the app work without internet?",
      "a": "Yes. Data lives on the kindergarten's computer and the app works fully offline. When there is internet, computers can sync with each other."
    },
    {
      "q": "Can we bring in the data we have in Excel?",
      "a": "Yes. On first run, the setup assistant imports the Excel sheets and shows for each one what it becomes in the app and how many rows it has."
    },
    {
      "q": "Does it fit an after-school centre or a club?",
      "a": "Yes. Modules are switched on as needed, and your own activities are added as services or new modules."
    },
    {
      "q": "Where is the data stored and who sees it?",
      "a": "On your computers. Access is set per computer and per module, salaries sit behind a PIN, and every change stays in the history."
    },
    {
      "q": "How long does implementation take?",
      "a": "It depends on the requirements and the complexity of the project. We estimate after the first conversation."
    },
    {
      "q": "How much does it cost?",
      "a": "The price depends on the modules and the adaptations. We explain how it is built up in the article “How much a web app costs and why it varies so much”."
    },
    {
      "q": "Do you help after launch?",
      "a": "Yes. We present the app, train the team and help you throughout the 6 months of maintenance."
    }
  ]
}$j$::jsonb,
  gallery_heading_ro = $j${
  "heading": "Câteva slide-uri din prezentare",
  "note": "Date demonstrative, inventate · prezentarea completă o arătăm la întâlnire"
}$j$::jsonb,
  gallery_heading_en = $j${
  "heading": "A few slides from the presentation",
  "note": "Made-up demo data · we show the full presentation in a meeting"
}$j$::jsonb,
  links = $j$[
  {
    "kind": "walkthrough",
    "url": "/#contact",
    "note_ro": "Îți arătăm aplicația în detaliu",
    "note_en": "We'll show you the app in detail"
  }
]$j$::jsonb
where slug_ro = 'startica-app';
