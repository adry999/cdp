-- AS Factorum Install Solutions: STAR case study, from CASE_STUDY_BRIEF_asfactorum.md
-- in the project repo. Inserted as a draft (published_at stays null): it goes live from
-- the admin once screenshots are uploaded and the client name, live link, consent for
-- the portfolio photos and the displayed review are confirmed.
--
-- It is a brochure website, not an app, and the copy says so. It rebuilt what the
-- client needed now, after the previous developer's WordPress install became unusable;
-- a new website with the same client is planned next. Only what the code
-- proves. No figures: cost, gains, savings, stats and the card result (win_*) stay
-- empty until the client provides them; the quote stays empty until the client
-- confirms one. No "Client" fact and no links for the same reason.
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
  'asfactorum', 'asfactorum',
  'Am reconstruit site-ul unei firme de montaj industrial din Constanța, ca să fie rapid, sigur și ușor de găsit în Google',
  'We rebuilt the website of an industrial installation company in Constanta to be fast, secure and easy to find on Google',
  'AS Factorum: site de business industrial',
  'AS Factorum: industrial business website',
  'Site rapid și sigur pentru o firmă de montaj industrial din Constanța, care transformă vizitatorii în apeluri și mesaje.',
  'A fast, secure website for an industrial installation company in Constanta that turns visitors into calls and messages.',
  'Vechiul site WordPress ajunsese aproape de nefolosit, cu erori și fotografii pierdute. Am refăcut împreună designul și tot ce avea nevoie firma acum, fără parole de administrare, fără bază de date și fără pluginuri de reparat. Clientul își prezintă serviciile și portofoliul, iar vizitatorul sună sau scrie pe WhatsApp dintr-un singur clic.',
  'The old WordPress site had become almost unusable, with errors and lost photos. Together we rebuilt the design and everything the company needed now, with no admin logins, no database and no plugins to patch. The client shows services and portfolio, and the visitor calls or writes on WhatsApp in one click.',
  'Site de business', 'Business website',
  array['Site de business', 'Servicii industriale', 'SEO', 'Securitate', 'Mobil', '2026'],
  array['Business website', 'Industrial services', 'SEO', 'Security', 'Mobile-ready', '2026'],
  2026,
  array['Static website', 'Single-source contact data', 'SEO & structured data', 'Photo gallery', 'Secure hosting'],
  'website', false,
  'Pagina principală a site-ului AS Factorum, firmă de montaj industrial',
  'The homepage of the AS Factorum website, an industrial installation company',
  'Pagina principală a site-ului AS Factorum, firmă de montaj industrial',
  'The homepage of the AS Factorum website, an industrial installation company',

  $t$Firma execută montaj de structuri metalice, ventilație, conducte și utilaje industriale. Site-ul ei rula pe WordPress, lăsat de un dezvoltator anterior, cu multe pluginuri. În timp, proiectul ajunsese aproape de nefolosit: erori, fotografii pierdute, probleme cu baza de date și multe altele.

Auditul tehnic ne-a arătat și alte probleme. Pagina principală se afișa dintr-un cache vechi, cu tema implicită și un articol de probă, nu cu site-ul real. Lipseau descrierea pentru Google, previzualizarea la partajare și datele structurate. Multe imagini nu aveau text alternativ. Aceleași biblioteci de cod se încărcau de mai multe ori, în versiuni diferite, la fiecare vizită.

Clienții unei firme industriale aleg după încredere și referințe. Un site care arată ca un blog gol sau plin de erori strică prima impresie.$t$,
  $t$The company installs steel structures, ventilation, pipes and industrial machinery. Its website ran on WordPress, left behind by a previous developer, with many plugins. Over time the project had become almost unusable: errors, lost photos, database problems and more.

The technical audit showed other problems too. The homepage was served from a stale cache, with the default theme and a sample post instead of the real site. The description for Google, the share preview and the structured data were missing. Many images had no alternative text. The same code libraries loaded several times, in different versions, on every visit.

Clients of an industrial company choose on trust and references. A site that looks like an empty blog, or is full of errors, spoils the first impression.$t$,

  $t$Am început cu analiza site-ului existent: ce conținut aduce valoare, ce este de prisos și ce este riscant. Am auditat SEO-ul, performanța și securitatea și am pus pe masă o întrebare de business: are firma nevoie de WordPress?

Răspunsul a ieșit din analiză. Nu exista formular de contact. Serviciile erau scrise direct în șablon, deci orice schimbare cerea oricum un dezvoltator. Singurele lucruri editabile erau recenziile, galeriile și întrebările frecvente. Am decis împreună să renunțăm la WordPress și să mutăm totul pe un site static, ca să dispară sursa problemelor: codul de server, panoul de administrare și pluginurile.

Apoi am urmărit drumul vizitatorului: ajunge din Google, vede ce face firma, se uită la lucrări, citește o recenzie și sună sau scrie pe WhatsApp. Am mutat conținutul existent, adică servicii, fotografii de lucrări, recenzii, întrebări frecvente și texte juridice, păstrându-i structura.

Am luat câteva decizii simple. Nu am construit formular de contact, pentru că firma lucrează deja prin telefon, WhatsApp și e-mail. Datele de contact stau într-un singur loc și se actualizează pe tot site-ul odată, inclusiv în datele trimise către Google. SEO-ul de bază l-am scris direct în site, în loc de un plugin de întreținut. Traficul merge doar prin HTTPS, pe un singur domeniu.$t$,
  $t$We started by analysing the existing site: what content brings value, what is surplus and what is risky. We audited SEO, performance and security, and put a business question on the table: does the company need WordPress?

The answer came out of the analysis. There was no contact form. Services were written straight into the template, so any change needed a developer anyway. The only editable things were reviews, galleries and the FAQ. Together we decided to drop WordPress and move everything to a static site, so the source of the problems disappears: server-side code, the admin panel and plugins.

Then we followed the visitor's path: arrives from Google, sees what the company does, browses the work, reads a review, and calls or writes on WhatsApp. We moved the existing content, meaning services, project photos, reviews, FAQ and legal texts, keeping its structure.

We made a few simple decisions. We built no contact form, because the company already works by phone, WhatsApp and email. Contact details live in one place and update across the whole site at once, including the data sent to Google. We wrote the SEO basics straight into the site, instead of a plugin to maintain. Traffic runs over HTTPS only, on a single domain.$t$,

  $t$Firma are un site care nu mai depinde de pluginuri și de parole de administrare. Pagina principală este cea reală și, în Google și la partajare pe WhatsApp, firma apare cu numele și descrierea corecte.

Vizitatorul ajunge la un apel sau la un mesaj dintr-un singur clic. Datele de contact se schimbă într-un singur loc. Proprietarul nu mai are de actualizat un sistem pe care nu îl stăpânea.

Este un site de prezentare cu trei pagini, gândit să fie curat, rapid și greu de stricat. Și este o etapă: firma pregătește un site nou, la care lucrăm tot împreună.$t$,
  $t$The company has a site that no longer depends on plugins and admin passwords. The homepage is the real one and, on Google and when shared on WhatsApp, the company shows up with the right name and description.

Visitors reach a call or a message in one click. Contact details change in one place. The owner no longer has a system to keep up to date that they did not control.

It is a three-page brochure site, built to be clean, fast and hard to break. It is also a step: the company is preparing a new website, which we are building together as well.$t$,

  'Să găsim împreună cu clientul o soluție care să pună firma pe internet curat și credibil, astfel încât clienții industriali să o găsească în Google și să o contacteze imediat, fără ca proprietarul să mai administreze un sistem pe care nu îl stăpânește.',
  'To find, together with the client, a solution that puts the company online in a clean and credible way, so industrial clients find it on Google and contact it right away, without the owner having to run a system they do not control.',

  $j$[
    {"k": "Stabilitate", "v": "Pluginurile și codul de server lăsate de vechiul dezvoltator erau sursa problemelor; soluția trebuia să le elimine complet"},
    {"k": "Soluție pentru acum", "v": "Firma pregătea deja un site nou; până atunci avea nevoie de o prezență curată și stabilă, livrată repede"},
    {"k": "Proprietar fără pregătire tehnică", "v": "Nu poate actualiza un CMS; datele de contact se schimbă dintr-un singur loc"},
    {"k": "Conținut existent păstrat", "v": "Fotografiile de lucrări în trei galerii, recenziile, întrebările frecvente și textele juridice"},
    {"k": "Contact fără formular", "v": "Firma lucrează prin telefon, WhatsApp și e-mail, deci nu e nevoie de un sistem în spate"},
    {"k": "Găsibilitate locală", "v": "Firmă locală de servicii: descriere, previzualizare la partajare, date structurate, sitemap"}
  ]$j$::jsonb,
  $j$[
    {"k": "Stability", "v": "The plugins and server-side code left by the previous developer were the source of the problems; the solution had to remove them entirely"},
    {"k": "A solution for now", "v": "The company was already planning a new website; until then it needed a clean, stable presence, delivered fast"},
    {"k": "Non-technical owner", "v": "Cannot maintain a CMS; contact details change from a single place"},
    {"k": "Existing content preserved", "v": "Project photos in three galleries, reviews, FAQ and legal texts"},
    {"k": "Contact without a form", "v": "The company works by phone, WhatsApp and email, so no system behind the site is needed"},
    {"k": "Local findability", "v": "A local service company: description, share preview, structured data, sitemap"}
  ]$j$::jsonb,

  $j$[
    "Fără WordPress, dispar pluginurile, baza de date și parolele de administrare care au dus la erori și pierderi.",
    "Datele de contact stau într-un singur loc și se actualizează pe tot site-ul odată, inclusiv pentru Google.",
    "Vizitatorul sună sau scrie pe WhatsApp dintr-un singur clic, cum lucrează deja firma.",
    "Portofoliul rămâne vizual: trei galerii pe tipuri de lucrări, cu vizualizare mărită.",
    "Descrierea, previzualizarea la partajare și datele structurate ajută firma să apară corect în căutări."
  ]$j$::jsonb,
  $j$[
    "Without WordPress, the plugins, database and admin passwords behind the errors and losses are gone.",
    "Contact details live in one place and update across the whole site at once, including for Google.",
    "Visitors call or write on WhatsApp in one click, the way the company already works.",
    "The portfolio stays visual: three galleries by type of work, with an enlarged view.",
    "The description, share preview and structured data help the company appear correctly in search."
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
 where project_id = (select id from public.projects where slug_ro = 'asfactorum');

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Site de business (prezentare), static, migrat de pe WordPress', 'Business (brochure) website, static, migrated from WordPress', 0),
   ('Locație', 'Location', 'Constanța, România', 'Constanta, Romania', 1),
   ('Pagini', 'Pages', '3 pagini: principală, termeni și condiții, confidențialitate', '3 pages: home, terms and conditions, privacy', 2),
   ('Module', 'Modules', 'Servicii, portofoliu foto, recenzii, întrebări frecvente, contact', 'Services, photo portfolio, reviews, FAQ, contact', 3),
   ('Limbi', 'Languages', 'Engleză', 'English', 4)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'asfactorum';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'asfactorum');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Static website', 'Site fără server de aplicație, bază de date sau login; nimic de spart sau de actualizat lunar', 'A site with no application server, database or login; nothing to break or patch monthly', 0),
   ('Single-source contact data', 'Telefon, e-mail, WhatsApp și rețele sociale se schimbă într-un singur loc și se propagă peste tot, inclusiv în datele pentru Google', 'Phone, email, WhatsApp and social links change in one place and propagate everywhere, including the data for Google', 1),
   ('SEO & structured data', 'Descriere, previzualizări la partajare, date structurate și sitemap, ca Google să afișeze firma corect', 'Description, share previews, structured data and a sitemap, so Google presents the company correctly', 2),
   ('Photo gallery', 'Vizitatorul răsfoiește lucrările pe categorii, cu miniaturi și vizualizare mărită', 'Visitors browse the work by category, with thumbnails and an enlarged view', 3),
   ('Reviews & FAQ', 'Recenzii în carusel și întrebări frecvente în acordeon', 'Reviews in a carousel and frequently asked questions in an accordion', 4),
   ('Secure hosting', 'Trafic doar prin HTTPS, pe un singur domeniu', 'HTTPS-only traffic, on a single domain', 5)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'asfactorum';
