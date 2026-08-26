-- Codepedia — schema propusă (PostgreSQL / Supabase)
-- Convenție: textul editabil are variantă _ro (obligatorie) și _en (opțională,
-- fallback pe RO la randare). Ordinea listelor se ține în sort_order.

create extension if not exists "pgcrypto";

-- ── Roluri ────────────────────────────────────────────────────────────────────

create table app_users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  role        text not null default 'admin' check (role in ('admin', 'editor')),
  created_at  timestamptz not null default now()
);

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from app_users where id = auth.uid());
$$;

-- ── Proiecte ──────────────────────────────────────────────────────────────────

create table projects (
  id                   uuid primary key default gen_random_uuid(),
  slug_ro              text not null unique,
  slug_en              text unique,
  title_ro             text not null,
  title_en             text,
  card_title_ro        text not null,
  card_title_en        text,
  summary_ro           text not null,
  summary_en           text,
  lead_ro              text not null,
  lead_en              text,
  year                 int,
  tech                 text[] not null default '{}',
  cover_path           text,          -- Storage: project-media/…  (16/10)
  cover_alt_ro         text,
  cover_alt_en         text,
  hero_path            text,          -- 16/9
  hero_alt_ro          text,
  hero_alt_en          text,
  context_heading_ro   text,
  context_heading_en   text,
  context_body_ro      text,          -- paragrafe separate de linie goală
  context_body_en      text,
  solution_heading_ro  text,
  solution_heading_en  text,
  quote_ro             text,
  quote_en             text,
  quote_author         text,
  quote_role_ro        text,
  quote_role_en        text,
  quote_company        text,
  sort_order           int not null default 0,
  published_at         timestamptz,
  preview_token        uuid not null default gen_random_uuid(),
  updated_by           uuid references app_users (id),
  updated_at           timestamptz not null default now(),
  created_at           timestamptz not null default now()
);

create index on projects (published_at, sort_order);

-- Secțiunea 01 „Date": Client / Durată / Echipă / Utilizatori
create table project_facts (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects (id) on delete cascade,
  label_ro    text not null,
  label_en    text,
  value_ro    text not null,
  value_en    text,
  sort_order  int not null default 0
);

-- Secțiunea 03 „Soluție": pașii 01…04, numerotați din sort_order
create table project_steps (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references projects (id) on delete cascade,
  title_ro      text not null,
  title_en      text,
  body_ro       text not null,
  body_en       text,
  sort_order    int not null default 0
);

-- Secțiunea 04 „Rezultat": cifrele mari. value e text, ca să încapă „48%", „0", „1 200 €"
create table project_stats (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects (id) on delete cascade,
  value       text not null,
  label_ro    text not null,
  label_en    text,
  sort_order  int not null default 0
);

-- Galeria din secțiunea 03 (4/3) și orice imagine suplimentară
create table project_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects (id) on delete cascade,
  path        text not null,
  alt_ro      text not null,
  alt_en      text,
  aspect      text not null default '4/3',
  sort_order  int not null default 0
);

-- ── Servicii (secțiunea 01 din homepage) ──────────────────────────────────────

create table services (
  id                uuid primary key default gen_random_uuid(),
  key               text not null unique,   -- 'websites' | 'web_apps'
  level_label_ro    text not null,          -- 'Nivel 01'
  level_label_en    text,
  name_ro           text not null,          -- 'Site-uri'
  name_en           text,
  heading_ro        text not null,
  heading_en        text,
  body_ro           text not null,
  body_en           text,
  duration_ro       text,                   -- '1 – 3 săptămâni'
  duration_en       text,
  price_from        numeric(10,2),
  currency          text not null default 'EUR',
  layout            text not null default 'rows' check (layout in ('rows', 'cards')),
  sort_order        int not null default 0
);

create table service_items (
  id           uuid primary key default gen_random_uuid(),
  service_id   uuid not null references services (id) on delete cascade,
  label_ro     text not null,
  label_en     text,
  body_ro      text not null,
  body_en      text,
  sort_order   int not null default 0
);

-- ── Stack (secțiunea 02) ──────────────────────────────────────────────────────

create table stack_groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,        -- Frontend / Backend / Infra / AI
  items       text[] not null default '{}',
  sort_order  int not null default 0
);

-- ── Proces (secțiunea 03) ─────────────────────────────────────────────────────

create table process_steps (
  id          uuid primary key default gen_random_uuid(),
  title_ro    text not null,
  title_en    text,
  body_ro     text not null,
  body_en     text,
  sort_order  int not null default 0
);

-- ── Întrebări (secțiunea 06) ──────────────────────────────────────────────────

create table faqs (
  id            uuid primary key default gen_random_uuid(),
  question_ro   text not null,
  question_en   text,
  answer_ro     text not null,
  answer_en     text,
  sort_order    int not null default 0,
  published_at  timestamptz
);

-- ── Setări globale ────────────────────────────────────────────────────────────
-- O singură linie; key-value ar fi mai flexibil, dar un rând tipat e mai ușor de
-- editat într-un formular și de validat.

create table site_settings (
  id                    int primary key default 1 check (id = 1),
  contact_email         text not null,
  contact_phone         text,
  hours                 text,                -- '09:00 – 18:00 EET'
  response_time_ro      text,
  response_time_en      text,
  next_opening_ro       text,
  next_opening_en       text,
  concurrent_projects   text,                -- '2 – 3'
  nda_note_ro           text,
  nda_note_en           text,
  footer_line_ro        text,
  footer_line_en        text,
  copyright_year        int,
  meta_title_ro         text,
  meta_title_en         text,
  meta_description_ro   text,
  meta_description_en   text,
  og_image_path         text,
  updated_at            timestamptz not null default now()
);

-- ── Solicitări din formularul de contact ──────────────────────────────────────

create table leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  company       text,
  budget        text,
  message       text not null,
  lang          text not null default 'ro',
  page          text,
  referrer      text,
  utm           jsonb,
  status        text not null default 'nou'
                check (status in ('nou', 'in_discutie', 'castigat', 'refuzat')),
  notes         text,
  archived_at   timestamptz,
  created_at    timestamptz not null default now()
);

create index on leads (created_at desc);

-- ── Redirects (la schimbarea unui slug publicat) ───────────────────────────────

create table redirects (
  id          uuid primary key default gen_random_uuid(),
  from_path   text not null unique,
  to_path     text not null,
  status      int not null default 301,
  created_at  timestamptz not null default now()
);

-- ── RLS ───────────────────────────────────────────────────────────────────────
-- Citire publică doar pentru conținut publicat. Scriere doar pentru admini.
-- leads: inserare prin service role din server route (nu direct din browser).

alter table projects        enable row level security;
alter table project_facts   enable row level security;
alter table project_steps   enable row level security;
alter table project_stats   enable row level security;
alter table project_images  enable row level security;
alter table services        enable row level security;
alter table service_items   enable row level security;
alter table stack_groups    enable row level security;
alter table process_steps   enable row level security;
alter table faqs            enable row level security;
alter table site_settings   enable row level security;
alter table leads           enable row level security;
alter table redirects       enable row level security;
alter table app_users       enable row level security;

create policy public_read_projects on projects
  for select using (published_at is not null);

create policy admin_all_projects on projects
  for all using (is_admin()) with check (is_admin());

-- Copiile pentru tabelele-copil: citire publică dacă părintele e publicat.
create policy public_read_facts on project_facts for select using (
  exists (select 1 from projects p where p.id = project_id and p.published_at is not null));
create policy public_read_steps on project_steps for select using (
  exists (select 1 from projects p where p.id = project_id and p.published_at is not null));
create policy public_read_stats on project_stats for select using (
  exists (select 1 from projects p where p.id = project_id and p.published_at is not null));
create policy public_read_images on project_images for select using (
  exists (select 1 from projects p where p.id = project_id and p.published_at is not null));

create policy admin_all_facts  on project_facts  for all using (is_admin()) with check (is_admin());
create policy admin_all_steps  on project_steps  for all using (is_admin()) with check (is_admin());
create policy admin_all_stats  on project_stats  for all using (is_admin()) with check (is_admin());
create policy admin_all_images on project_images for all using (is_admin()) with check (is_admin());

create policy public_read_services   on services      for select using (true);
create policy public_read_items      on service_items for select using (true);
create policy public_read_stack      on stack_groups  for select using (true);
create policy public_read_process    on process_steps for select using (true);
create policy public_read_settings   on site_settings for select using (true);
create policy public_read_redirects  on redirects     for select using (true);
create policy public_read_faqs       on faqs          for select using (published_at is not null);

create policy admin_all_services  on services      for all using (is_admin()) with check (is_admin());
create policy admin_all_items     on service_items for all using (is_admin()) with check (is_admin());
create policy admin_all_stack     on stack_groups  for all using (is_admin()) with check (is_admin());
create policy admin_all_process   on process_steps for all using (is_admin()) with check (is_admin());
create policy admin_all_faqs      on faqs          for all using (is_admin()) with check (is_admin());
create policy admin_all_settings  on site_settings for all using (is_admin()) with check (is_admin());
create policy admin_all_redirects on redirects     for all using (is_admin()) with check (is_admin());
create policy admin_read_leads    on leads         for select using (is_admin());
create policy admin_write_leads   on leads         for update using (is_admin()) with check (is_admin());
create policy admin_read_users    on app_users     for select using (is_admin());
