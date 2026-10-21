-- AS Factorum Install Solutions, second stage: the new bilingual website, from the
-- portfolio package (studiu-de-caz/AS Factorum Studiu de caz.dc.html, continut.json).
-- A separate project from `asfactorum` (the static rebuild after WordPress), told as
-- the upgrade that came after it. Inserted as a draft (published_at stays null): it
-- goes live from the admin once the open points in IMAGINI-SI-DE-CONFIRMAT.md are
-- settled, above all public use of the photos in the screenshots and the original logo.
--
-- Status is honest: the design is finished, the Nuxt 4 build follows. Counts come from
-- the package (7 page types, 29 components, 4 email templates, 4 services, 10 projects,
-- 64 photos, 7 blog categories). No impact figures: the site is not live yet, so cost,
-- gains, stats and the card result (win_*) stay empty. No quote, no "Client" fact and
-- no live link until the client confirms them. The 50+ projects / 150+ clients figures
-- from the client's current site are left out (unconfirmed).
-- Images (1600x900 PNG from studiu-de-caz/imagini/) must be uploaded to
-- project-media/asfactorum-site-nou/ before this runs; the paths below point there.
-- Idempotent: upserts on slug_ro and replaces the project's facts and stack.

insert into public.projects (
  slug_ro, slug_en, title_ro, title_en, card_title_ro, card_title_en,
  summary_ro, summary_en, lead_ro, lead_en, kind_ro, kind_en, tags_ro, tags_en,
  year, tech, service_tag, nav_services, featured,
  cover_alt_ro, cover_alt_en, hero_alt_ro, hero_alt_en,
  context_body_ro, context_body_en, solution_body_ro, solution_body_en,
  result_body_ro, result_body_en,
  star_goal_ro, star_goal_en, star_constraints_ro, star_constraints_en,
  star_biz_ro, star_biz_en,
  screens_demo, sort_order, published_at
) values (
  'asfactorum-site-nou', 'asfactorum-new-website',
  'După site-ul de urgență, am proiectat pentru AS Factorum un site bilingv care aduce cereri de ofertă',
  'After the emergency rebuild, we designed a bilingual website for AS Factorum that brings in quote requests',
  'AS Factorum: site nou, bilingv',
  'AS Factorum: new bilingual website',
  'Etapa a doua pentru o firmă de montaj industrial: site în română și engleză, cu SEO local, portofoliu, blog și cerere de ofertă pe fiecare pagină.',
  'Stage two for an industrial installation company: a Romanian and English website with local SEO, portfolio, blog and a quote request on every page.',
  'Site-ul static pe care l-am livrat după WordPress a oprit erorile, dar era doar o pagină de prezentare. Firma avea nevoie de mai mult: să fie găsită în Google pentru fiecare serviciu, cu locațiile corecte din România, să-și arate lucrările, să publice articole și să transforme vizitele în cereri de ofertă. Am proiectat împreună site-ul nou, în română și engleză.',
  'The static site we delivered after WordPress stopped the errors, but it was only a brochure page. The company needed more: to be found on Google for each service, with its correct locations in Romania, to show its work, to publish articles and to turn visits into quote requests. Together we designed the new website, in Romanian and English.',
  'Site de business', 'Business website',
  array['Site de business', 'Servicii industriale', 'SEO local', 'Bilingv', 'Blog', '2026'],
  array['Business website', 'Industrial services', 'Local SEO', 'Bilingual', 'Blog', '2026'],
  2026,
  array['Bilingual website', 'Local SEO', 'Quote request form', 'Filterable portfolio', 'Blog', 'Automated emails'],
  'website', array['website'], false,
  'Pagina Acasă a noului site AS Factorum: hero cu fotografie, butoane de ofertă și cele 4 servicii',
  'The home page of the new AS Factorum website: photo hero, quote buttons and the 4 services',
  'Pagina Acasă a noului site AS Factorum: hero cu fotografie, butoane de ofertă și cele 4 servicii',
  'The home page of the new AS Factorum website: photo hero, quote buttons and the 4 services',

  $t$AS Factorum face confecții și montaj de structuri metalice, sisteme HVAC și de ventilație, instalare și relocare de utilaje și servicii tehnice industriale, cu proiecte în România, Franța și Irlanda. Clienții sunt firme din construcții și industrie care caută o echipă de montaj.

Prima etapă a fost de urgență: vechiul site WordPress ajunsese aproape de nefolosit, așa că l-am înlocuit cu un site static, curat și stabil. Problema tehnică s-a rezolvat, dar site-ul rămăsese o pagină de prezentare, doar în engleză.

Pentru creștere, firma avea nevoie de mai mult. Fiecare serviciu trebuia să aibă pagina lui, ca firma să apară în Google pentru ce face. Locațiile reale din România, sediul din Botoșani și baza de operare din Constanța, trebuiau afișate corect. Lucrările trebuiau arătate pe categorii, cu fotografii. Un blog tehnic trebuia să aducă vizitatori și încredere. Iar vizita trebuia să se încheie cu o cerere de ofertă, nu doar cu un număr de telefon.$t$,
  $t$AS Factorum fabricates and installs steel structures, installs HVAC and ventilation systems, installs and relocates machinery and provides industrial technical services, with projects in Romania, France and Ireland. Its clients are construction and industrial companies looking for an installation crew.

The first stage was an emergency: the old WordPress site had become almost unusable, so we replaced it with a clean, stable static site. The technical problem was solved, but the site was still a brochure page, in English only.

To grow, the company needed more. Each service needed its own page, so the company shows up on Google for what it does. The real locations in Romania, the registered office in Botoșani and the operating base in Constanța, had to be shown correctly. The work had to be shown by category, with photos. A technical blog had to bring in visitors and trust. And a visit had to end in a quote request, not just a phone number.$t$,

  $t$Am pornit de la drumul vizitatorului: ajunge din Google pe pagina unui serviciu, vede ce include, se uită la lucrările din domeniu și cere o ofertă. Tot site-ul e construit în jurul acestui drum.

„Cere o ofertă” este butonul principal pe fiecare pagină, iar telefonul și WhatsApp rămân mereu vizibile. Formularul cere doar numele și e-mailul, restul e opțional, iar serviciul vine deja selectat din pagina de unde a plecat vizitatorul. Fiecare cerere ajunge la echipă ca notificare pe e-mail, cu butoane pentru răspuns și apel, iar clientul primește o confirmare în limba în care a scris.

Fiecare dintre cele 4 servicii are pagina lui, cu lista „Ce include”, proiectele din domeniu cu oraș și țară, galeria proprie și întrebări frecvente. Portofoliul are 10 proiecte și o galerie de 64 de fotografii, filtrabilă pe tip de lucrare. Filtrul rămâne în adresă, deci o selecție se poate trimite ca link. Blogul are articole tehnice pe 7 categorii, cu autor, dată și invitație la ofertă.

Româna și engleza sunt egale: adrese traduse, comutator care păstrează pagina curentă, iar motoarele de căutare știu că româna e versiunea implicită. Pagina Despre noi arată birourile din Botoșani și Constanța, recenziile și întrebările frecvente. Am adăugat paginile legale și un banner de cookie-uri care încarcă analiza traficului doar după acord.

Totul stă într-un design system: culori, tipografie, spațiere și mișcare definite o singură dată, din care se construiesc toate cele 29 de componente. Am verificat designul pe desktop și pe telefon, până la 390px.$t$,
  $t$We started from the visitor's path: they arrive from Google on a service page, see what it includes, look at the work in that field and request a quote. The whole site is built around that path.

"Request a quote" is the main button on every page, and phone and WhatsApp stay visible at all times. The form asks only for name and email, the rest is optional, and the service comes preselected from the page the visitor came from. Every request reaches the team as an email notification with reply and call buttons, and the client gets a confirmation in the language they wrote in.

Each of the 4 services has its own page, with a "What's included" list, the projects in that field with city and country, its own gallery and FAQ. The portfolio has 10 projects and a 64-photo gallery filtered by type of work. The filter stays in the URL, so a selection can be sent as a link. The blog has technical articles in 7 categories, with author, date and a quote call-to-action.

Romanian and English are equal: translated URLs, a language switch that keeps the current page, and search engines know Romanian is the default version. The About page shows the Botoșani and Constanța offices, reviews and FAQ. We added the legal pages and a cookie banner that loads traffic analytics only after consent.

Everything lives in a design system: colour, typography, spacing and motion defined once, from which all 29 components are built. We checked the design on desktop and on phones, down to 390px.$t$,

  $t$Firma are designul complet al unui site care lucrează pentru vânzări, nu doar pentru prezentare: 7 tipuri de pagină, în română și engleză, pe desktop și mobil, un design system cu 29 de componente și 4 șabloane de e-mail automat.

Fiecare serviciu are o pagină pe care Google o poate găsi, locațiile din România apar corect, lucrările se văd pe categorii, iar blogul are loc să crească. Fiecare pagină duce spre o cerere de ofertă.

Designul e finalizat și predat pentru dezvoltare. Urmează implementarea, la care lucrăm tot împreună, plus alegerea serviciului de e-mail, a platformei de newsletter și a instrumentului de analiză.$t$,
  $t$The company has the complete design of a website that works for sales, not just for show: 7 page types, in Romanian and English, on desktop and mobile, a design system with 29 components and 4 automated email templates.

Every service has a page Google can find, the Romanian locations show up correctly, the work is shown by category, and the blog has room to grow. Every page leads to a quote request.

The design is finished and handed over for development. The build comes next, which we are doing together as well, along with choosing the email service, newsletter platform and analytics tool.$t$,

  'Să ducem împreună cu clientul site-ul de la o pagină de prezentare stabilă la un instrument de vânzare: firma să fie găsită în Google pentru fiecare serviciu și locație din România, să-și arate lucrările și expertiza, iar vizitatorul să ajungă ușor la o cerere de ofertă, în română sau engleză.',
  'To take the site, together with the client, from a stable brochure page to a sales tool: the company found on Google for each service and location in Romania, showing its work and expertise, with visitors reaching a quote request easily, in Romanian or English.',

  $j$[
    {"k": "Pornim de la ce există", "v": "Site-ul static din prima etapă și conținutul lui (servicii, fotografii, recenzii, întrebări frecvente) sunt baza, nu se aruncă"},
    {"k": "Două limbi egale", "v": "O parte din clienți nu vorbesc română; fiecare pagină are versiune în engleză, cu adrese traduse"},
    {"k": "Locații corecte", "v": "Sediul din Botoșani și baza de operare din Constanța trebuie să apară la fel pe site și în datele pentru Google"},
    {"k": "Conversie", "v": "Un singur apel la acțiune pe toate paginile; formular scurt, cu doar numele și e-mailul obligatorii"},
    {"k": "Fără conturi", "v": "Site-ul nu are login sau panou de administrare pentru vizitatori; cererile ajung pe e-mail"},
    {"k": "Confidențialitate", "v": "Pagini legale în ambele limbi; analiza traficului pornește doar după acordul pentru cookie-uri"}
  ]$j$::jsonb,
  $j$[
    {"k": "Build on what exists", "v": "The stage-one static site and its content (services, photos, reviews, FAQ) are the base, not thrown away"},
    {"k": "Two equal languages", "v": "Some clients do not speak Romanian; every page has an English version with translated URLs"},
    {"k": "Correct locations", "v": "The Botoșani office and the Constanța operating base must appear the same on the site and in the data for Google"},
    {"k": "Conversion", "v": "One call to action on every page; a short form with only name and email required"},
    {"k": "No accounts", "v": "The site has no login or admin panel for visitors; requests arrive by email"},
    {"k": "Privacy", "v": "Legal pages in both languages; traffic analytics start only after cookie consent"}
  ]$j$::jsonb,

  $j$[
    "Fiecare serviciu are pagina lui, ca firma să fie găsită în Google pentru ce face.",
    "Locațiile din Botoșani și Constanța apar corect pe site și în căutări.",
    "„Cere o ofertă” pe fiecare pagină, cu serviciul deja selectat, plus telefon și WhatsApp.",
    "Portofoliul pe tipuri de lucrare și blogul tehnic construiesc încredere înainte de primul apel.",
    "Clienții străini citesc totul în engleză, cu aceleași pagini ca în română."
  ]$j$::jsonb,
  $j$[
    "Each service has its own page, so the company is found on Google for what it does.",
    "The Botoșani and Constanța locations show up correctly on the site and in search.",
    "\"Request a quote\" on every page, with the service preselected, plus phone and WhatsApp.",
    "The portfolio by type of work and the technical blog build trust before the first call.",
    "Foreign clients read everything in English, with the same pages as in Romanian."
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
  nav_services = excluded.nav_services,
  cover_alt_ro = excluded.cover_alt_ro, cover_alt_en = excluded.cover_alt_en,
  hero_alt_ro = excluded.hero_alt_ro, hero_alt_en = excluded.hero_alt_en,
  context_body_ro = excluded.context_body_ro, context_body_en = excluded.context_body_en,
  solution_body_ro = excluded.solution_body_ro, solution_body_en = excluded.solution_body_en,
  result_body_ro = excluded.result_body_ro, result_body_en = excluded.result_body_en,
  star_goal_ro = excluded.star_goal_ro, star_goal_en = excluded.star_goal_en,
  star_constraints_ro = excluded.star_constraints_ro, star_constraints_en = excluded.star_constraints_en,
  star_biz_ro = excluded.star_biz_ro, star_biz_en = excluded.star_biz_en;

delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'asfactorum-site-nou');

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Site de business bilingv, etapa a doua după site-ul static', 'Bilingual business website, stage two after the static site', 0),
   ('Locații', 'Locations', 'Botoșani și Constanța, România; proiecte în România, Franța și Irlanda', 'Botoșani and Constanța, Romania; projects in Romania, France and Ireland', 1),
   ('Pagini', 'Pages', '7 tipuri: Acasă, Servicii, serviciu, Portofoliu, Despre noi, Blog și articol, Contact, plus paginile legale', '7 types: Home, Services, service, Portfolio, About, Blog and article, Contact, plus the legal pages', 2),
   ('Livrabile', 'Deliverables', 'Design pe desktop și mobil, design system cu 29 de componente, 4 șabloane de e-mail, pachet pentru dezvoltare', 'Desktop and mobile design, a 29-component design system, 4 email templates, a developer handoff package', 3),
   ('Limbi', 'Languages', 'Română și engleză', 'Romanian and English', 4),
   ('Stare', 'Status', 'Design finalizat; implementarea urmează', 'Design complete; build to follow', 5)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'asfactorum-site-nou';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'asfactorum-site-nou');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Bilingual website', 'Română fără prefix, engleză sub /en/, cu adrese traduse și comutator care păstrează pagina', 'Romanian with no prefix, English under /en/, with translated URLs and a switch that keeps the page', 0),
   ('Local SEO', 'O pagină pentru fiecare serviciu, locațiile din Botoșani și Constanța, date structurate pentru Google', 'A page per service, the Botoșani and Constanța locations, structured data for Google', 1),
   ('Quote request form', 'Doar numele și e-mailul obligatorii, serviciul preselectat, erori clare sub câmp', 'Only name and email required, the service preselected, clear errors under each field', 2),
   ('Filterable portfolio', '10 proiecte și 64 de fotografii pe tipuri de lucrare, cu filtrul în adresă și vizualizare mărită', '10 projects and 64 photos by type of work, with the filter in the URL and an enlarged view', 3),
   ('Blog', 'Articole tehnice pe 7 categorii, publicate doar în limbile în care există', 'Technical articles in 7 categories, shown only in the languages they exist in', 4),
   ('Automated emails', 'Confirmare pentru client, notificare internă, follow-up la ofertă și newsletter', 'Client confirmation, internal notification, quote follow-up and newsletter', 5),
   ('Cookie consent', 'Acceptă, Respinge și Setări; analiza traficului pornește doar după acord', 'Accept, Reject and Settings; traffic analytics start only after consent', 6),
   ('Design system', 'Tokenuri și 29 de componente din care se construiește fiecare pagină', 'Tokens and 29 components every page is built from', 7)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'asfactorum-site-nou';

update public.projects
   set cover_path = $a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/cover/asfactorum-acasa-1600x900.png$a$,
       hero_path = $a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/hero/asfactorum-acasa-1600x900.png$a$
 where slug_ro = 'asfactorum-site-nou';

delete from public.project_images
 where project_id = (select id from public.projects where slug_ro = 'asfactorum-site-nou');

insert into public.project_images (project_id, path, alt_ro, alt_en, aspect, sort_order)
select p.id, i.path, i.alt_ro, i.alt_en, '16/9', i.sort_order
  from public.projects p
 cross join (values
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-acasa-portofoliu-1600x900.png$a$, $a$Secțiunea de portofoliu de pe Acasă, cu proiecte și galerie filtrabilă pe serviciu$a$, $a$Home portfolio section with projects and a gallery filtered by service$a$, 0),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-servicii-1600x900.png$a$, $a$Pagina Servicii cu cele 4 servicii ca dale cu imagine și descriere$a$, $a$Services page with the 4 services as image tiles with descriptions$a$, 1),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-serviciu-1600x900.png$a$, $a$Pagina serviciului Confecții metalice: imagine, lista Ce include și butoane de ofertă și telefon$a$, $a$Metal fabrication service page: image, What's included list, quote and phone buttons$a$, 2),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-serviciu-galerie-1600x900.png$a$, $a$Galeria de fotografii a serviciului Confecții metalice$a$, $a$Photo gallery of the metal fabrication service$a$, 3),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-portofoliu-1600x900.png$a$, $a$Pagina Portofoliu cu lista proiectelor, oraș și țară$a$, $a$Portfolio page with the project list, city and country$a$, 4),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-lightbox-1600x900.png$a$, $a$Fotografie deschisă pe tot ecranul, cu săgeți de navigare și contor$a$, $a$Photo opened full screen with navigation arrows and a counter$a$, 5),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-despre-1600x900.png$a$, $a$Pagina Despre noi: text de prezentare, cifre și imagine$a$, $a$About page: company text, figures and image$a$, 6),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-despre-faq-1600x900.png$a$, $a$Lista de întrebări frecvente de pe pagina Despre noi$a$, $a$FAQ list on the About page$a$, 7),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-blog-1600x900.png$a$, $a$Pagina Blog cu filtrul pe categorii și cardurile articolelor$a$, $a$Blog page with the category filter and article cards$a$, 8),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-articol-1600x900.png$a$, $a$Începutul unui articol: titlu, rezumat, autor, dată și imagine panoramică$a$, $a$Start of an article: title, summary, author, date and wide image$a$, 9),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-contact-1600x900.png$a$, $a$Pagina Contact cu datele de contact și formularul de cerere de ofertă completat cu date demo$a$, $a$Contact page with contact details and the quote form filled with demo data$a$, 10),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-contact-erori-1600x900.png$a$, $a$Formularul trimis gol, cu mesajele Câmp obligatoriu sub nume și e-mail$a$, $a$Form submitted empty, with Required field messages under name and email$a$, 11),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-legal-1600x900.png$a$, $a$Politica de confidențialitate, cu comutatorul între cele trei documente legale$a$, $a$Privacy policy with the switch between the three legal documents$a$, 12),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-submeniu-1600x900.png$a$, $a$Antetul cu submeniul Servicii deschis, cu cele 4 servicii, imagine și număr$a$, $a$Header with the Services dropdown open, showing the 4 services with image and number$a$, 13),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-cookie-1600x900.png$a$, $a$Bannerul de cookie-uri cu setările deschise și comutatorul pentru cookie-uri analitice$a$, $a$Cookie banner with settings open and the analytics toggle$a$, 14),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-email-confirmare-1600x900.png$a$, $a$E-mailul de confirmare trimis clientului după formular$a$, $a$Confirmation email sent to the client after the form$a$, 15),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-email-notificare-1600x900.png$a$, $a$E-mailul de notificare internă, cu datele cererii și butoanele Răspunde pe e-mail și Sună$a$, $a$Internal notification email with the request details and Reply by email and Call buttons$a$, 16),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-engleza-1600x900.png$a$, $a$Pagina Acasă în engleză$a$, $a$Home page in English$a$, 17),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-mobil-1600x900.png$a$, $a$Trei ecrane de telefon: Acasă, meniul pe tot ecranul și Contact$a$, $a$Three phone screens: Home, full-screen menu and Contact$a$, 18),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-ds-culori-1600x900.png$a$, $a$Paleta de culori a design system-ului, cu nume, token și utilizare$a$, $a$Design system colour palette with name, token and usage$a$, 19),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-ds-tipografie-1600x900.png$a$, $a$Scara tipografică Archivo, de la titlul principal la text mic$a$, $a$Archivo type scale, from main heading to small text$a$, 20),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-ds-butoane-1600x900.png$a$, $a$Variantele BaseButton și BaseLink pe fond deschis, închis și galben$a$, $a$BaseButton and BaseLink variants on light, dark and yellow backgrounds$a$, 21),
   ($a$https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/asfactorum-site-nou/gallery/asfactorum-ds-carduri-1600x900.png$a$, $a$Variantele ServiceCard și ProjectCard$a$, $a$ServiceCard and ProjectCard variants$a$, 22)
 ) as i(path, alt_ro, alt_en, sort_order)
 where p.slug_ro = 'asfactorum-site-nou';
