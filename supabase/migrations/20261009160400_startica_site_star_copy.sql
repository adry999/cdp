-- Startica website: STAR copy, from CASE_STUDY_BRIEF.md in the project repo.
-- The situation is the client's problem before, the task is the goal reached together
-- with the client, the action is the process (inventory, data flow, who publishes what)
-- rather than screens, and the tech column lists capabilities instead of frameworks.
-- Only what the code proves. No figures: gains, savings and the card result (win_*)
-- stay empty until the client provides them, and the quote stays empty until the client
-- confirms one. No "Client" fact. Items marked [DE CONFIRMAT] or (dedus) are left out,
-- as is the maintenance paragraph.

update public.projects set
  title_ro = 'Un site nou pentru o grădiniță din Chișinău, cu un panou simplu prin care echipa publică singură evenimentele și primește cererile părinților',
  title_en = 'A new website for a Chișinău kindergarten, with a simple panel where the team publishes events on its own and receives parents'' requests',
  card_title_ro = 'Startica, site nou și panou de evenimente',
  card_title_en = 'Startica, new website and events panel',
  summary_ro = 'Site de business pentru o grădiniță privată, cu panou de evenimente gestionat de echipă și cereri de înscriere livrate direct pe Telegram.',
  summary_en = 'A business website for a private kindergarten, with an events panel run by the team and enrolment requests delivered straight to Telegram.',
  lead_ro = 'Am păstrat identitatea vizuală pe care părinții o cunoșteau deja și am schimbat ce era sub ea: fotografiile ajung în stocarea clientului, evenimentele le publică echipa, iar cererea unui părinte ajunge de la formular direct pe telefonul administratorului.',
  lead_en = 'We kept the look parents already knew and replaced what sat underneath: photos now live in the client''s own storage, the team publishes events, and a parent''s request goes from the form straight to the administrator''s phone.',
  kind_ro = 'Site de business cu panou de administrare',
  kind_en = 'Business website with admin panel',
  tags_ro = array['Site de business', 'Panou de administrare', 'Cereri de înscriere', 'Galerii foto', 'Mobil'],
  tags_en = array['Business website', 'Admin panel', 'Enrolment requests', 'Photo galleries', 'Mobile'],
  tech = array['Business website', 'Events admin panel', 'Photo galleries', 'Enrolment requests', 'Mobile-first'],

  context_body_ro = $t$Startica avea deja un site, cu o identitate vizuală clară și cunoscută de părinți. Pentru o grădiniță privată, site-ul este primul loc în care un părinte decide dacă programează o vizită. Evenimentele (serbări, excursii, ateliere) arată viața din grădiniță și trebuie să ajungă repede pe site, cu poze.

Fotografiile de la evenimente stăteau însă pe serverul vechi, care refuza să le afișeze pe un alt domeniu, deci nu puteau fi mutate ușor. Iar o cerere de înscriere care nu ajunge repede la cineva din echipă înseamnă un loc care se poate pierde.$t$,
  context_body_en = $t$Startica already had a website, with a clear visual identity that parents recognised. For a private kindergarten, the website is the first place where a parent decides whether to book a visit. Events (celebrations, trips, workshops) show daily life at the kindergarten and need to reach the site quickly, with photos.

The event photos, however, sat on the old server, which refused to show them on another domain, so they could not simply be moved. And an enrolment request that does not reach someone on the team quickly can mean a lost place.$t$,

  star_goal_ro = 'Să găsim împreună cu clientul o soluție care păstrează site-ul pe care părinții îl cunosc, dar mută controlul la echipa grădiniței, astfel încât evenimentele să apară fără programator și nicio cerere să nu se piardă.',
  star_goal_en = 'To find, together with the client, a way to keep the website parents know while handing control to the kindergarten''s team, so events go live without a developer and no request gets lost.',

  star_constraints_ro = $j$[
    {"k": "Aceeași față, altă platformă", "v": "Părinții nu trebuiau să observe schimbarea: fiecare pagină a fost comparată cu originalul, element cu element"},
    {"k": "Fotografii blocate pe serverul vechi", "v": "Serverul vechi refuza imaginile afișate pe alt domeniu; fotografiile au fost mutate în stocarea clientului"},
    {"k": "Utilizatori fără pregătire tehnică", "v": "Personalul grădiniței publică evenimente: panoul cere doar titlu, dată, text și poze"},
    {"k": "Date personale", "v": "Formularele colectează nume, telefon și vârsta copilului, iar datele ajung doar la echipă, nu sunt expuse public"},
    {"k": "Ciorne și publicare", "v": "Un eveniment pe jumătate scris nu trebuie să apară pe site"},
    {"k": "Mai multe limbi, mai târziu", "v": "Conținutul evenimentelor este pregătit pentru RO, RU și EN, ca extinderea să nu ceară o reconstrucție"}
  ]$j$::jsonb,
  star_constraints_en = $j$[
    {"k": "Same face, new platform", "v": "Parents should not notice the switch: every page was compared with the original, element by element"},
    {"k": "Photos locked on the old server", "v": "The old server refused images shown on another domain; the photos were moved into the client's own storage"},
    {"k": "Non-technical users", "v": "Kindergarten staff publish events: the panel asks only for title, date, text and photos"},
    {"k": "Personal data", "v": "The forms collect names, phone numbers and the child's age, and the data goes only to the team, never exposed publicly"},
    {"k": "Drafts vs. published", "v": "A half-written event must not appear on the site"},
    {"k": "More languages later", "v": "Event content is prepared for RO, RU and EN, so expanding won't require a rebuild"}
  ]$j$::jsonb,

  solution_body_ro = $t$Nu am început cu ecrane. Am început cu site-ul existent: l-am parcurs pagină cu pagină și am făcut un inventar complet al conținutului, de la texte și fotografii până la grupe, programe, spații și evenimente. Apoi am urmărit drumul informației: cine publică un eveniment, cine primește o cerere de înscriere și ce face cu ea. Din asta a ieșit un document de cerințe, cu deciziile luate împreună cu clientul: ce rămâne neschimbat, ce trece în mâna echipei și unde ajung cererile.

Am refăcut mai întâi site-ul identic cu originalul și abia după ce identitatea a fost confirmată am trecut la îmbunătățiri. În panou am pus doar evenimentele, adică singurul conținut care se schimbă des; restul paginilor au rămas fixe, ca panoul să fie simplu. „Programează o vizită” deschide formularul pe aceeași pagină, ca părintele să nu fie scos din ce citea, iar cererea ajunge pe Telegram, unde echipa o vede cel mai repede.$t$,
  solution_body_en = $t$We did not start with screens. We started with the existing site: we went through it page by page and built a complete inventory of its content, from copy and photos to age groups, schedules, spaces and events. Then we traced how information moves: who publishes an event, who receives an enrolment request and what they do with it. That became a requirements document capturing the decisions made with the client: what stays the same, what moves into the team's hands, and where requests land.

We first rebuilt the site identical to the original, and only once the identity was signed off did we move on to improvements. The panel holds only events, the one kind of content that changes often; the other pages stay fixed so the panel stays simple. "Book a visit" opens the form on the same page, so the parent is not pulled away from what they were reading, and the request lands on Telegram, where the team sees it fastest.$t$,

  star_biz_ro = $j$[
    "Păstrăm identitatea pe care părinții o recunosc, fără o schimbare vizuală care nu rezolva nicio problemă reală.",
    "Evenimentele se publică de către echipă, fără programator și fără așteptare.",
    "Fiecare cerere ajunge direct la persoana care o poate prelua, pe canalul pe care echipa îl are deja la îndemână.",
    "Fotografiile și datele site-ului stau în conturile clientului, nu pe o platformă la care nu are acces.",
    "Structura pregătită pentru mai multe limbi: extinderea nu cere reconstruirea site-ului."
  ]$j$::jsonb,
  star_biz_en = $j$[
    "We keep the identity parents recognise, with no visual overhaul that would not have solved a real problem.",
    "The team publishes events on its own, with no developer and no waiting.",
    "Every request goes straight to the person who can act on it, on a channel the team already has at hand.",
    "The site's photos and data live in the client's own accounts, not on a platform it cannot reach.",
    "A structure ready for more languages: expanding does not require rebuilding the site."
  ]$j$::jsonb,

  result_body_ro = $t$Echipa Startica publică acum singură evenimentele, cu poze, fără să aștepte un programator. Cererile părinților ajung imediat pe telefonul administratorului, iar formularul de vizită este la un clic de pe orice pagină.

Fotografiile și datele site-ului stau în conturile clientului, nu pe serverul vechi. Pentru părinți, site-ul arată la fel ca înainte, doar că este făcut să se încarce bine și pe telefon.$t$,
  result_body_en = $t$The Startica team now publishes events with photos on its own, without waiting for a developer. Parents' requests reach the administrator's phone right away, and the visit form is one click away from any page.

The site's photos and data live in the client's own accounts, not on the old server. For parents, the site looks the same as before, only built to load well on phones too.$t$
where slug_ro = 'startica-site';

-- The live "Client" fact stays: the client is already named on the public page.
delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'startica-site')
   and label_en <> 'Client';

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order + 1
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Site de business cu panou de administrare', 'Business website with admin panel', 0),
   ('Locație', 'Location', 'Chișinău, Moldova', 'Chișinău, Moldova', 1),
   ('Module', 'Modules', '5 pagini publice, evenimente cu galerii, panou de administrare, cereri de înscriere', '5 public pages, events with galleries, admin panel, enrolment requests', 2),
   ('Limbi', 'Languages', 'Română, structură pregătită pentru RU și EN', 'Romanian, structure ready for RU and EN', 3)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'startica-site';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'startica-site');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Business website', 'Site rapid, care se încarcă bine și pe telefon', 'A fast site that loads well on phones too', 0),
   ('Events admin panel', 'Panou în care echipa creează, editează și publică evenimente, cu ciorne', 'A panel where the team creates, edits and publishes events, with drafts', 1),
   ('Photo storage', 'Fotografiile stau în stocarea clientului, iar miniaturile se generează automat la încărcare', 'Photos live in the client''s own storage and thumbnails are generated automatically on upload', 2),
   ('Cloud database', 'Bază de date proprie a clientului, fără dependență de un furnizor de CMS', 'The client''s own database, with no lock-in to a CMS vendor', 3),
   ('Request notifications', 'Fiecare cerere din formular ajunge instant pe Telegram', 'Every form request reaches Telegram instantly', 4),
   ('Role-based access', 'Doar utilizatorii autentificați modifică conținutul; vizitatorii văd doar ce este publicat', 'Only signed-in users can change content; visitors only see what is published', 5)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'startica-site';
