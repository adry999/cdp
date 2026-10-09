-- Mees 68 property finder: STAR case study, from CASE_STUDY_BRIEF_mees68.md in the
-- project repo. Inserted as a draft (published_at stays null): it goes live from
-- the admin once screenshots are uploaded and the client name, live link and
-- consent to show prices are confirmed.
--
-- Only what the code proves. No figures: cost, gains, savings, stats and the card
-- result (win_*) stay empty until the client provides them; the quote stays empty
-- until the client confirms one. No "Client" fact and no links for the same reason.
-- The 6-month maintenance paragraph is left out: not confirmed for this project.
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
  'mees-68', 'mees-68',
  'Un instrument interactiv de vânzare pentru o clădire rezidențială din Rotterdam, în care cumpărătorul alege apartamentul direct pe fațadă',
  'An interactive sales tool for a residential building in Rotterdam, where buyers choose their apartment straight from the facade',
  'Mees 68, hartă interactivă a clădirii',
  'Mees 68, interactive building map',
  'Hartă interactivă a clădirii prin care cumpărătorii aleg etajul, apartamentul și planul potrivit, cu disponibilitatea la vedere.',
  'An interactive building map that lets buyers pick a floor, an apartment and its floor plan, with availability always in view.',
  'Cumpărătorul vede clădirea, alege etajul, apoi apartamentul și planul lui. Prețul, suprafața, orientarea și statusul (disponibil, rezervat, vândut) apar într-un singur loc, fără PDF-uri și fără telefoane.',
  'Buyers see the building, pick a floor, then an apartment and its plan. Price, size, orientation and status (available, reserved, sold) sit in one place, with no PDFs and no phone calls needed.',
  'Aplicație web', 'Web app',
  array['Aplicație web', 'Imobiliare', 'Hartă interactivă', 'Planuri de apartament', '2026'],
  array['Web app', 'Real estate', 'Interactive map', 'Floor plans', '2026'],
  2026,
  array['Web app', 'Interactive building map', 'Floor plan library', 'Deep links', 'Accessible & responsive'],
  'web-app', false,
  'Fațada clădirii Mees 68 cu etajele evidențiate',
  'The Mees 68 facade with its floors highlighted',
  'Fațada clădirii Mees 68 cu etajele evidențiate',
  'The Mees 68 facade with its floors highlighted',

  $t$Vânzarea apartamentelor dintr-o clădire nouă pornește de obicei de la o broșură PDF, o listă de prețuri și un agent care răspunde la telefon. Cumpărătorul trebuie să lege singur trei lucruri: unde e apartamentul în clădire, cum arată planul lui și dacă mai e liber. În Mees 68 e și mai complicat: clădirea are adrese pe două străzi, iar apartamentele de pe același etaj diferă ca tip, suprafață, orientare și balcon.

Fiecare întrebare de tipul „ce mai e liber la etajul 3, cu balcon, spre sud?” costă timpul agentului, iar o listă de disponibilitate depășită duce la vizionări pentru apartamente deja rezervate.$t$,
  $t$Selling apartments in a new building usually starts with a PDF brochure, a price list and an agent answering the phone. The buyer has to connect three things alone: where the apartment sits in the building, what its plan looks like, and whether it is still available. Mees 68 adds complexity: the building has addresses on two streets, and apartments on the same floor differ in type, size, orientation and outdoor space.

Every "what's still free on floor 3, with a balcony, facing south?" costs agent time, and an outdated availability list leads to viewings for apartments already reserved.$t$,

  $t$Am pornit de la materialele de vânzare ale clientului: randarea clădirii, planul oficial al fiecărui apartament și lista cu tipuri, suprafețe și prețuri. Le-am transformat într-un singur model de date, în care fiecare apartament are etaj, poziție, tip, adresă, plan, suprafață, orientare, preț și status.

Apoi am construit aplicația urmând drumul cumpărătorului. Vede clădirea, trece cu mouse-ul peste un etaj și află câte apartamente sunt libere. Intră pe etaj, alege apartamentul, compară variantele de plan și vede toate detaliile într-un singur panou. Fiecare pas are un link propriu, ca agentul să poată trimite direct un apartament anume.$t$,
  $t$We started from the client's sales material: the building render, the official plan for every apartment, and the list of types, sizes and prices. We turned it into a single data model, where each apartment has a floor, position, type, address, plan, size, orientation, price and status.

We then built the app along the buyer's path. They see the building, hover a floor and learn how many homes are free. They open the floor, pick an apartment, compare plan variants and read every detail in one panel. Each step has its own link, so an agent can send a buyer straight to a specific apartment.$t$,

  $t$Cumpărătorul are acum toată informația într-un singur loc: unde e apartamentul, cum arată, cât costă și dacă mai e liber. Apartamentele rezervate și vândute rămân vizibile pe fațadă, iar agenții pot trimite printr-un link exact apartamentul potrivit.

Aceeași bază se poate adapta oricărui proiect rezidențial: altă clădire, alt număr de etaje și apartamente, alte tipuri de locuințe.$t$,
  $t$Buyers now have everything in one place: where the apartment is, what it looks like, what it costs and whether it's still free. Reserved and sold apartments stay visible on the facade, and agents can send a buyer exactly the right home with a link.

The same foundation adapts to any residential project: a different building, a different number of floors and apartments, different residence types.$t$,

  'Să găsim împreună cu clientul o soluție prin care cumpărătorul să găsească singur apartamentul potrivit, direct pe imaginea clădirii, astfel încât echipa de vânzări să primească cereri mai bine calificate.',
  'To work with the client on a way for buyers to find the right apartment on their own, straight from the building image, so the sales team receives better-qualified enquiries.',

  $j$[
    {"k": "Perspectivă reală", "v": "Fațada e o randare în perspectivă, cu acoperiș neregulat; zonele clicabile urmează cornișele exact"},
    {"k": "Două moduri de căutare", "v": "Pe etaje sau direct pe apartament, ambele ducând în același loc"},
    {"k": "Apartamente diferite", "v": "Colțuri, apartamente centrale și penthouse-uri, pe două adrese, cu planuri de 1–3 dormitoare"},
    {"k": "Utilizatori", "v": "Cumpărători fără pregătire tehnică, mulți pe telefon, inclusiv cu tastatura și cititoare de ecran"},
    {"k": "Date care se schimbă", "v": "Prețuri și statusuri separate de interfață, ca să poată fi actualizate pe parcursul vânzării"}
  ]$j$::jsonb,
  $j$[
    {"k": "Real perspective", "v": "The facade is a perspective render with an irregular roofline; clickable zones follow the cornices exactly"},
    {"k": "Two ways to search", "v": "By floor or straight by apartment, both leading to the same place"},
    {"k": "Different units", "v": "Corner, centre and penthouse homes on two addresses, with 1–3 bedroom plans"},
    {"k": "Users", "v": "Non-technical buyers, many on phones, including keyboard and screen-reader users"},
    {"k": "Changing data", "v": "Prices and statuses kept separate from the interface, so they can be updated during the sale"}
  ]$j$::jsonb,

  $j$[
    "Disponibilitatea apare înainte de clic, pe fiecare etaj, ca cumpărătorul să nu piardă timp cu etaje vândute.",
    "Două moduri de selecție, pe etaj și pe apartament, pentru cele două feluri în care oamenii caută o locuință.",
    "Apartamentele rezervate și vândute rămân vizibile, fiecare cu culoarea lui.",
    "Un sumar pe tipuri de locuințe, cu intervale de preț și suprafață, ca cumpărătorul să-și găsească bugetul din prima.",
    "Linkuri directe la etaj și apartament, pentru reclame, e-mail și mesajele trimise de agenți."
  ]$j$::jsonb,
  $j$[
    "Availability shows before the click, on every floor, so buyers don't waste time on sold-out floors.",
    "Two selection modes, by floor and by apartment, matching the two ways people look for a home.",
    "Reserved and sold apartments stay visible, each in its own colour.",
    "A summary by residence type, with price and size ranges, so buyers find their budget straight away.",
    "Direct links to floors and apartments, for ads, email and messages sent by agents."
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
 where project_id = (select id from public.projects where slug_ro = 'mees-68');

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Aplicație web pentru vânzări imobiliare', 'Real-estate sales web app', 0),
   ('Locație', 'Location', 'Rotterdam, Țările de Jos', 'Rotterdam, the Netherlands', 1),
   ('Clădire', 'Building', '4 etaje, 4 tipuri de locuințe', '4 floors, 4 residence types', 2),
   ('Planuri', 'Floor plans', '27 de planuri, variante cu 1–3 dormitoare', '27 plans, 1–3 bedroom variants', 3)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'mees-68';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'mees-68');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Web app', 'Aplicație web rapidă, fără instalare, pe orice dispozitiv', 'A fast web app, no install, on any device', 0),
   ('Interactive building map', 'Etajele și apartamentele devin zone clicabile direct pe randarea clădirii', 'Floors and apartments become clickable zones on the building render', 1),
   ('Floor plan library', 'Planul oficial al fiecărui apartament, cu variante de 1–3 dormitoare', 'The official plan for every apartment, with 1–3 bedroom variants', 2),
   ('Structured property data', 'Datele apartamentelor separate de interfață, pregătite pentru CMS sau API', 'Apartment data kept separate from the interface, ready for a CMS or API', 3),
   ('Deep links', 'Orice etaj sau apartament se deschide direct dintr-un link', 'Any floor or apartment opens straight from a link', 4),
   ('Accessible & responsive', 'Funcționează pe telefon, cu tastatura și cu cititoare de ecran', 'Works on phones, by keyboard and with screen readers', 5)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'mees-68';
