-- Bloom Florist: STAR copy, from CASE_STUDY_BRIEF_bloom-florist.md in the project
-- repo. The task is the goal reached together with the client, the action is the
-- process (workflows, roles, data flow) rather than the screens, and the tech
-- column lists capabilities instead of frameworks.
--
-- Only what the code proves. No figures: gains, savings and cost stay empty until
-- the client provides them, and the quote stays empty until the client confirms
-- one. No "Client" fact. Online payments and the 6-month maintenance paragraph are
-- left out: not verified / not confirmed for this project.
-- Slug, dates, featured, sort order, images and links are not touched.

update public.projects set
  title_ro = $t$Am construit pentru o florărie din Moldova un sistem care leagă comenzile, stocul și rapoartele într-un singur loc$t$,
  title_en = $t$We built a system for a Moldovan flower shop that brings orders, stock and reports into one place$t$,
  card_title_ro = $t$Comenzi și stocuri pentru o florărie$t$,
  card_title_en = $t$Orders and stock for a flower shop$t$,
  summary_ro = $t$Aplicație web internă în care echipa florăriei preia comenzi, urmărește stocul de flori și vede profitul pe fiecare produs.$t$,
  summary_en = $t$An internal web app where the flower shop team takes orders, tracks flower stock and sees the profit on every product.$t$,
  lead_ro = $t$Vânzătorii preiau comenzi și vânzări din magazin, stocul se actualizează singur, iar administratorul vede zilnic venitul, pierderile și marja pe fiecare produs.$t$,
  lead_en = $t$Sellers take orders and in-store sales, stock updates itself, and the owner sees daily revenue, losses and margin per product.$t$,
  kind_ro = 'Aplicație web de management (uz intern)',
  kind_en = 'Internal management web app',
  tags_ro = array['Aplicație web', 'Comenzi', 'Stocuri', 'Rapoarte', 'Roluri', 'RO / EN'],
  tags_en = array['Web app', 'Orders', 'Inventory', 'Reports', 'Roles', 'RO / EN'],
  tech = array['Web app', 'Cloud database', 'Role-based access', 'Stock tracking', 'Audit trail', 'Bilingual interface'],

  context_body_ro = $t$Florăria lucrează cu marfă care se strică repede și cu comenzi care vin pe mai multe canale: telefon, magazin, livrări programate. Fără un sistem comun, cine preia comanda nu știe sigur ce flori mai sunt în stoc, iar proprietarul află abia la sfârșitul lunii cât s-a pierdut din flori ofilite sau deteriorate.

Problema conta pentru că în florărie marja se pierde în detalii: un buchet vândut sub costul real, un lot de trandafiri aruncat, o comandă uitată pentru ziua de mâine.$t$,
  context_body_en = $t$The shop deals with stock that spoils fast and with orders coming from several channels: phone, walk-ins, scheduled deliveries. Without a shared system, whoever takes an order can't be sure what flowers are left, and the owner only learns at month's end how much was lost to wilted or damaged stock.

It mattered because a florist's margin leaks through small things: a bouquet sold below its real cost, a batch of roses thrown away, an order forgotten for tomorrow.$t$,

  star_goal_ro = $t$Să găsim împreună cu echipa florăriei o soluție care ține comenzile, stocul și costurile într-un singur loc, astfel încât vânzătorii să lucreze rapid, iar proprietarul să vadă unde câștigă și unde pierde.$t$,
  star_goal_en = $t$Find, together with the shop's team, a solution that keeps orders, stock and costs in one place, so sellers can work fast and the owner can see where the business earns and where it loses.$t$,

  star_constraints_ro = $j$[
    {"k": "Date financiare protejate", "v": "Vânzătorii lucrează cu stocul, dar nu văd prețurile de achiziție, marja și profitul; regulile sunt aplicate în baza de date, nu doar în interfață"},
    {"k": "Stoc corect cu mai mulți oameni simultan", "v": "Doi vânzători pot vinde aceeași floare în același minut; stocul nu are voie să scadă sub zero, iar o comandă anulată returnează marfa o singură dată"},
    {"k": "Utilizatori", "v": "Vânzători fără pregătire tehnică, care lucrează în picioare, pe telefon"},
    {"k": "Cost real", "v": "Același trandafir costă diferit de la o livrare la alta, deci costul se recalculează la fiecare recepție, ca profitul raportat să fie cel real"},
    {"k": "Limbi", "v": "Interfața funcționează în română și engleză"}
  ]$j$::jsonb,
  star_constraints_en = $j$[
    {"k": "Protected financial data", "v": "Sellers work with stock but never see purchase prices, margins or profit; the rules are enforced in the database, not only in the interface"},
    {"k": "Correct stock with many people at once", "v": "Two sellers can sell the same flower in the same minute; stock can never go below zero, and a cancelled order returns its items exactly once"},
    {"k": "Users", "v": "Non-technical sellers who work standing up, on their phones"},
    {"k": "Real cost", "v": "The same rose costs differently from one delivery to the next, so cost is recomputed on every delivery to keep reported profit real"},
    {"k": "Languages", "v": "The interface works in Romanian and English"}
  ]$j$::jsonb,

  solution_body_ro = $t$Nu am început cu ecrane. Am început cu ziua de lucru a florăriei și am stabilit împreună cu clientul cine face ce: vânzătorul preia comenzile și servește clienții din magazin, administratorul primește marfa de la furnizori, fixează prețurile și urmărește cifrele. Am urmărit apoi drumul unei flori, de la livrarea furnizorului, prin comandă sau vânzare directă, până la buchetul livrat sau la pierdere, și am scris pentru fiecare etapă un document de proiectare înainte de cod.

Am construit în etape, urmând aceeași zi: dimineața administratorul vede comenzile zilei și stocul care se termină, vânzătorii mută comenzile din „Confirmată” în „În lucru” și „Gata”, marfa nouă se recepționează cu furnizorul atașat, florile stricate se trec ca pierdere cu motiv, iar seara rapoartele arată venitul, profitul și pierderile perioadei. Fiecare acțiune importantă rămâne într-un jurnal care arată cine a făcut ce și când.$t$,
  solution_body_en = $t$We did not start with screens. We started with the shop's working day and set, together with the client, who does what: the seller takes orders and serves walk-in customers; the admin receives supplier deliveries, sets prices and watches the numbers. We then traced a flower's path, from supplier delivery, through an order or a walk-in sale, to a delivered bouquet or a write-off, and wrote a design document for each stage before any code.

We built in stages, following that same day: in the morning the admin sees today's orders and low stock, sellers move orders from "Confirmed" to "In progress" and "Ready", new stock is received with the supplier recorded, damaged flowers are written off with a reason, and in the evening reports show revenue, profit and losses for the period. Every important action stays in a log of who did what and when.$t$,

  star_biz_ro = $j$[
    "Am stabilit împreună cu clientul rolurile: ce poate face și ce vede vânzătorul, respectiv administratorul.",
    "Am urmărit drumul unei flori, de la furnizor la client sau la pierdere, și am scris un document de proiectare pentru fiecare etapă.",
    "Stocul se rezervă la crearea comenzii, ca florile promise unui client să nu fie vândute altuia.",
    "Vânzarea din magazin folosește același flux ca o comandă, într-un mod rapid, ca echipa să învețe un singur mod de lucru.",
    "Pierderile se înregistrează cu motiv, iar fiecare recepție de marfă are un furnizor, ca proprietarul să vadă de ce și de unde se pierde.",
    "Datele financiare rămân confidențiale, iar fiecare acțiune importantă are un autor în jurnal."
  ]$j$::jsonb,
  star_biz_en = $j$[
    "We agreed the roles with the client: what the seller and the admin can do and see.",
    "We traced a flower's path, from supplier to customer or to write-off, and wrote a design document for each stage.",
    "Stock is reserved when an order is created, so flowers promised to one customer can't be sold to another.",
    "Walk-in sales reuse the order flow in a quick mode, so staff learn one way of working.",
    "Losses are recorded with a reason and every delivery has a supplier, so the owner sees why and from where stock is lost.",
    "Financial data stays confidential, and every important action has an author in the log."
  ]$j$::jsonb,

  result_body_ro = $t$Florăria lucrează acum dintr-un singur loc: comanda preluată la telefon rezervă imediat florile, vânzarea din magazin scade stocul, iar recepția de marfă actualizează costul. Proprietarul vede în fiecare zi venitul, ce produse aduc profit, ce stoc se termină și de ce se pierde marfă, fără să adune cifre din caiete.

Vânzătorii nu mai pot vinde ce nu există, iar orice modificare are un autor în jurnal.$t$,
  result_body_en = $t$The shop now works from one place: a phone order reserves the flowers right away, a walk-in sale lowers stock, and each delivery updates the cost. Every day the owner sees revenue, which products make a profit, what is running low and why stock gets lost, without adding up numbers from notebooks.

Sellers can no longer sell what isn't there, and every change has an author in the log.$t$
where slug_ro = 'bloom';

-- The live "Client" fact stays: the client is already named on the public page.
delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'bloom')
   and label_en <> 'Client';

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order + 1
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Aplicație web internă', 'Internal web app', 0),
   ('Module', 'Modules', 'Comenzi, vânzări în magazin, stocuri, pierderi, furnizori, rapoarte, utilizatori, jurnal de activitate', 'Orders, walk-in sales, inventory, losses, suppliers, reports, users, activity log', 1),
   ('Roluri', 'Roles', 'Administrator și vânzător', 'Admin and seller', 2),
   ('Limbi', 'Languages', 'Română, engleză', 'Romanian, English', 3)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'bloom';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'bloom');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Web app', 'Aplicație care merge în browser, pe calculator și pe telefon, fără instalare', 'Runs in the browser on desktop and phone, nothing to install', 0),
   ('Cloud database', 'Toate datele florăriei într-o bază de date în cloud, într-un singur loc', 'All shop data in a managed cloud database, in one place', 1),
   ('Role-based access', 'Administratorul și vânzătorul văd și pot face lucruri diferite; regulile sunt aplicate în baza de date', 'Admin and seller see and do different things; the rules live in the database', 2),
   ('Stock ledger', 'Fiecare mișcare de stoc e o înregistrare în istoric; stocul și costul mediu se calculează automat', 'Every stock movement is a ledger entry; stock and average cost update automatically', 3),
   ('Safe order creation', 'Comanda și produsele ei se salvează împreună sau deloc; prețurile și numărul comenzii le stabilește serverul', 'An order and its items save together or not at all; prices and order number are set by the server', 4),
   ('Audit trail', 'Jurnal cu cine a făcut ce și când, care nu poate fi falsificat din aplicație', 'A log of who did what and when that cannot be forged from the app', 5)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'bloom';
