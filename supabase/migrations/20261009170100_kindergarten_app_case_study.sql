-- Kindergarten app: STAR case study, from CASE_STUDY_BRIEF_Kindergarten_app.md
-- in the project repo. A modular web SaaS platform with login, for several
-- kindergartens with isolated data. "Kindergarten app" is the product name; no
-- competitor is named anywhere in the copy. Inserted as a draft
-- (published_at stays null): it goes live from the admin only after
--   - the client name and consent to be named are confirmed (the code holds only a
--     placeholder, so no client name, no "Client" fact and no links here),
--   - screenshots are uploaded, made ONLY on demo data (the project repo and its
--     connected database hold real children's data: never use it in images or text),
--   - the launch date is known and the maintenance period is confirmed as running.
--
-- Only what the code proves. No figures: cost, gains, savings, stats and the card
-- result (win_*) stay empty until the client provides them; the quote stays empty.
-- Left out on purpose:
--   - the product's internal code name (avoids confusion with another Codepedia project),
--   - the client's city and country (a placeholder in the code), currency, duration,
--     team, hosting and any URL (all unconfirmed),
--   - how the client worked before the platform (unconfirmed), and any time or error
--     figures,
--   - payroll ("coming soon" in the app) and invoice creation (not in the app yet),
--   - GDPR export and anonymisation as a button: it exists in the backend only, so the
--     copy says "built in", never "available in the interface",
--   - the kindergarten selector (hidden in the interface) and per-kindergarten module
--     switching (not proven): modularity is claimed per person only (swimming pool),
--     multi-kindergarten as isolated data plus a super admin who creates and suspends
--     kindergartens.
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
  'kindergarten-app', 'kindergarten-app',
  'Kindergarten app: o platformă modulară cu autentificare pentru mai multe grădinițe, care unește evidența copiilor, a personalului și a banilor, cu acces separat pe roluri',
  'Kindergarten app: a modular platform with login for several kindergartens, bringing child records, staff and finances together, with access separated by role',
  'Kindergarten app, administrare modulară pentru grădinițe',
  'Kindergarten app, modular kindergarten management',
  'O platformă web modulară, cu autentificare pe roluri, în care fiecare grădiniță își ține copiii, grupele, personalul, prezența și finanțele într-un singur loc, cu datele separate de ale celorlalte.',
  'A modular web platform with role-based login, where each kindergarten keeps its children, groups, staff, attendance and finances in one place, with its data kept apart from the others.',
  'Fiecare persoană vede doar ce îi revine: conducerea are imaginea completă, educatorul vede grupa lui. Datele copiilor sunt protejate la nivelul bazei de date, nu doar în interfață.',
  'Everyone sees only what is theirs: management gets the full picture, educators see their own group. Children''s data is protected at the database level, not just in the interface.',
  'Platformă SaaS · Aplicație web de administrare', 'SaaS platform · Web admin application',
  array['Aplicație web', 'Grădinițe', 'Roluri și permisiuni', 'Date GDPR', 'RO / EN'],
  array['Web app', 'Kindergartens', 'Roles & permissions', 'GDPR data', 'RO / EN'],
  2026,
  array['Web app', 'Cloud database', 'Role-based access', 'Multi-tenant isolation', 'Audit log', 'GDPR tooling'],
  'web-app', false,
  'Panoul de administrare Kindergarten app',
  'The Kindergarten app admin dashboard',
  'Panoul de administrare Kindergarten app',
  'The Kindergarten app admin dashboard',

  $t$O grădiniță lucrează zilnic cu informații care trebuie să ajungă la oamenii potriviți: datele de identitate ale copiilor, alergiile și notele medicale, părinții de contact, contractele, repartizarea pe grupe, plățile și cheltuielile. Fiecare dintre aceste informații are alt public. Educatorul trebuie să știe imediat dacă un copil are o alergie, conducerea trebuie să vadă imaginea de ansamblu, iar anumite date nu au ce căuta la toată lumea.

Datele copiilor sunt sensibile și intră sub incidența GDPR. Când informațiile nu au un loc comun și reguli clare de acces, crește riscul ca o informație importantă să nu ajungă la cine are nevoie de ea, sau să ajungă la cine nu trebuie.$t$,
  $t$A kindergarten works every day with information that has to reach the right people: children's identity details, allergies and medical notes, parent contacts, contracts, group assignments, payments and expenses. Each of these has a different audience. An educator needs to know at once if a child has an allergy, management needs the overall picture, and some data has no business being seen by everyone.

Children's data is sensitive and falls under GDPR. When information has no shared home and no clear access rules, the risk grows that an important detail does not reach the person who needs it, or reaches someone who should not see it.$t$,

  $t$Am început cu analiza: cine lucrează în grădiniță, ce date atinge fiecare și ce nu are voie să vadă. Din asta au ieșit un document de cerințe și un model de roluri cu trei trepte, super-administrator, administrator și educator, cu reguli scrise o singură dată și aplicate atât în interfață, cât și în baza de date. Împreună cu clientul am stabilit ce e esențial pentru prima versiune (copii, grupe, personal, setări) și ce vine după (prezență, finanțe, bazin), apoi am adus în sistem datele existente ale grădiniței și le-am curățat.

Apoi am construit urmând ziua de lucru. Administratorul vede pe panou câți copii sunt înscriși, grupele active și ultimele modificări. Educatorul marchează prezența grupei: prezent, absent, motivat, bolnav. Pe fișa copilului găsește imediat alergiile și notele medicale, plus părinții de contact. Antrenorul de înot își setează disponibilitatea, iar programul ședințelor la bazin se generează din tipare recurente. Conducerea înregistrează plăți, aprobă sau respinge cheltuieli, cu motiv, și vede totalurile.

Accesul îl hotărăște baza de date, nu doar interfața. Nu există înregistrare publică: personalul intră doar prin invitație, iar un administrator poate invita doar educatori, doar în grădinița lui. Platforma e modulară: bazinul, de exemplu, e un modul care se acordă individual, per persoană, nu pe tot rolul. Mai multe grădinițe pot folosi aceeași platformă, fiecare cu propriii utilizatori, iar datele fiecăreia sunt izolate de ale celorlalte; super-administratorul creează, configurează și poate suspenda grădinițe. Fiecare modificare rămâne în jurnal, cu autor și oră, iar nimic nu se șterge definitiv: copiii trec prin statusuri (înscris, retras, absolvent). Pentru cererile GDPR, exportul datelor unui copil și anonimizarea reală sunt pregătite în sistem.

Câteva decizii simple au ghidat restul: data nașterii e câmpul central, iar vârsta se calculează, ca să nu se învechească niciodată; codul personal al copilului este opțional, ca să nu blocheze o înscriere.$t$,
  $t$We started with analysis: who works in the kindergarten, what data each person touches and what they must not see. That produced a requirements document and a three-tier role model, super admin, admin and educator, with rules written once and enforced both in the interface and in the database. Together with the client we decided what was essential for the first version (children, groups, staff, settings) and what came next (attendance, finances, swimming pool), then brought the kindergarten's existing data into the system and cleaned it.

Then we built along the working day. The admin sees on the dashboard how many children are enrolled, the active groups and the latest changes. The educator marks the group's attendance: present, absent, excused, sick. On a child's profile they immediately see allergies and medical notes, plus parent contacts. The swimming coach sets their availability, and pool sessions are generated from recurring patterns. Management records payments, approves or rejects expenses, with a reason, and sees the totals.

Access is decided by the database, not just the interface. There is no public sign-up: staff join only by invitation, and an admin can only invite educators, only into their own kindergarten. The platform is modular: the swimming pool, for example, is a module granted individually, per person, not to a whole role. Several kindergartens can use the same platform, each with its own users, and each one's data is isolated from the others; the super admin creates, configures and can suspend kindergartens. Every change stays in a log, with an author and a time, and nothing is hard-deleted: children move through statuses (enrolled, withdrawn, graduated). For GDPR requests, exporting a child's data and real anonymisation are built into the system.

A few simple decisions guided the rest: birth date is the key field, and age is calculated so it never goes stale; a child's personal ID is optional, so it never blocks an enrolment.$t$,

  $t$Clientul are un singur loc pentru evidența grădiniței: copii, grupe, personal, prezență, plăți și cheltuieli. Conducerea vede pe panou câți copii sunt înscriși, grupele active și ce s-a modificat recent. Educatorul găsește alergiile unui copil direct pe fișa lui și vede doar grupa lui.

Fiecare modificare are autor și oră, iar datele copiilor sunt protejate la nivelul bazei de date, cu export și anonimizare pregătite pentru cererile GDPR. Cheltuielile trec printr-un flux de aprobare, cu motiv la respingere.

După lansare, Codepedia oferă 6 luni de mentenanță: reparăm erorile și ne ocupăm de situațiile neprevăzute.$t$,
  $t$The client has one place for the kindergarten's records: children, groups, staff, attendance, payments and expenses. Management sees on the dashboard how many children are enrolled, the active groups and what changed recently. Educators find a child's allergies right on the child's profile and see only their own group.

Every change has an author and a time, and children's data is protected at the database level, with export and anonymisation built in for GDPR requests. Expenses go through an approval flow, with a reason when one is rejected.

After launch, Codepedia provides 6 months of maintenance: we fix bugs and handle the unexpected situations.$t$,

  'Să găsim împreună cu clientul o soluție care adună toate datele grădiniței într-un singur sistem sigur, astfel încât fiecare om din echipă să lucreze rapid cu exact informațiile de care are nevoie.',
  'To work out, together with the client, a solution that brings all the kindergarten''s data into one secure system, so each person on the team can work quickly with exactly the information they need.',

  $j$[
    {"k": "Date sensibile ale copiilor", "v": "Date medicale și de identitate ale minorilor, protejate conform GDPR: acces strict, istoric al modificărilor și anonimizare reală la cerere"},
    {"k": "Roluri diferite", "v": "Conducerea vede tot, educatorul doar grupa lui; unele module, precum bazinul, se acordă individual, per persoană"},
    {"k": "Utilizatori non-tehnici", "v": "Educatori care folosesc aplicația în timpul zilei de lucru; fără conturi create singuri, totul pornește dintr-o invitație"},
    {"k": "Date existente de adus în sistem", "v": "Evidențele existente ale grădiniței trebuiau aduse în sistem și curățate"},
    {"k": "Pregătit pentru mai multe grădinițe", "v": "Datele fiecărei grădinițe sunt izolate de la început, ca platforma să poată primi și alte grădinițe"}
  ]$j$::jsonb,
  $j$[
    {"k": "Sensitive child data", "v": "Medical and identity data of minors, protected under GDPR: strict access, a change history and real anonymisation on request"},
    {"k": "Different roles", "v": "Management sees everything, educators only their group; some modules, such as the swimming pool, are granted individually, per person"},
    {"k": "Non-technical users", "v": "Educators using the app during the working day; no self sign-up, everything starts from an invitation"},
    {"k": "Existing data to bring in", "v": "The kindergarten's existing records had to be brought into the system and cleaned"},
    {"k": "Ready for multiple kindergartens", "v": "Each kindergarten's data is isolated from day one, so the platform can take on more kindergartens"}
  ]$j$::jsonb,

  $j$[
    "Un singur loc pentru copii, grupe, personal, prezență, plăți și cheltuieli, în locul unor evidențe separate.",
    "Fiecare vede doar ce îi revine: conducerea are imaginea completă, educatorul vede grupa lui.",
    "Alergiile și notele medicale ajung direct pe fișa copilului, la îndemâna educatorului.",
    "Fiecare modificare rămâne în jurnal, cu autor și oră, iar nimic nu se șterge definitiv.",
    "Cheltuielile trec printr-un flux de aprobare, cu motiv la respingere, iar totalurile sunt la vedere."
  ]$j$::jsonb,
  $j$[
    "One place for children, groups, staff, attendance, payments and expenses, instead of separate records.",
    "Everyone sees only what is theirs: management gets the full picture, educators see their own group.",
    "Allergies and medical notes land right on the child's profile, within the educator's reach.",
    "Every change stays in a log, with an author and a time, and nothing is hard-deleted.",
    "Expenses go through an approval flow, with a reason when rejected, and the totals are in plain view."
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
 where project_id = (select id from public.projects where slug_ro = 'kindergarten-app');

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Platformă SaaS, panou de administrare', 'SaaS platform, admin panel', 0),
   ('Module', 'Modules', 'Copii, grupe, personal, prezență, bazin, facturi, plăți, cheltuieli', 'Children, groups, staff, attendance, swimming pool, invoices, payments, expenses', 1),
   ('Roluri', 'Roles', '3 roluri: super-administrator, administrator, educator', '3 roles: super admin, admin, educator', 2),
   ('Limbi', 'Languages', 'Română, engleză', 'Romanian, English', 3)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'kindergarten-app';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'kindergarten-app');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Web app', 'Aplicație web rapidă, fără instalare, folosibilă de pe calculator și telefon', 'A fast web app, no install, usable on desktop and phone', 0),
   ('Cloud database', 'Bază de date în cloud cu regulile de acces scrise direct în ea', 'A cloud database with the access rules written directly into it', 1),
   ('Role-based access', 'Fiecare rol vede și modifică doar ce îi este permis, verificat atât în interfață, cât și în baza de date', 'Each role sees and changes only what it is allowed, checked both in the interface and in the database', 2),
   ('Multi-tenant isolation', 'Datele fiecărei grădinițe sunt izolate; platforma poate primi grădinițe noi', 'Each kindergarten''s data is isolated; the platform can take on new kindergartens', 3),
   ('Audit log', 'Fiecare modificare rămâne în jurnal, cu autor și oră', 'Every change stays in a log, with an author and a time', 4),
   ('GDPR tooling', 'Export al datelor unui copil și anonimizare reală la cerere, pregătite în sistem', 'Export of a child''s data and real anonymisation on request, built into the system', 5),
   ('Bilingual interface', 'Interfața poate fi comutată între română și engleză', 'The interface can be switched between Romanian and English', 6)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'kindergarten-app';
