-- Fleet Digital Twin: STAR case study, from CASE_STUDY_BRIEF.md in the project repo.
-- Inserted as a draft (published_at stays null) and it MUST stay a draft until we
-- confirm whether this is a client project or an internal / demo / thesis project.
-- The repo describes itself as a bachelor's thesis project: data is simulated (demo
-- trucks) and the telematics integration has never run against a real account.
-- Copy is therefore written without a client, without a real deployment and without
-- claiming a working live integration.
--
-- Only what the code proves. No figures: cost, gains, savings, stats and the card
-- result (win_*) stay empty; the quote stays empty. No "Client" fact and no links.
-- The 6-month maintenance paragraph is left out: not confirmed for this project.
-- Items marked (dedus) / [DE CONFIRMAT] in the brief are left out.
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
  'fleet-digital-twin', 'fleet-digital-twin',
  'Un geamăn digital pentru o flotă de transport rutier: o singură consolă pentru dispecer, șofer și destinatarul mărfii',
  'A digital twin for a trucking fleet: one console for the dispatcher, the driver and the person receiving the freight',
  'Geamăn digital pentru o flotă de camioane',
  'A digital twin for a trucking fleet',
  'Platformă web care arată pe hartă, în timp real, fiecare camion, cu alerte pentru motor, combustibil și orele de condus.',
  'A web platform that shows every truck on a live map, with alerts for engine, fuel and driving hours.',
  'Poziția, starea motorului, combustibilul și orele de condus ale fiecărui camion se actualizează la fiecare două secunde. Problemele devin alerte înainte să oprească marfa. Platforma rulează pe date simulate.',
  'Every truck''s position, engine state, fuel and driving hours refresh every two seconds. Problems become alerts before they stop the freight. The platform runs on simulated data.',
  'Aplicație web', 'Web app',
  array['Aplicație web', 'Telemetrie live', 'Hărți', 'Roluri și permisiuni', 'Date sensibile', '2026'],
  array['Web app', 'Live telemetry', 'Maps', 'Role-based access', 'Sensitive data', '2026'],
  2026,
  array['Web app', 'Live telemetry', 'Interactive maps', '3D view', 'Role-based access', 'Cloud database'],
  'web-app', false,
  'Consola de dispecerat cu harta live a camioanelor',
  'The dispatch console with the live truck map',
  'Consola de dispecerat cu harta live a camioanelor',
  'The dispatch console with the live truck map',

  $t$O flotă de camioane de lungă distanță are nevoie de informație din mai multe locuri: poziția vine de la un furnizor de telematică, dosarele șoferilor se țin separat, iar destinatarul mărfii vrea să știe unde e încărcătura. Când aceste surse nu se întâlnesc, dispecerul află de supraîncălzirea motorului sau de rezervorul gol abia când camionul s-a oprit.

Există și reguli legale. În SUA, depășirea celor 11 ore de condus (regula FMCSA Hours of Service) înseamnă oprire obligatorie și risc de amendă. În plus, dosarul unui șofer conține date foarte sensibile, precum numărul de asigurare socială (SSN), permisul CDL și fișa medicală, care cer un loc controlat și un jurnal al accesului.$t$,
  $t$A long-haul trucking fleet needs information from several places: position comes from a telematics provider, driver files are kept separately, and whoever receives the freight wants to know where it is. When these sources don't meet, the dispatcher learns about an overheating engine or an empty tank only once the truck has stopped.

There are legal rules too. In the US, driving past 11 hours (the FMCSA Hours of Service rule) means a mandatory stop and a risk of fines. On top of that, a driver file holds highly sensitive data, such as the Social Security number (SSN), CDL licence and medical card, which calls for a controlled home and an access log.$t$,

  $t$Am pornit de la ziua de lucru a dispecerului: ce trebuie să vadă dintr-o privire, ce îl alarmează și ce poate ignora. De aici au ieșit pragurile de alertă (temperatura motorului, combustibil, ore de condus, întârziere), separarea dintre o defecțiune și un eveniment de rută, și cele trei feluri de utilizatori, fiecare cu ecranul lui: managerul sau dispecerul, șoferul și destinatarul mărfii, care nu are cont.

Fluxul de date merge într-o singură direcție. Un simulator produce citiri la fiecare două secunde și le trimite către hartă, modelul 3D al camionului, alerte, panoul șoferului și pagina publică de urmărire, toate văzând aceleași date. Platforma are și un adaptor care preia poziția și citirile de motor de la un furnizor de telematică, dar l-am testat doar izolat, nu pe un cont real. Valorile pe care furnizorul nu le oferă, precum ruta, ora estimată de sosire sau starea mărfii, nu sunt completate artificial: sunt păstrate separat, ca să nu inventăm date.

Accesul îl hotărăște baza de date, nu interfața. Managerul vede toată flota, șoferul vede doar camionul și remorca repartizate, iar clientul final vede doar poziția, ora estimată de sosire și dacă marfa e la timp sau întârziată. Conturile de manager nu se pot crea singure, orice înregistrare publică devine șofer, iar browserul nu poate scrie telemetrie. SSN-ul șoferilor este criptat, iar fiecare dezvăluire cere un motiv și este înregistrată.

Câteva decizii au ghidat restul. Un eveniment de zonă geografică nu este defecțiune și nu apare niciodată în roșu, ca dispecerul să nu fie alarmat degeaba. Revizia tehnică se calculează după kilometraj, nu după calendar. Pentru a demonstra tot lanțul, am adăugat scenarii de test: injectezi o defecțiune și urmărești alerta, reacția și revenirea la normal.$t$,
  $t$We started from the dispatcher's working day: what they need at a glance, what should alarm them and what they can ignore. That produced the alert thresholds (engine temperature, fuel, driving hours, delay), a split between a fault and a route event, and three kinds of users, each with their own screen: the manager or dispatcher, the driver, and the person receiving the freight, who has no account.

The data flows one way. A simulator produces readings every two seconds and feeds them to the map, the 3D truck model, the alerts, the driver screen and the public tracking page, so they all see the same data. The platform also has an adapter that pulls position and engine readings from a telematics provider, but we have tested it only in isolation, not against a real account. Values the provider does not supply, such as the route, estimated arrival or cargo state, are not filled in artificially: they are stored separately, so we never invent data.

Access is decided by the database, not by the interface. The manager sees the whole fleet, the driver sees only the assigned truck and trailer, and the end customer sees only position, estimated arrival and whether the freight is on time or delayed. Manager accounts cannot be created by self-registration, any public sign-up becomes a driver, and the browser cannot write telemetry. Driver SSNs are encrypted, and every reveal requires a reason and is logged.

A few decisions guided the rest. A geofence event is not a fault and is never shown in red, so the dispatcher is not alarmed for nothing. Service is due by mileage, not by calendar date. To prove the whole chain, we added test scenarios: inject a fault and watch the alert, the reaction and the recovery.$t$,

  $t$Rezultatul este o platformă funcțională, demonstrată pe date simulate. Dispecerul are o singură consolă în loc de mai multe surse: vede toată flota pe hartă, primește alerte pentru motor, combustibil, ore de condus și întârzieri, și poate verifica în scenarii de test cum apare, evoluează și dispare o problemă. Destinatarul mărfii are o pagină publică simplă, fără cont și fără vocabularul intern al dispeceratului.

Datele sensibile ale șoferilor au un singur loc controlat, cu jurnal de acces, iar regulile de acces sunt impuse de baza de date. Platforma nu a rulat încă într-o flotă reală și nici pe un cont real de telematică. Ce arată proiectul este fundația: modelul de date, rolurile, alertele și fluxul, gata de conectat la o sursă reală de date.$t$,
  $t$The result is a working platform, demonstrated on simulated data. The dispatcher has one console instead of several sources: the whole fleet on a map, alerts for engine, fuel, driving hours and delays, and test scenarios that show how a problem appears, develops and clears. The person receiving the freight gets a simple public page, with no account and none of the dispatch vocabulary.

Sensitive driver data has one controlled home with an access log, and access rules are enforced by the database. The platform has not yet run on a real fleet or against a real telematics account. What the project shows is the foundation: the data model, the roles, the alerts and the flow, ready to be connected to a real data source.$t$,

  'Să construim o platformă care adună într-un singur loc starea fiecărui camion, a fiecărui șofer și a fiecărei livrări, astfel încât dispecerul să reacționeze înainte ca o problemă să oprească marfa.',
  'To build a platform that brings every truck, driver and delivery into one place, so the dispatcher can act before a problem stops the freight.',

  $j$[
    {"k": "Date sensibile", "v": "SSN-ul șoferilor nu poate fi stocat sau transmis în clar, iar fiecare vizualizare trebuie justificată și înregistrată"},
    {"k": "Roluri separate", "v": "Managerul vede toată flota; șoferul vede doar camionul și remorca lui, regulă impusă în baza de date, nu doar în interfață"},
    {"k": "Destinatar fără cont", "v": "Clientul final trebuie să vadă poziția și ora estimată de sosire fără să se înregistreze și fără jargon intern"},
    {"k": "Reguli din industria americană", "v": "Limitele de ore de condus (FMCSA), clasele de permis CDL, termenele pentru fișa medicală și TWIC"},
    {"k": "Telematică existentă", "v": "Datele unui furnizor de telematică nu includ rute, oră estimată de sosire sau starea mărfii; trebuiau adaptate fără valori inventate"}
  ]$j$::jsonb,
  $j$[
    {"k": "Sensitive data", "v": "Driver SSNs can never be stored or sent in plain text, and every reveal must be justified and logged"},
    {"k": "Separate roles", "v": "The manager sees the whole fleet; a driver sees only their own truck and trailer, enforced in the database, not just the interface"},
    {"k": "Recipient without an account", "v": "The end customer must see position and estimated arrival without signing up and without internal jargon"},
    {"k": "US industry rules", "v": "Driving-hours limits (FMCSA), CDL licence classes, medical card and TWIC expiry dates"},
    {"k": "Existing telematics", "v": "A telematics provider's data has no routes, estimated arrival or cargo state; it had to be adapted without invented values"}
  ]$j$::jsonb,

  $j$[
    "Dispecerul vede toată flota într-un singur loc și află de o problemă de motor, combustibil sau ore de condus din alerte, nu din oprirea camionului.",
    "Un eveniment de rută nu este o defecțiune, deci nu apare în roșu: dispecerul nu e alarmat degeaba.",
    "Destinatarul mărfii urmărește livrarea pe o pagină simplă, fără cont, în loc să sune.",
    "Datele sensibile ale șoferilor au un singur loc controlat, cu motiv obligatoriu și jurnal de acces.",
    "Fiecare vede doar ce îi aparține: managerul, șoferul și clientul final au ecrane și drepturi separate."
  ]$j$::jsonb,
  $j$[
    "The dispatcher sees the whole fleet in one place and learns about an engine, fuel or driving-hours problem from alerts, not from the truck stopping.",
    "A route event is not a fault, so it is never red: the dispatcher is not alarmed for nothing.",
    "The person receiving the freight follows the delivery on a simple page, with no account, instead of calling.",
    "Sensitive driver data has one controlled home, with a mandatory reason and an access log.",
    "Everyone sees only what is theirs: the manager, the driver and the end customer have separate screens and rights."
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
 where project_id = (select id from public.projects where slug_ro = 'fleet-digital-twin');

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Aplicație web', 'Web app', 0),
   ('Module', 'Modules', 'Hartă live, Geamăn 3D, Alerte, Flotă, Șoferi, Rapoarte, Urmărire publică', 'Live map, 3D twin, Alerts, Fleet, Drivers, Reports, Public tracking', 1),
   ('Utilizatori', 'Users', 'Manager / dispecer, Șofer, Client final (fără cont)', 'Manager / dispatcher, Driver, End customer (no account)', 2),
   ('Date', 'Data', 'Simulate (mod demo)', 'Simulated (demo mode)', 3)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'fleet-digital-twin';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'fleet-digital-twin');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Web app', 'Consolă de dispecerat, ecran pentru șofer și pagină publică de urmărire, într-o singură aplicație', 'Dispatch console, driver screen and public tracking page in one application', 0),
   ('Live telemetry', 'Poziția și citirile de motor, combustibil și ore de condus, reîmprospătate la fiecare două secunde', 'Position and engine, fuel and driving-hours readings, refreshed every two seconds', 1),
   ('Interactive maps', 'Camioanele, traseele și zonele geografice pe o hartă live', 'Trucks, routes and geofences on a live map', 2),
   ('3D view', 'Un model 3D al camionului, sincronizat cu datele', 'A 3D truck model, in sync with the data', 3),
   ('Role-based access', 'Managerul, șoferul și clientul public văd fiecare doar ce le aparține, impus la nivel de bază de date', 'Manager, driver and public customer each see only what is theirs, enforced at database level', 4),
   ('Cloud database', 'Stochează flota, șoferii, telemetria și alertele; datele personale sensibile sunt criptate', 'Stores fleet, drivers, telemetry and alerts; sensitive personal data is encrypted', 5)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'fleet-digital-twin';
