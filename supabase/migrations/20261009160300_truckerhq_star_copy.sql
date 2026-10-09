-- Trucker HQ: STAR copy, from CASE_STUDY_BRIEF_TruckerHQ.md in the project repo.
-- The task is the goal reached together with the client, the action is the
-- process (users, data flow, where each request goes) rather than the screens, and
-- the tech column lists capabilities instead of frameworks.
--
-- Only what the code proves. No figures: gains, savings and cost stay empty until
-- the client provides them, and the quote stays empty until the client confirms
-- one. No "Client" fact. Prices, job counts and carrier data are sample data in the
-- code, so none are quoted. The 6-month maintenance paragraph is left out.
-- Slug, dates, featured, sort order, images and links are not touched.

update public.projects set
  title_ro = $t$Am construit pentru Trucker HQ o platformă care aduce clienți serviciului de dispecerat prin instrumente gratuite pentru transportatori$t$,
  title_en = $t$We built a platform for Trucker HQ that brings in dispatch clients through free tools for truck carriers$t$,
  card_title_ro = $t$Trucker HQ: dispecerat și joburi pentru camioane$t$,
  card_title_en = $t$Trucker HQ: truck dispatch and CDL jobs$t$,
  summary_ro = $t$Platformă web în engleză și rusă prin care transportatorii mici din SUA cer dispecerat la preț fix, găsesc șoferi și își verifică datele FMCSA gratuit.$t$,
  summary_en = $t$An English and Russian web platform where small US carriers request flat-rate dispatch, hire drivers and check their FMCSA records for free.$t$,
  lead_ro = $t$Șoferii-proprietari și flotele mici din SUA își verifică autorizația, calculează profitul pe milă și găsesc joburi. Când au nevoie de dispecer, cererea ajunge direct la echipă, iar omul primește un SMS de confirmare.$t$,
  lead_en = $t$Owner-operators and small US fleets check their authority, work out profit per mile and find jobs. When they need a dispatcher, the request goes straight to the team and the driver gets a confirmation text.$t$,
  kind_ro = 'Platformă web pentru transport rutier',
  kind_en = 'Web platform for trucking',
  tags_ro = array['Platformă web', 'Generare de clienți', 'Date FMCSA', 'SMS', 'EN / RU'],
  tags_en = array['Web platform', 'Lead generation', 'FMCSA data', 'SMS', 'EN / RU'],
  tech = array['Web app', 'Cloud database', 'Government data integration', 'SMS gateway', 'Analytics & ads tracking', 'Search visibility'],

  context_body_ro = $t$Trucker HQ oferă dispecerat pentru șoferi-proprietari (owner-operators) și flote mici din SUA, mulți dintre ei vorbitori de rusă. Piața de dispecerat lucrează de obicei cu procent din fiecare cursă. Trucker HQ voia să vină cu un preț fix pe săptămână, dar un model nou trebuie explicat și dovedit, iar clienții potriviți trebuie mai întâi găsiți.

Transportatorii mici au nevoi zilnice care nu țin de dispecer: își verifică autorizația și asigurarea în registrul federal FMCSA, socotesc dacă o cursă merită, caută șoferi sau un loc de muncă. Informația există, dar e împrăștiată, tehnică și doar în engleză. Fără un loc unde acești oameni vin singuri, fiecare client nou cerea timp de vânzare și reclamă plătită.$t$,
  context_body_en = $t$Trucker HQ provides dispatch for owner-operators and small US fleets, many of whom speak Russian. Dispatch is usually sold as a percentage of every load. Trucker HQ wanted to offer a flat weekly price, but a new model has to be explained and proven, and the right carriers have to be found first.

Small carriers have daily needs that have nothing to do with a dispatcher: checking their authority and insurance in the federal FMCSA registry, working out whether a load pays, finding drivers or a job. The information exists, but it is scattered, technical and English-only. Without a place these people come to on their own, every new client cost sales time and paid ads.$t$,

  star_goal_ro = $t$Să găsim împreună cu clientul o soluție care aduce transportatori mici pe site prin instrumente cu adevărat utile, astfel încât cei care au nevoie de dispecer să lase o cerere completă, fără un apel de calificare.$t$,
  star_goal_en = $t$Find, together with the client, a way to bring small carriers to the site through genuinely useful tools, so that those who need a dispatcher leave a complete request without a qualifying call.$t$,

  star_constraints_ro = $j$[
    {"k": "Date publice, dar sensibile", "v": "Un număr DOT sau MC poate identifica o persoană fizică; aceste numere nu ajung în platformele de reclamă, iar formularele salvează datele fără să le poată citi înapoi din browser"},
    {"k": "SMS reglementat în SUA", "v": "Mesajele cer consimțământ explicit, opțiunea STOP și o pagină de termeni SMS; trimiterile sunt limitate, ca formularele să nu poată fi folosite abuziv"},
    {"k": "Două limbi, nu o traducere", "v": "Publicul vorbește engleză și rusă; paginile principale există în ambele limbi, cu fonturi pentru chirilică și semnale corecte pentru Google"},
    {"k": "Utilizatori", "v": "Șoferi pe telefon, în cabină: formulare scurte, butoane mari, fără cont și fără parolă"},
    {"k": "Date dintr-un sistem terț", "v": "Registrul FMCSA nu publică o schemă a răspunsului, așa că datele lui sunt adaptate la modelul nostru, cu un scor propriu de sănătate a transportatorului"}
  ]$j$::jsonb,
  star_constraints_en = $j$[
    {"k": "Public but sensitive data", "v": "A DOT or MC number can identify a sole proprietor; these numbers never reach ad platforms, and the forms save data without being able to read it back from the browser"},
    {"k": "Regulated SMS in the US", "v": "Texts need explicit consent, a STOP option and an SMS terms page; sends are capped so the forms can't be abused"},
    {"k": "Two languages, not a translation", "v": "The audience speaks English and Russian; the main pages exist in both, with Cyrillic fonts and correct signals for Google"},
    {"k": "Users", "v": "Drivers on a phone, in a cab: short forms, large buttons, no account and no password"},
    {"k": "Data from a third-party system", "v": "The FMCSA registry publishes no response schema, so its data is mapped to our own model, with our own carrier health score"}
  ]$j$::jsonb,

  solution_body_ro = $t$Nu am început cu ecrane. Am pornit de la oamenii care vor folosi site-ul: șoferul-proprietar cu un camion, flota de 3–10 camioane, transportatorul cu autorizație nouă, șoferul CDL care caută loc de muncă și firma care angajează. Pentru fiecare am stabilit împreună cu clientul ce caută, ce date ne dă și unde ajung acestea: cererea de dispecerat la dispeceri, aplicația la recrutori, înscrierea la alerte în baza de date. Am pregătit și un plan SEO, un plan de reclame și o listă de conținut pe care clientul o completează.

Apoi am construit platforma urmând drumul utilizatorului. Omul ajunge din Google pe pagina statului sau a orașului lui ori pe un instrument gratuit, își verifică transportatorul după DOT sau MC, calculează profitul unei curse. Din fiecare instrument există un pas natural spre dispecerat: un formular care strânge exact ce întreabă un dispecer la primul apel. Cererea se salvează în baza de date, iar omul primește imediat un SMS de confirmare.$t$,
  solution_body_en = $t$We did not start with screens. We started from the people who will use the site: the owner-operator with one truck, the fleet with 3–10 trucks, the carrier with a new authority, the CDL driver looking for work and the company hiring. For each we worked out with the client what they look for, what data they give us and where it goes: dispatch requests to dispatchers, applications to recruiters, alert sign-ups to the database. We also prepared an SEO plan, an ads plan and a content checklist for the client to fill in.

Then we built the platform along the user's path. A carrier lands from Google on their state or city page, or on a free tool, checks a carrier by DOT or MC, works out the profit on a load. Every tool has a natural next step into dispatch: a form that collects exactly what a dispatcher asks on the first call. The request is saved to the database, and the carrier gets a confirmation text right away.$t$,

  star_biz_ro = $j$[
    "Am pornit de la tipurile de vizitatori și am stabilit pentru fiecare ce caută, ce date ne dă și unde ajung acestea.",
    "Instrumentele sunt gratuite și fără înregistrare, ca să aducă trafic din căutări și încredere înainte de orice vânzare.",
    "Prețul fix e pus lângă un calculator care îl compară cu un dispecer cu procent, ca omul să-și vadă singur economia.",
    "Pachetele sunt împărțite după etapa transportatorului, nu după ce vrem noi să vindem.",
    "Paginile subțiri sunt ascunse din Google, ca site-ul să nu fie penalizat pentru conținut duplicat.",
    "Panoul cu conturi pentru transportatori a fost amânat: întâi validăm cererea cu formulare simple."
  ]$j$::jsonb,
  star_biz_en = $j$[
    "We started from the visitor types and worked out for each what they look for, what data they give us and where it goes.",
    "The tools are free with no sign-up, to bring search traffic and build trust before any sale.",
    "The flat price sits next to a calculator comparing it to a percentage dispatcher, so carriers see their own saving.",
    "Packages are split by the carrier's stage, not by what we would like to sell.",
    "Thin pages are kept out of Google, so the site is not penalised for duplicate content.",
    "The carrier panel with accounts was postponed: we validate demand with simple forms first."
  ]$j$::jsonb,

  result_body_ro = $t$Clientul are un singur loc unde transportatorii mici vin singuri: din căutări după numele statului, al orașului sau după numărul DOT. Fiecare cerere ajunge completă și structurată, cu echipamentul, rutele și ora potrivită pentru apel, deci dispecerul începe conversația știind deja cu cine vorbește.

Omul primește confirmarea pe loc, echipa vede din analytics ce pagini și instrumente aduc clienți, iar vorbitorii de rusă găsesc serviciul în limba lor.$t$,
  result_body_en = $t$The client has one place small carriers come to on their own: from searches for their state, their city or their DOT number. Every request arrives complete and structured, with equipment, lanes and the best time to call, so the dispatcher starts the conversation already knowing who they are talking to.

The carrier gets a confirmation on the spot, the team sees in analytics which pages and tools bring in clients, and Russian speakers find the service in their own language.$t$
where slug_ro = 'truckerhq';

-- The live "Client" fact stays: the client is already named on the public page.
delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'truckerhq')
   and label_en <> 'Client';

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order + 1
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Platformă web de generare a clienților', 'Lead generation web platform', 0),
   ('Module', 'Modules', 'Dispecerat, joburi CDL, angajare șoferi, instrumente gratuite, ghiduri', 'Dispatch, CDL jobs, driver hiring, free tools, guides', 1),
   ('Limbi', 'Languages', 'Engleză, rusă', 'English, Russian', 2)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'truckerhq';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'truckerhq');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Web app', 'Site rapid, gata pentru Google, în engleză și rusă, cu pagini generate pentru fiecare stat, oraș, job și ghid', 'A fast, search-ready site in English and Russian, with pages generated for every state, city, job and guide', 0),
   ('Cloud database', 'Păstrează în siguranță fiecare cerere: dispecerat, aplicații, angajări, contact, alerte, revendicări de profil', 'Safely stores every request: dispatch, applications, hiring, contact, alerts, profile claims', 1),
   ('Government data integration', 'Caută transportatori în registrul federal FMCSA după DOT, MC sau nume și calculează un scor de sănătate', 'Looks up carriers in the federal FMCSA registry by DOT, MC or name and computes a health score', 2),
   ('SMS gateway', 'Trimite confirmări imediate după cerere, cu consimțământ și protecție împotriva abuzului', 'Sends instant confirmations after a request, with consent and abuse protection', 3),
   ('Analytics & ads tracking', 'Măsoară ce pagini și instrumente aduc cereri, cu acord pentru cookie-uri și fără date personale trimise la reclame', 'Measures which pages and tools bring requests, with cookie consent and no personal data sent to ad platforms', 4),
   ('Search visibility', 'Date structurate, imagini de distribuire și hartă a site-ului pentru fiecare tip de pagină', 'Structured data, share images and a sitemap for every page type', 5)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'truckerhq';
