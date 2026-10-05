-- Seeds the seven real case studies from the Claude Design case-study prototype
-- ("Studiu de caz.dc.html" / "Case Study.dc.html"), RO and EN. Only the
-- prototype's PROJECTS copy is used: its DEMO block (invented figures, quotes,
-- extra stack rows) and its internal todo notes are left out on purpose, so
-- stats and quotes stay empty until real ones exist. Images are uploaded to
-- Storage separately. The earlier placeholder projects are unpublished, not
-- deleted. Idempotent: upserts on slug_ro and replaces each project's child rows.

update public.projects
   set published_at = null, featured = false
 where slug_ro not in ('startica-app', 'bloom', 'truckerhq', 'startica-site', 'aurelia-badiur', 'englishminds', 'swisscars');

create or replace function pg_temp.seed_case_study(
  p jsonb,
  facts jsonb,
  stack jsonb
) returns void
language plpgsql
as $$
declare
  v_id uuid;
begin
  insert into public.projects (
    slug_ro, slug_en, title_ro, title_en, card_title_ro, card_title_en,
    summary_ro, summary_en, lead_ro, lead_en, kind_ro, kind_en, tags_ro, tags_en,
    year, tech, service_tag, featured, live_url, live_url_label_ro, live_url_label_en,
    cover_alt_ro, cover_alt_en, hero_alt_ro, hero_alt_en,
    context_body_ro, context_body_en, solution_body_ro, solution_body_en,
    obstacles_body_ro, obstacles_body_en, changes_body_ro, changes_body_en,
    result_body_ro, result_body_en, screens_demo, sort_order, published_at
  ) values (
    p->>'slug', p->>'slug', p->>'title_ro', p->>'title_en', p->>'name_ro', p->>'name_en',
    p->>'lead_ro', p->>'lead_en', p->>'lead_ro', p->>'lead_en', p->>'kind_ro', p->>'kind_en',
    array(select jsonb_array_elements_text(p->'tags_ro')), array(select jsonb_array_elements_text(p->'tags_en')),
    2026, array(select s->>'name' from jsonb_array_elements(stack) s), p->>'service_tag',
    (p->>'featured')::boolean, p->>'url', p->>'url_label_ro', p->>'url_label_en',
    p->>'title_ro', p->>'title_en', p->>'title_ro', p->>'title_en',
    p->>'problem_ro', p->>'problem_en', p->>'solution_ro', p->>'solution_en',
    p->>'obstacles_ro', p->>'obstacles_en', p->>'changes_ro', p->>'changes_en',
    p->>'result_ro', p->>'result_en', (p->>'mock')::boolean, (p->>'sort_order')::int, now()
  )
  on conflict (slug_ro) do update set
    slug_en = excluded.slug_en, title_ro = excluded.title_ro, title_en = excluded.title_en,
    card_title_ro = excluded.card_title_ro, card_title_en = excluded.card_title_en,
    summary_ro = excluded.summary_ro, summary_en = excluded.summary_en,
    lead_ro = excluded.lead_ro, lead_en = excluded.lead_en,
    kind_ro = excluded.kind_ro, kind_en = excluded.kind_en,
    tags_ro = excluded.tags_ro, tags_en = excluded.tags_en,
    year = excluded.year, tech = excluded.tech, service_tag = excluded.service_tag,
    featured = excluded.featured, live_url = excluded.live_url,
    live_url_label_ro = excluded.live_url_label_ro, live_url_label_en = excluded.live_url_label_en,
    cover_alt_ro = excluded.cover_alt_ro, cover_alt_en = excluded.cover_alt_en,
    hero_alt_ro = excluded.hero_alt_ro, hero_alt_en = excluded.hero_alt_en,
    context_body_ro = excluded.context_body_ro, context_body_en = excluded.context_body_en,
    solution_body_ro = excluded.solution_body_ro, solution_body_en = excluded.solution_body_en,
    obstacles_body_ro = excluded.obstacles_body_ro, obstacles_body_en = excluded.obstacles_body_en,
    changes_body_ro = excluded.changes_body_ro, changes_body_en = excluded.changes_body_en,
    result_body_ro = excluded.result_body_ro, result_body_en = excluded.result_body_en,
    screens_demo = excluded.screens_demo, sort_order = excluded.sort_order,
    published_at = coalesce(public.projects.published_at, excluded.published_at)
  returning id into v_id;

  delete from public.project_facts where project_id = v_id;
  delete from public.project_stack where project_id = v_id;

  insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
  select v_id, f->>0, f->>1, f->>2, f->>3, (ord - 1)::int
    from jsonb_array_elements(facts) with ordinality as t(f, ord);

  insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
  select v_id, s->>'name', s->>'role_ro', s->>'role_en', (ord - 1)::int
    from jsonb_array_elements(stack) with ordinality as t(s, ord);
end $$;

-- Facts are [label_ro, label_en, value_ro, value_en]. Paragraphs are separated by a blank line.

select pg_temp.seed_case_study(
  $j${
    "slug": "startica-app", "sort_order": 0, "service_tag": "web-app", "featured": true, "mock": true,
    "name_ro": "Startica, aplicație de administrare", "name_en": "Startica, admin app",
    "kind_ro": "Aplicație web", "kind_en": "Web app",
    "tags_ro": ["Aplicație web", "Gestiune internă", "2026"], "tags_en": ["Web app", "Internal management", "2026"],
    "title_ro": "Aplicația de administrare pentru grădinița Startica", "title_en": "The admin app for Startica kindergarten",
    "lead_ro": "Evidența copiilor, a prezenței și a plăților pentru o grădiniță cu mai multe filiale, într-o singură aplicație.",
    "lead_en": "Children, attendance and payments for a multi-branch kindergarten, in a single app.",
    "problem_ro": "Administrația lucra în mai multe locuri deodată: prezența se nota pe grupe, plățile se țineau separat, iar cheltuielile și raportul pentru contabilitate se adunau manual la sfârșit de lună. Fiecare filială avea propria evidență, așa că o imagine de ansamblu cerea timp și verificări repetate.\n\nGrădinița avea nevoie de un singur loc în care să vadă, în fiecare zi, cine e prezent, cine a achitat și cât s-a cheltuit, la nivel de filială și pe total.",
    "problem_en": "The administration worked in several places at once: attendance was recorded per group, payments were tracked separately, and expenses and the accounting report were compiled by hand at the end of the month. Each branch kept its own records, so getting the full picture took time and repeated checks.\n\nThe kindergarten needed one place to see, every day, who is present, who has paid and how much was spent, per branch and in total.",
    "solution_ro": "Am construit aplicația pornind de la ziua de lucru a administrației. Dimineața se marchează prezența pe grupe, dintr-o singură atingere pentru fiecare copil. Pe parcursul zilei se înregistrează achitările, cu bon tipărit pe loc, iar cheltuielile se adaugă din același ecran.\n\nDashboard-ul lunii arată încasările pe metode de plată, cheltuielile, restanțele și evoluția pe ultimele 12 luni. Părinții cu restanțe pot fi notificați prin SMS direct din aplicație. Fiecare filială lucrează pe datele ei, iar sincronizarea le reunește pentru raportul contabil.",
    "solution_en": "We built the app around the administration’s working day. In the morning, attendance is marked per group with a single tap per child. During the day, payments are recorded with a receipt printed on the spot, and expenses are added from the same screen.\n\nThe monthly dashboard shows income by payment method, expenses, arrears and the trend over the last 12 months. Parents with arrears can be notified by SMS straight from the app. Each branch works on its own data, and sync brings it together for the accounting report.",
    "obstacles_ro": "Cea mai grea parte a fost lucrul simultan din mai multe filiale. Aceeași fișă de copil sau aceeași achitare putea fi modificată în două locuri, așa că sincronizarea trebuia să păstreze datele corecte fără să piardă nimic. Am introdus un mecanism de rezolvare a conflictelor și un indicator vizibil al stării de sincronizare.\n\nAl doilea obstacol a fost tipărirea bonurilor pe imprimante termice de 58 mm, cu diacritice și format lizibil pe o bandă îngustă.",
    "obstacles_en": "The hardest part was working from several branches at the same time. The same child record or payment could be edited in two places, so sync had to keep the data correct without losing anything. We added a conflict-resolution mechanism and a visible sync-status indicator.\n\nThe second obstacle was printing receipts on 58 mm thermal printers, with diacritics and a readable layout on a narrow strip.",
    "changes_ro": "Pe parcurs au apărut module cerute de activitatea reală: evidența ședințelor la bazin, programarea vizitelor pentru părinții interesați și raportul lunar pentru contabil. Ecranul de prezență a fost simplificat după primele săptămâni de folosire, ca marcarea unei grupe întregi să dureze câteva secunde.",
    "changes_en": "Along the way, modules requested by day-to-day work were added: pool session tracking, visit scheduling for interested parents and the monthly report for the accountant. The attendance screen was simplified after the first weeks of use, so marking a whole group takes a few seconds.",
    "result_ro": "Administrația lucrează acum într-o singură aplicație pentru toate filialele. Prezența, plățile și cheltuielile se văd în timp real, iar raportul contabil se generează fără calcule manuale.",
    "result_en": "The administration now works in a single app for all branches. Attendance, payments and expenses are visible in real time, and the accounting report is generated without manual calculations."
  }$j$::jsonb,
  $j$[
    ["Client", "Client", "Startica, grădiniță privată, Chișinău", "Startica, private kindergarten, Chișinău"],
    ["Tip", "Type", "Aplicație internă de gestiune", "Internal management app"],
    ["Module", "Modules", "Copii, grupe, prezență, achitări, cheltuieli, SMS, bazin, raport contabil", "Children, groups, attendance, payments, expenses, SMS, pool, accounting report"],
    ["Filiale", "Branches", "Mai multe, cu date sincronizate", "Several, with synced data"]
  ]$j$::jsonb,
  $j$[
    {"name": "React · TypeScript", "role_ro": "Interfața aplicației", "role_en": "App interface"},
    {"name": "Server de sincronizare", "role_ro": "Date comune între filiale, cu rezolvarea conflictelor", "role_en": "Shared data across branches, with conflict resolution"},
    {"name": "Imprimare 58 mm", "role_ro": "Bonuri pentru achitări și bazin", "role_en": "Receipts for payments and pool sessions"}
  ]$j$::jsonb
);

select pg_temp.seed_case_study(
  $j${
    "slug": "bloom", "sort_order": 1, "service_tag": "web-app", "featured": true, "mock": true,
    "name_ro": "Bloom Florist, aplicație de gestiune", "name_en": "Bloom Florist, management app",
    "kind_ro": "Aplicație web", "kind_en": "Web app",
    "tags_ro": ["Aplicație web", "Gestiune florărie", "RO / EN", "2026"], "tags_en": ["Web app", "Florist operations", "RO / EN", "2026"],
    "title_ro": "Aplicația de gestiune pentru florăria Bloom", "title_en": "The management app for the Bloom florist",
    "lead_ro": "Comenzi, stoc, furnizori, pierderi și plăți online pentru o florărie, într-o singură aplicație folosită de admin și de vânzători.",
    "lead_en": "Orders, stock, suppliers, losses and online payments for a florist, in one app used by the admin and the sales staff.",
    "problem_ro": "Într-o florărie, stocul se schimbă de la o oră la alta: florile vin în loturi, se vând în buchete și se pierd dacă stau prea mult. Comenzile cu livrare, vânzările directe și avansurile se țineau separat, iar pierderile nu se vedeau decât la inventar.\n\nFlorăria avea nevoie de o aplicație care să arate, în fiecare zi, ce comenzi sunt de pregătit, ce produse sunt pe terminate și cât s-a câștigat de fapt.",
    "problem_en": "In a flower shop, stock changes by the hour: flowers arrive in batches, sell as bouquets and are lost if they sit too long. Delivery orders, walk-in sales and deposits were tracked separately, and losses only showed up at stocktake.\n\nThe shop needed an app that shows, every day, which orders need preparing, which products are running low and what was actually earned.",
    "solution_ro": "Panoul zilei arată veniturile față de ziua precedentă, comenzile active pe statusuri, livrările și alertele de stoc redus. Comenzile se mută pe o tablă cu trei coloane, Confirmată, În lucru și Pregătită, iar fiecare mutare scade automat stocul.\n\nPrimirea marfei se face pe loturi, cu preț de achiziție și furnizor, așa că aplicația calculează costul mediu și marja pe fiecare produs. Vânzătorii văd doar ce le trebuie pentru comenzi, iar datele financiare rămân la admin.",
    "solution_en": "The daily dashboard shows revenue against the previous day, active orders by status, deliveries and low-stock alerts. Orders move across a three-column board, Confirmed, In progress and Ready, and every move updates stock automatically.\n\nDeliveries are received in batches with purchase price and supplier, so the app calculates average cost and margin per product. Sellers see only what they need for orders; financial data stays with the admin.",
    "obstacles_ro": "Crearea unei comenzi atinge mai multe tabele deodată: comanda, articolele, stocul rezervat și jurnalul. Am mutat crearea într-o singură funcție atomică în baza de date, ca o comandă să nu rămână niciodată pe jumătate salvată.\n\nPlățile online au cerut confirmare prin webhook, protecție la plăți duble pentru aceeași comandă și un ecran de reconciliere cu înregistrările furnizorului.",
    "obstacles_en": "Creating an order touches several tables at once: the order, its items, reserved stock and the activity log. We moved creation into a single atomic database function, so an order is never left half-saved.\n\nOnline payments needed webhook confirmation, protection against double payment for the same order and a reconciliation screen against the provider’s records.",
    "changes_ro": "Pe parcurs au apărut vânzarea directă din magazin, raportul de pierderi pe motive și jurnalul de activitate pe utilizatori. Navigarea de jos pentru telefon a fost adăugată pentru vânzătorii care lucrează din magazin.",
    "changes_en": "Along the way we added walk-in sales, a loss report by reason and a per-user activity log. A bottom navigation bar was added for sellers working from the shop floor on a phone.",
    "result_ro": "Florăria lucrează cu o singură evidență pentru comenzi, stoc și plăți. Pierderile și marja pe produs se văd în rapoarte, fără calcule separate.",
    "result_en": "The shop works from one record for orders, stock and payments. Losses and per-product margin show up in the reports, with no separate calculations."
  }$j$::jsonb,
  $j$[
    ["Client", "Client", "Bloom Florist, Moldova", "Bloom Florist, Moldova"],
    ["Tip", "Type", "Aplicație internă de gestiune", "Internal management app"],
    ["Module", "Modules", "Panou, Inventar, Comenzi, Vânzări, Pierderi, Furnizori, Jurnal, Rapoarte", "Dashboard, Inventory, Orders, Sales, Losses, Suppliers, Activity, Reports"],
    ["Roluri", "Roles", "Admin și vânzător, cu drepturi separate", "Admin and seller, with separate permissions"]
  ]$j$::jsonb,
  $j$[
    {"name": "Nuxt 4 · Pinia", "role_ro": "Interfața aplicației și starea comenzilor", "role_en": "App interface and order state"},
    {"name": "Supabase · Postgres", "role_ro": "Date, autentificare și Row Level Security pe fiecare tabel", "role_en": "Data, authentication and Row Level Security on every table"},
    {"name": "MAIB · PayNet", "role_ro": "Plăți online pentru comenzi, cu webhook și reconciliere", "role_en": "Online order payments, with webhooks and reconciliation"},
    {"name": "Vitest", "role_ro": "Teste pentru store-uri, plăți și permisiuni", "role_en": "Tests for stores, payments and permissions"}
  ]$j$::jsonb
);

select pg_temp.seed_case_study(
  $j${
    "slug": "truckerhq", "sort_order": 2, "service_tag": "website", "featured": true, "mock": true,
    "name_ro": "Trucker HQ, dispatch și unelte pentru transportatori", "name_en": "Trucker HQ, dispatch and carrier tools",
    "kind_ro": "Site cu unelte", "kind_en": "Website with tools",
    "tags_ro": ["Site + unelte", "EN / RU", "SUA", "2026"], "tags_en": ["Website + tools", "EN / RU", "USA", "2026"],
    "title_ro": "Site de dispatch, joburi CDL și unelte gratuite pentru transportatori din SUA", "title_en": "Dispatch, CDL jobs and free tools for US carriers",
    "lead_ro": "Dispatch cu tarif fix pe săptămână, joburi pentru șoferi CDL, recrutare și verificarea transportatorilor din datele publice FMCSA, în engleză și rusă.",
    "lead_en": "Flat-rate weekly dispatch, CDL driver jobs, hiring and carrier checks from public FMCSA data, in English and Russian.",
    "problem_ro": "Proprietarii de camioane din SUA lucrează de obicei cu dispeceri plătiți la procent din cursă. Mulți vorbesc rusa ca primă limbă și caută un dispecer care să răspundă și noaptea, în limba lor.\n\nTrucker HQ avea nevoie de un site care să explice tariful fix, să aducă cereri de dispatch și să atragă trafic constant prin unelte pe care transportatorii le folosesc zilnic.",
    "problem_en": "US owner-operators usually work with dispatchers paid a percentage of each load. Many speak Russian as a first language and look for a dispatcher who answers at night, in their language.\n\nTrucker HQ needed a site that explains the flat rate, brings in dispatch requests and draws steady traffic through tools carriers use every day.",
    "solution_ro": "Pagina principală pornește de la o căutare: orice broker sau transportator poate fi verificat după DOT, MC sau nume, cu un Health Score de la 0 la 100 calculat din datele FMCSA. Sub ea vin dispatch-ul, joburile CDL și recrutarea de șoferi.\n\nUneltele gratuite, Carrier Lookup, Profit per Mile, Compliance Alerts și New MC Checklist, nu cer cont. Pentru fiecare stat există o pagină cu transportatorii locali, generată din același șablon.",
    "solution_en": "The home page starts with a search: any broker or carrier can be checked by DOT, MC or name, with a 0–100 Health Score built from FMCSA data. Dispatch, CDL jobs and driver hiring follow below.\n\nThe free tools, Carrier Lookup, Profit per Mile, Compliance Alerts and New MC Checklist, need no account. Each state has a page listing local carriers, generated from one template.",
    "obstacles_ro": "Datele FMCSA vin incomplete sau cu întârzieri, iar cheia de acces nu e obligatorie la început. Site-ul funcționează pe date de exemplu până când cheia este setată, apoi trece pe date live fără alte modificări.\n\nVersiunea în rusă cere fonturi cu chirilice și texte scrise pentru șoferi, nu traduse literal. Am separat textele pe limbi și le-am trecut printr-o verificare dedicată.",
    "obstacles_en": "FMCSA data arrives incomplete or delayed, and an access key isn’t required at the start. The site runs on sample data until the key is set, then switches to live data with no other changes.\n\nThe Russian version needs Cyrillic fonts and copy written for drivers, not translated word for word. We split copy by language and put it through a dedicated review.",
    "changes_ro": "Header-ul a fost refăcut ca indicator rutier, cu telefonul de dispatch mereu vizibil. Pe telefon, butoanele principale au crescut la cel puțin 48 de pixeli, pentru șoferii care folosesc site-ul din cabină.",
    "changes_en": "The header was rebuilt as a road sign, with the dispatch phone number always visible. On phones, primary buttons grew to at least 48 pixels for drivers using the site from the cab.",
    "result_ro": "Trucker HQ are un site care explică tariful fix, aduce cereri de dispatch și joburi și oferă unelte gratuite care readuc transportatorii pe site.",
    "result_en": "Trucker HQ has a site that explains the flat rate, brings in dispatch requests and job applications, and offers free tools that bring carriers back."
  }$j$::jsonb,
  $j$[
    ["Client", "Client", "Trucker HQ, dispecerat auto, SUA", "Trucker HQ, truck dispatch, USA"],
    ["Tip", "Type", "Site de servicii cu unelte gratuite", "Service website with free tools"],
    ["Limbi", "Languages", "Engleză, rusă", "English, Russian"],
    ["Secțiuni", "Sections", "Dispatch, Jobs, Hire Drivers, Tools, Guides", "Dispatch, Jobs, Hire Drivers, Tools, Guides"]
  ]$j$::jsonb,
  $j$[
    {"name": "Next.js 16 · React 19", "role_ro": "Pagini server, componente interactive izolate", "role_en": "Server pages, isolated interactive components"},
    {"name": "Tailwind CSS 4", "role_ro": "Tokens de culoare și tipografie din designul aprobat", "role_en": "Colour and type tokens from the approved design"},
    {"name": "FMCSA API", "role_ro": "Date publice despre autorizare, asigurare și inspecții", "role_en": "Public authority, insurance and inspection data"},
    {"name": "Vitest", "role_ro": "Teste pentru rutele API și validare", "role_en": "Tests for API routes and validation"}
  ]$j$::jsonb
);

select pg_temp.seed_case_study(
  $j${
    "slug": "startica-site", "sort_order": 3, "service_tag": "website", "featured": false, "mock": false,
    "url": "https://startica.md/", "url_label_ro": "startica.md", "url_label_en": "startica.md",
    "name_ro": "Startica, grădiniță în Chișinău", "name_en": "Startica, kindergarten in Chișinău",
    "kind_ro": "Site de business", "kind_en": "Business website",
    "tags_ro": ["Site de business", "RO / EN / RU", "2026"], "tags_en": ["Business website", "RO / EN / RU", "2026"],
    "title_ro": "Site-ul grădiniței Startica, în trei limbi", "title_en": "The Startica kindergarten website, in three languages",
    "lead_ro": "Site pentru o grădiniță privată din Chișinău: grupe de vârstă, programe, spații și înscriere online, în română, engleză și rusă.",
    "lead_en": "A website for a private kindergarten in Chișinău: age groups, programmes, spaces and online enrolment, in Romanian, English and Russian.",
    "problem_ro": "Părinții care aleg o grădiniță vor să vadă spațiile, să înțeleagă programul zilei și să știe ce grupă i se potrivește copilului, înainte să sune. Startica are un public mixt, vorbitor de română, rusă și engleză, iar informațiile ajungeau la ei mai ales prin telefon și rețele sociale.\n\nGrădinița avea nevoie de un site care să răspundă la întrebările frecvente și să transforme vizita pe site într-o cerere de înscriere.",
    "problem_en": "Parents choosing a kindergarten want to see the spaces, understand the daily schedule and know which group suits their child before they call. Startica has a mixed audience of Romanian, Russian and English speakers, and information reached them mostly by phone and social media.\n\nThe kindergarten needed a site that answers the common questions and turns a visit into an enrolment request.",
    "solution_ro": "Pagina principală prezintă cele 5 grupe de vârstă, cele 3 programe și cele 11 spații ale clădirii, fiecare cu galeria lui foto. Paginile separate pentru alimentație, curriculum și evenimente răspund la întrebările pe care părinții le pun cel mai des.\n\nLa final, formularul de înscriere cere grupa și programul dorit, iar managerul revine în 24 de ore. Toate textele sunt disponibile în cele trei limbi.",
    "solution_en": "The home page presents the 5 age groups, the 3 programmes and the 11 spaces in the building, each with its own photo gallery. Separate pages for nutrition, curriculum and events answer the questions parents ask most often.\n\nAt the end, the enrolment form asks for the preferred group and programme, and the manager replies within 24 hours. All copy is available in the three languages.",
    "obstacles_ro": "Site-ul are multe fotografii, iar părinții îl deschid mai ales de pe telefon. Am optimizat imaginile în formate moderne și dimensiuni potrivite fiecărui ecran, ca galeriile să se încarce repede și pe date mobile.\n\nConținutul în trei limbi a cerut o structură în care fiecare pagină și fiecare galerie se administrează o singură dată, cu textele traduse separat.",
    "obstacles_en": "The site has many photos, and parents open it mostly on their phones. We optimised images into modern formats and sizes suited to each screen, so galleries load quickly on mobile data too.\n\nContent in three languages called for a structure where each page and gallery is managed once, with the copy translated separately.",
    "changes_ro": "Structura inițială grupa informațiile pe pagini separate. Am mutat grupele, programele și spațiile pe pagina principală, ca părintele să vadă totul într-un singur parcurs, fără să caute prin meniu.",
    "changes_en": "The initial structure spread the information across separate pages. We moved groups, programmes and spaces onto the home page, so parents see everything in one pass without hunting through the menu.",
    "result_ro": "Părinții găsesc pe site răspunsurile de bază și pot trimite o cerere de înscriere în orice limbă, la orice oră.",
    "result_en": "Parents find the basic answers on the site and can send an enrolment request in any language, at any time."
  }$j$::jsonb,
  $j$[
    ["Client", "Client", "Startica, grădiniță privată, Chișinău", "Startica, private kindergarten, Chișinău"],
    ["Tip", "Type", "Site de business", "Business website"],
    ["Limbi", "Languages", "Română, engleză, rusă", "Romanian, English, Russian"],
    ["Pagini", "Pages", "Acasă, Alimentație, Evenimente, Curriculum, Contacte", "Home, Nutrition, Events, Curriculum, Contacts"]
  ]$j$::jsonb,
  '[]'::jsonb
);

select pg_temp.seed_case_study(
  $j${
    "slug": "aurelia-badiur", "sort_order": 4, "service_tag": "website", "featured": false, "mock": false,
    "url": "https://aureliabadiur.com/", "url_label_ro": "aureliabadiur.com", "url_label_en": "aureliabadiur.com",
    "name_ro": "Aurelia Badiur, consultant oenolog", "name_en": "Aurelia Badiur, oenology consultant",
    "kind_ro": "Site de prezentare", "kind_en": "Presentation website",
    "tags_ro": ["Site de prezentare", "RO / EN", "2026"], "tags_en": ["Presentation website", "RO / EN", "2026"],
    "title_ro": "Site de prezentare pentru un consultant oenolog", "title_en": "A presentation website for an oenology consultant",
    "lead_ro": "Site bilingv pentru Aurelia Badiur, oenolog format în Bordeaux și Bourgogne, care consiliază crame în vinificație și calitatea vinului.",
    "lead_en": "A bilingual site for Aurelia Badiur, an oenologist trained in Bordeaux and Burgundy who advises wineries on winemaking and wine quality.",
    "problem_ro": "Consultanța în oenologie se vinde prin încredere. O cramă care caută un consultant vrea să știe unde s-a format acesta, cu ce domenii a lucrat și cum arată colaborarea concretă. Fără un site propriu, aceste informații erau împrăștiate între recomandări, profiluri sociale și discuții directe.\n\nClienta avea nevoie de o prezentare clară, în română și engleză, care să explice serviciile și să ducă spre o discuție directă.",
    "problem_en": "Oenology consulting sells on trust. A winery looking for a consultant wants to know where they trained, which estates they have worked with and what the collaboration looks like in practice. Without a site of her own, this information was scattered across referrals, social profiles and direct conversations.\n\nThe client needed a clear presentation, in Romanian and English, that explains the services and leads to a direct conversation.",
    "solution_ro": "Site-ul urmează ordinea în care o cramă își formează o părere: formarea și domeniile în care a lucrat, cele cinci etape ale urmăririi vinificației, consultanța punctuală și, la final, programarea unei întâlniri 1:1.\n\nVizual, am folosit fotografii din vie și din cramă și o tipografie sobră, potrivită unui serviciu de expertiză. Contactul este disponibil prin formular, WhatsApp și email, ca fiecare client să aleagă canalul preferat.",
    "solution_en": "The site follows the order in which a winery forms an opinion: training and the estates she has worked with, the five stages of winemaking follow-up, one-off consulting and, at the end, booking a 1:1 meeting.\n\nVisually, we used photos from the vineyard and the cellar and restrained typography suited to an expert service. Contact is available by form, WhatsApp and email, so each client can choose their preferred channel.",
    "obstacles_ro": "Serviciile de consultanță sunt tehnice, iar publicul include atât proprietari de crame, cât și tehnologi. Textele trebuiau să fie precise pentru specialiști și ușor de înțeles pentru restul. Am împărțit urmărirea vinificației în cinci etape, fiecare cu o descriere scurtă a ce se face și de ce contează.",
    "obstacles_en": "Consulting services are technical, and the audience includes both winery owners and technologists. The copy had to be precise for specialists and easy to follow for everyone else. We split winemaking follow-up into five stages, each with a short description of what is done and why it matters.",
    "changes_ro": "Inițial, serviciile erau prezentate ca o listă. Pe parcurs le-am separat în două direcții: urmărirea completă a vinificației și consultanța punctuală. Astfel, o cramă vede imediat ce tip de colaborare i se potrivește.",
    "changes_en": "Initially, the services were presented as a list. Along the way we separated them into two tracks: full winemaking follow-up and one-off consulting. A winery now sees immediately which kind of collaboration suits it.",
    "result_ro": "Aurelia Badiur are acum o prezentare profesională în două limbi, pe care o poate trimite oricărei crame din Moldova sau din afara ei.",
    "result_en": "Aurelia Badiur now has a professional presentation in two languages that she can send to any winery in Moldova or abroad."
  }$j$::jsonb,
  $j$[
    ["Client", "Client", "Aurelia Badiur, consultant oenolog", "Aurelia Badiur, oenology consultant"],
    ["Tip", "Type", "Site de prezentare", "Presentation website"],
    ["Limbi", "Languages", "Română, engleză", "Romanian, English"],
    ["Contact", "Contact", "Formular, WhatsApp, email", "Form, WhatsApp, email"]
  ]$j$::jsonb,
  '[]'::jsonb
);

select pg_temp.seed_case_study(
  $j${
    "slug": "englishminds", "sort_order": 5, "service_tag": "website", "featured": false, "mock": false,
    "url": "https://adry999.github.io/EnglishMinds_web/EnglishMinds%20Index.dc.html", "url_label_ro": "Vezi proiectul", "url_label_en": "View the project",
    "name_ro": "EnglishMinds, școală de engleză", "name_en": "EnglishMinds, English school",
    "kind_ro": "Brand · Site · Social", "kind_en": "Brand · Website · Social",
    "tags_ro": ["Brand", "Site", "Social media", "2026"], "tags_en": ["Brand", "Website", "Social media", "2026"],
    "title_ro": "Brand, site și materiale de promovare pentru o școală de engleză", "title_en": "Brand, website and promotional materials for an English school",
    "lead_ro": "Identitate vizuală, site și materiale pentru EnglishMinds: de la grupe și tabere până la postări pe Instagram.",
    "lead_en": "Visual identity, website and materials for EnglishMinds: from groups and camps to Instagram posts.",
    "problem_ro": "Piața cursurilor de engleză este aglomerată, iar părinții și elevii compară multe școli înainte să aleagă. EnglishMinds avea nevoie de o identitate ușor de recunoscut și de un parcurs clar de la prima impresie până la prima lecție.\n\nMaterialele de promovare, site-ul și rețelele sociale trebuiau să arate ca aparținând aceleiași școli.",
    "problem_en": "The English-course market is crowded, and parents and students compare many schools before choosing. EnglishMinds needed an identity that is easy to recognise and a clear path from first impression to first lesson.\n\nPromotional materials, the website and social media had to look like they belong to the same school.",
    "solution_ro": "Am pornit de la identitatea vizuală: logo, culori, tipografie și reguli de compoziție. Apoi am aplicat-o pe site, pe flyer și pe șabloanele pentru postări și story-uri pe Instagram.\n\nSite-ul duce vizitatorul spre două acțiuni: testul de nivel și programarea la o lecție demo. Paginile despre grupe, metodă și tabere răspund la întrebările de dinainte de înscriere, iar blogul susține prezența în căutări.",
    "solution_en": "We started with the visual identity: logo, colours, typography and composition rules. Then we applied it to the website, the flyer and the templates for Instagram posts and stories.\n\nThe site leads visitors to two actions: the level test and booking a demo lesson. Pages on groups, method and camps answer pre-enrolment questions, and the blog supports search visibility.",
    "obstacles_ro": "Școala se adresează mai multor categorii de vârstă, de la copii la adulți. Identitatea trebuia să fie prietenoasă pentru cei mici, dar credibilă pentru părinți și adulți. Am rezolvat asta printr-o bază vizuală sobră și accente de culoare folosite diferit pe fiecare tip de material.",
    "obstacles_en": "The school serves several age groups, from children to adults. The identity had to feel friendly for younger learners but credible for parents and adults. We solved this with a restrained visual base and colour accents used differently on each type of material.",
    "changes_ro": "Pe parcurs, testul de nivel a devenit punctul central al site-ului. Este cel mai simplu prim pas pentru un vizitator nehotărât și oferă școlii un motiv concret de a reveni cu o recomandare de grupă.",
    "changes_en": "Along the way, the level test became the centre of the site. It is the easiest first step for an undecided visitor and gives the school a concrete reason to follow up with a group recommendation.",
    "result_ro": "EnglishMinds are acum un sistem vizual unitar, aplicat pe site și pe rețelele sociale, și un parcurs clar spre testul de nivel și lecția demo.",
    "result_en": "EnglishMinds now has a unified visual system, applied across the website and social media, and a clear path to the level test and demo lesson."
  }$j$::jsonb,
  $j$[
    ["Client", "Client", "EnglishMinds, școală de engleză", "EnglishMinds, English school"],
    ["Tip", "Type", "Brand, site, social media", "Brand, website, social media"],
    ["Pagini", "Pages", "Grupe, Metodă, Tabere, Test, Lecție demo, Blog, Ofertă", "Groups, Method, Camps, Test, Demo lesson, Blog, Offer"],
    ["Materiale", "Materials", "Flyer, postări și story-uri Instagram", "Flyer, Instagram posts and stories"]
  ]$j$::jsonb,
  '[]'::jsonb
);

select pg_temp.seed_case_study(
  $j${
    "slug": "swisscars", "sort_order": 6, "service_tag": "website", "featured": false, "mock": true,
    "url": "https://www.swisscars.md/", "url_label_ro": "swisscars.md", "url_label_en": "swisscars.md",
    "name_ro": "SwissCars, auto din Elveția", "name_en": "SwissCars, cars from Switzerland",
    "kind_ro": "Site cu stoc", "kind_en": "Inventory website",
    "tags_ro": ["Site cu stoc", "RO / RU / EN", "2026"], "tags_en": ["Inventory website", "RO / RU / EN", "2026"],
    "title_ro": "Site cu stoc auto pentru un importator din Elveția", "title_en": "A car inventory website for an importer from Switzerland",
    "lead_ro": "Stoc de mașini aduse din Elveția, cu pagini de detaliu, leasing prin parteneri și recenzii de la clienți.",
    "lead_en": "Inventory of cars brought from Switzerland, with detail pages, partner leasing and customer reviews.",
    "problem_ro": "Mașinile disponibile erau promovate mai ales pe platforme de anunțuri și pe rețele sociale, unde fiecare anunț concurează cu sute de altele și unde istoricul și proveniența mașinii se pierd ușor.\n\nSwissCars avea nevoie de un catalog propriu, actualizat din panou, în care fiecare mașină să aibă o pagină completă, iar cumpărătorul să poată afla imediat și opțiunile de finanțare.",
    "problem_en": "Available cars were promoted mostly on listing platforms and social media, where each listing competes with hundreds of others and the car’s history and provenance are easily lost.\n\nSwissCars needed its own catalogue, updated from an admin panel, where every car has a complete page and buyers can see financing options right away.",
    "solution_ro": "Stocul se administrează din panou: fiecare mașină are pagină proprie cu preț, an, kilometraj, motorizare și galerie foto. Vizitatorul poate filtra după marcă, salva favorite și compara mai multe mașini.\n\nSecțiunea de leasing prezintă partenerii de finanțare, iar recenziile clienților apar lângă stoc, ca un cumpărător nou să vadă experiența celor dinaintea lui.",
    "solution_en": "Inventory is managed from the admin panel: each car has its own page with price, year, mileage, engine and photo gallery. Visitors can filter by make, save favourites and compare several cars.\n\nThe leasing section presents the financing partners, and customer reviews appear next to the inventory, so a new buyer sees the experience of those before them.",
    "obstacles_ro": "Fiecare mașină vine cu zeci de fotografii mari. Le-am stocat separat de pagini și le servim redimensionate pentru fiecare ecran, ca stocul să se încarce rapid și pe telefon.\n\nStocul se schimbă des, așa că paginile trebuiau să se actualizeze imediat ce o mașină este adăugată, rezervată sau vândută, fără intervenția unui programator.",
    "obstacles_en": "Every car comes with dozens of large photos. We store them separately from the pages and serve them resized for each screen, so the inventory loads quickly on phones too.\n\nInventory changes often, so pages had to update as soon as a car is added, reserved or sold, without a developer stepping in.",
    "changes_ro": "Lista de favorite a fost adăugată pe parcurs, după ce am observat că vizitatorii revin de mai multe ori înainte să sune. Astfel pot păstra mașinile care îi interesează fără cont.",
    "changes_en": "The favourites list was added along the way, after we noticed visitors return several times before calling. They can now keep the cars they are interested in without an account.",
    "result_ro": "SwissCars își administrează singur stocul, iar fiecare mașină are o pagină completă pe care o poate trimite direct unui client interesat.",
    "result_en": "SwissCars manages its own inventory, and every car has a complete page it can send straight to an interested customer."
  }$j$::jsonb,
  $j$[
    ["Client", "Client", "SwissCars.md", "SwissCars.md"],
    ["Tip", "Type", "Site cu catalog auto", "Car catalogue website"],
    ["Limbi", "Languages", "Română, rusă, engleză", "Romanian, Russian, English"],
    ["Secțiuni", "Sections", "Stoc, Servicii, Leasing, Favorite", "Inventory, Services, Leasing, Favourites"]
  ]$j$::jsonb,
  $j$[
    {"name": "Next.js", "role_ro": "Site-ul și paginile de mașini", "role_en": "The site and car pages"},
    {"name": "Supabase", "role_ro": "Stocul de mașini și pozele", "role_en": "Car inventory and photos"}
  ]$j$::jsonb
);
