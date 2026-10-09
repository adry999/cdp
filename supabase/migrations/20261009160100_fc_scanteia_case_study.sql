-- FC Scanteia (Bacioi) club website: STAR case study, from CASE_STUDY_BRIEF_fc-scanteia.md
-- in the project repo. Inserted as a draft (published_at stays null): it goes live
-- from the admin once screenshots are uploaded and the client name, live link and
-- consent to show player names, photos and the contact phone are confirmed.
--
-- Only what the code proves. No figures: cost, gains, savings, stats and the card
-- result (win_*) stay empty until the client provides them; the quote stays empty
-- until the client confirms one. No "Client" fact and no links for the same reason.
-- Anything the brief marks [DE CONFIRMAT] or (dedus) is left out: how the club
-- communicated before, who updates the content, the reason content moved to files,
-- team, timeline and hosting. The 6-month maintenance paragraph is left out as well.
-- Idempotent: upserts on slug_ro and replaces the project's facts and stack.

insert into public.projects (
  slug_ro, slug_en, title_ro, title_en, card_title_ro, card_title_en,
  summary_ro, summary_en, lead_ro, lead_en, kind_ro, kind_en, tags_ro, tags_en,
  year, tech, service_tag, featured,
  cover_alt_ro, cover_alt_en, hero_alt_ro, hero_alt_en,
  context_body_ro, context_body_en, solution_body_ro, solution_body_en,
  result_body_ro, result_body_en,
  star_goal_ro, star_goal_en, star_constraints_ro, star_constraints_en,
  star_biz_ro, star_biz_en,
  screens_demo, sort_order, published_at
) values (
  'fc-scanteia', 'fc-scanteia',
  'Am construit site-ul clubului FC Scânteia din Băcioi, ca echipa, programul și amintirile ei să aibă un loc public, ușor de găsit',
  'We built the website of FC Scânteia from Băcioi, so the squad, fixtures and memories have a public home that is easy to find',
  'Site pentru clubul FC Scânteia',
  'Website for FC Scânteia',
  'Site de prezentare pentru un club de fotbal comunitar: echipa, programul meciurilor și galeria foto, pe o singură pagină.',
  'A one-page website for a community football club: squad, match schedule and photo gallery.',
  'Un site rapid, pe o singură pagină, în română, care spune povestea unei echipe crescute în comunitate și arată cine joacă și când.',
  'A fast, single-page site in Romanian that tells the story of a team raised by its community and shows who plays and when.',
  'Site de club sportiv', 'Sports club website',
  array['Site de club', 'Fotbal local', 'Program și rezultate', 'Galerie foto', 'Română'],
  array['Club website', 'Local football', 'Fixtures & results', 'Photo gallery', 'Romanian'],
  2026,
  array['Website', 'File-based content', 'SEO & social sharing', 'Image optimization', 'Responsive UI'],
  'website', false,
  'Pagina principală a site-ului FC Scânteia',
  'The FC Scânteia website home page',
  'Pagina principală a site-ului FC Scânteia',
  'The FC Scânteia website home page',

  $t$Un club local de fotbal trăiește din comunitate: suporteri, foști jucători, familii. Dar clubul nu avea un loc propriu online, în care cineva să afle repede cine joacă, când și unde.

Mai era ceva de păstrat: povestea echipei, cu jucători crescuți în sat și cu amintirea antrenorului care i-a format. Fără o pagină proprie, această poveste nu avea un loc stabil.$t$,
  $t$A local football club lives on its community: fans, former players, families. But the club had no home of its own online, where someone could quickly see who plays, when and where.

There was also a story to keep: players raised in the village and the memory of the coach who shaped them. Without a page of its own, that story had no stable place.$t$,

  $t$Am pornit de la o întrebare simplă: ce vrea să afle un suporter în primul minut? Cine e echipa, când se joacă, cum arată meciurile trecute și cum ia legătura cu clubul.

Din răspuns a ieșit o singură pagină, cu secțiuni în ordinea acestei întrebări. Am ales o pagină, nu un site cu multe pagini, pentru că vizitatorii caută mereu aceleași câteva lucruri. Am ales limba română, pentru că publicul este local. Povestea clubului are un loc al ei în pagină, nu e îngropată într-un colț.

Apoi am stabilit fluxul conținutului. Există trei tipuri de informație: jucători, meciuri și fotografii. Le-am ținut separate de aspectul paginii, în fișiere simple, ca un jucător nou sau un scor nou să se poată adăuga fără a atinge designul. Un jucător fără fotografie primește sigla clubului, ca lista să arate completă.

Prima versiune a avut și un panou de administrare. În august 2026 am trecut la un site complet static, cu conținutul în fișiere, fără bază de date și fără cont de administrare.$t$,
  $t$We started from a simple question: what does a supporter want to know in the first minute? Who the team is, when they play, what past matches looked like and how to reach the club.

The answer became one page, with sections in that order. We chose one page, not a multi-page site, because visitors keep looking for the same few things. We chose Romanian, because the audience is local. The club's story has its own place on the page instead of being tucked away.

Then we settled the content flow. There are three kinds of information: players, matches and photos. We kept them apart from the look of the page, in simple files, so a new player or a new score can be added without touching the design. A player without a photo gets the club logo, so the squad always looks complete.

The first version also had an admin panel. In August 2026 we moved to a fully static site, with content in files, no database and no admin login.$t$,

  $t$Clubul are acum o prezență online proprie: echipa, programul și galeria într-un singur loc, rapid pe telefon și ușor de găsit în căutări și la distribuirea pe rețele.

Site-ul este static, deci nu are server de aplicație sau bază de date de întreținut. Riscul de defecțiuni este mic, iar costul de funcționare rămâne redus.$t$,
  $t$The club now has its own online presence: squad, fixtures and gallery in one place, quick on mobile and easy to find in search and when shared on social networks.

The site is static, so there is no application server or database to maintain. The risk of outages is low and the running cost stays small.$t$,

  'Să găsim împreună cu clientul o formă simplă și curată prin care FC Scânteia să se prezinte online, astfel încât suporterii să afle rapid cine joacă și când.',
  'To work out, together with the club, a simple and clean way to present FC Scânteia online, so supporters quickly learn who plays and when.',

  $j$[
    {"k": "Conținut care se schimbă", "v": "Jucătorii, meciurile și fotografiile se schimbă des, așa că datele stau separat de aspectul paginii"},
    {"k": "Costuri de funcționare mici", "v": "Site static, fără server de aplicație și fără bază de date de plătit sau întreținut"},
    {"k": "Căutare și distribuire", "v": "Site-ul trebuie să apară corect în căutări și la distribuirea pe rețelele sociale"},
    {"k": "Telefon", "v": "Meniu, tabel și galerie adaptate pentru ecrane mici"},
    {"k": "Fotografii grele", "v": "Pozele jucătorilor trebuie să se încarce repede, fără ca clubul să le pregătească manual"}
  ]$j$::jsonb,
  $j$[
    {"k": "Changing content", "v": "Players, matches and photos change often, so the data sits apart from the look of the page"},
    {"k": "Low running cost", "v": "A static site, with no application server and no database to pay for or maintain"},
    {"k": "Search and sharing", "v": "The site must show up correctly in search and when shared on social networks"},
    {"k": "Phones", "v": "Menu, table and gallery adapted to small screens"},
    {"k": "Heavy photos", "v": "Player photos must load fast, without the club preparing them by hand"}
  ]$j$::jsonb,

  $j$[
    "Clubul are un loc public al lui, ușor de găsit, în loc de informații împrăștiate.",
    "Suporterii află din prima echipa, programul și rezultatele, fără să întrebe pe nimeni.",
    "Povestea și tradiția clubului au un loc stabil, care rămâne.",
    "Fără server și fără bază de date, site-ul costă puțin de ținut online și are puține de stricat.",
    "Conținutul stă în fișiere simple, ușor de actualizat fără a atinge designul."
  ]$j$::jsonb,
  $j$[
    "The club has a public home of its own, easy to find, instead of scattered information.",
    "Supporters see the squad, fixtures and results straight away, without asking anyone.",
    "The club's story and tradition have a stable place that stays.",
    "With no server and no database, the site is cheap to keep online and has little to break.",
    "Content lives in simple files, easy to update without touching the design."
  ]$j$::jsonb,

  false,
  (select coalesce(max(sort_order), -1) + 1 from public.projects),
  null
)
on conflict (slug_ro) do update set
  slug_en = excluded.slug_en, title_ro = excluded.title_ro, title_en = excluded.title_en,
  card_title_ro = excluded.card_title_ro, card_title_en = excluded.card_title_en,
  summary_ro = excluded.summary_ro, summary_en = excluded.summary_en,
  lead_ro = excluded.lead_ro, lead_en = excluded.lead_en,
  kind_ro = excluded.kind_ro, kind_en = excluded.kind_en,
  tags_ro = excluded.tags_ro, tags_en = excluded.tags_en,
  year = excluded.year, tech = excluded.tech, service_tag = excluded.service_tag,
  cover_alt_ro = excluded.cover_alt_ro, cover_alt_en = excluded.cover_alt_en,
  hero_alt_ro = excluded.hero_alt_ro, hero_alt_en = excluded.hero_alt_en,
  context_body_ro = excluded.context_body_ro, context_body_en = excluded.context_body_en,
  solution_body_ro = excluded.solution_body_ro, solution_body_en = excluded.solution_body_en,
  result_body_ro = excluded.result_body_ro, result_body_en = excluded.result_body_en,
  star_goal_ro = excluded.star_goal_ro, star_goal_en = excluded.star_goal_en,
  star_constraints_ro = excluded.star_constraints_ro, star_constraints_en = excluded.star_constraints_en,
  star_biz_ro = excluded.star_biz_ro, star_biz_en = excluded.star_biz_en;

delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'fc-scanteia');

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Site de club sportiv', 'Sports club website', 0),
   ('Locație', 'Location', 'Băcioi, Chișinău', 'Băcioi, Chișinău', 1),
   ('Secțiuni', 'Sections', 'Despre club, Echipa, Program și rezultate, Galerie foto, Contact', 'About, Squad, Fixtures & results, Photo gallery, Contact', 2),
   ('Limbă', 'Language', 'Română', 'Romanian', 3)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'fc-scanteia';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'fc-scanteia');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Website', 'Pagină generată în prealabil și servită rapid, fără server de aplicație', 'A pre-built page served fast, with no application server', 0),
   ('File-based content', 'Echipa, meciurile și galeria vin din fișiere de date simple, ușor de editat', 'Squad, matches and gallery come from simple data files that are easy to edit', 1),
   ('SEO & social sharing', 'Site-ul apare corect în căutări și la distribuirea pe rețele', 'The site shows up correctly in search and when shared on social networks', 2),
   ('Image optimization', 'Fotografiile se încarcă rapid, în formate moderne', 'Photos load fast, in modern formats', 3),
   ('Responsive UI', 'Funcționează pe telefon, tabletă și desktop, cu fotografii care se deschid mari', 'Works on phone, tablet and desktop, with photos that open full size', 4)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'fc-scanteia';
