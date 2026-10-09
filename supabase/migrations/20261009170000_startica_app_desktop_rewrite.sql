-- Startica app: full rewrite as the Windows desktop app. This replaces the mixed
-- copy set by 20261005120100_seed_case_studies_v2.sql, 20261009114831_startica_app_star_copy.sql
-- and 20261009115652_startica_app_stack_names.sql, which described a web app with
-- a cloud database and real-time data and so mixed in another product.
--
-- Source: CASE_STUDY_BRIEF_Startica_app.md (repo startica-portable-app). Only what
-- the code proves is used; items the brief marks "(dedus)" appear softened or not
-- at all, and nothing marked "[DE CONFIRMAT]" is stated as a fact.
--
-- Left out on purpose:
--   * how the kindergarten worked before (unconfirmed), so the situation describes
--     the problem space only;
--   * any figure, saving, gain, quote or real data count (children, payments,
--     expenses): none confirmed or cleared for publication;
--   * any link; the live "Client" fact is kept, since the client is already named
--     on the public page (as for startica-site);
--   * branch sync as a live feature: the sync server is not in production at the
--     client yet, so it is presented as "ready for several computers and branches";
--   * obstacles and changes blocks: both described sync and real-time work that is
--     not live, so they are emptied (the page hides an empty block);
--   * SMS "reminders": SMS goes out only when a person sends it, never automatically.
-- Slug, year, dates, featured, service tag, sort order, images and links are not
-- touched. Idempotent: re-running yields the same rows.

update public.projects set
  title_ro = $t$O aplicație pentru o grădiniță privată din Chișinău, care ține împreună copiii, banii și echipa, în ambele filiale$t$,
  title_en = $t$One app for a private kindergarten in Chișinău, keeping its children, money and staff together, across both branches$t$,
  card_title_ro = $t$Evidența unei grădinițe cu două filiale$t$,
  card_title_en = $t$Running a two-branch kindergarten$t$,
  summary_ro = $t$Aplicație pentru directoarea și contabila unei grădinițe private: copii, prezență, plăți în euro încasate în lei, SMS către părinți și rapoarte pentru contabilitate.$t$,
  summary_en = $t$An app for the director and accountant of a private kindergarten: children, attendance, euro-priced fees paid in lei, SMS to parents and accounting reports.$t$,
  lead_ro = $t$Taxa e stabilită în euro, părinții plătesc în lei, iar fiecare filială are calculatoarele ei. Împreună cu clientul am transformat aceste reguli într-o aplicație care merge și fără internet și e pregătită pentru mai multe calculatoare și filiale.$t$,
  lead_en = $t$Fees are set in euros, parents pay in lei, and each branch runs its own computers. Together with the client we turned these rules into an app that works without internet and is ready for several computers and branches.$t$,
  kind_ro = 'Aplicație desktop pentru Windows',
  kind_en = 'Windows desktop app',
  tags_ro = array['Aplicație desktop', 'Plăți EUR/MDL', 'SMS', 'Filiale', 'Lucrează offline'],
  tags_en = array['Desktop app', 'EUR/MDL payments', 'SMS', 'Multi-branch', 'Works offline'],
  tech = array['Desktop app', 'Local database', 'Offline mode', 'Multi-branch sync', 'Payments & exchange rates', 'SMS integration', 'Accounting export', 'Access profiles', 'Automatic backup'],
  cover_alt_ro = $t$Aplicație desktop pentru evidența unei grădinițe cu două filiale$t$,
  cover_alt_en = $t$Desktop app for running a two-branch kindergarten$t$,
  hero_alt_ro = $t$Aplicație desktop pentru evidența unei grădinițe cu două filiale$t$,
  hero_alt_en = $t$Desktop app for running a two-branch kindergarten$t$,

  context_body_ro = $t$O grădiniță privată cu două filiale ține evidența a zeci de lucruri mici în fiecare zi: cine a venit, cine a plătit, cine trebuie anunțat, ce se gătește, cine din echipă e în concediu. Taxa lunară e stabilită în euro, dar părinții plătesc în lei, în numerar, cu cardul sau prin transfer, uneori pentru mai multe luni deodată sau pentru doi frați.

Fiecare plată trebuie convertită la cursul Băncii Naționale din ziua încasării, repartizată pe luni și regăsită apoi în raportul pentru contabilitate. În plus, fiecare filială are calculatoarele ei, personalul e comun, iar aplicația are de acoperit multe domenii deodată: copii, prezență, bazin, vizite, meniu, personal și salarii, acorduri pentru părinți.$t$,
  context_body_en = $t$A private kindergarten with two branches tracks dozens of small things every day: who came in, who paid, who needs a reminder, what is for lunch, who on the staff is on leave. The monthly fee is set in euros, but parents pay in lei, by cash, card or bank transfer, sometimes for several months at once or for two siblings.

Each payment has to be converted at the National Bank rate of the day it is received, spread across months, and then found again in the accountant's report. On top of that, each branch has its own computers, the staff is shared, and the app has to cover many areas at once: children, attendance, pool, visits, menu, staff and payroll, parent agreements.$t$,

  star_goal_ro = $t$Să găsim împreună cu echipa grădiniței o soluție care adună copiii, plățile, prezența și personalul într-un singur loc, astfel încât directoarea să vadă oricând cine a plătit și cine trebuie anunțat, fără să depindă de internet.$t$,
  star_goal_en = $t$Find, together with the kindergarten team, a solution that brings children, payments, attendance and staff into one place, so the director can always see who has paid and who needs a reminder, without depending on the internet.$t$,

  star_constraints_ro = $j$[
    {"k": "Două monede", "v": "Prețul e în euro, încasarea în lei, la cursul Băncii Naționale din ziua plății. Cursul se îngheață pe plată, iar plata se împarte pe luni, ca restanța, calculată în lei, să nu se schimbe singură când se mișcă cursul"},
    {"k": "Fără internet garantat", "v": "Aplicația merge complet pe calculator, fără conexiune"},
    {"k": "Mai multe calculatoare și filiale", "v": "Fiecare filială are calculatoarele ei, personalul e comun, iar aplicația e pregătită pentru mai multe calculatoare și filiale; când două calculatoare modifică același lucru, aplicația arată diferența, nu alege în locul omului"},
    {"k": "Date sensibile despre copii și personal", "v": "Accesul se dă pe calculator și pe modul, salariile stau sub PIN, iar datele medicale nu pleacă niciodată prin Telegram"},
    {"k": "Utilizatori", "v": "Educatoare, recepție și contabilă fără pregătire tehnică; fiecare vede doar ce îi trebuie, iar ștergerea definitivă cere o confirmare scrisă"}
  ]$j$::jsonb,
  star_constraints_en = $j$[
    {"k": "Two currencies", "v": "The price is in euros, payment is in lei, at the National Bank rate of the payment day. The rate is frozen on each payment and the payment is split across months, so that debt, counted in lei, does not drift when the rate moves"},
    {"k": "No guaranteed internet", "v": "The app runs fully on the computer, with no connection needed"},
    {"k": "Several computers and branches", "v": "Each branch has its own computers, the staff is shared, and the app is ready for several computers and branches; when two computers change the same thing, the app shows the difference instead of choosing for the person"},
    {"k": "Sensitive data about children and staff", "v": "Access is set per computer and per module, salaries sit behind a PIN, and medical data never goes out over Telegram"},
    {"k": "Users", "v": "Teachers, front desk and accountant without technical training; each sees only what they need, and permanent deletion asks for written confirmation"}
  ]$j$::jsonb,

  solution_body_ro = $t$Nu am început cu ecrane. Am pornit de la ziua de lucru a grădiniței: dimineața se marchează prezența, peste zi vin părinții la plată sau sosesc transferuri, seara se închide casa, la final de lună se pregătește raportul pentru contabilă. Am scris împreună cu clientul un document cu cerințele și o listă de decizii, cu dată, iar întrebările rămase deschise au stat pe o listă separată până au primit răspuns.

Apoi am construit în ordinea zilei, urmărind cine introduce ce: educatoarea marchează prezența, recepția programează vizitele părinților noi, contabila înregistrează plățile, iar directoarea vede încasările și ce cere atenție și primește un rezumat dimineața. Aplicația propune suma exactă la cursul zilei, o împarte pe luni și tipărește chitanța pe loc, inclusiv pe imprimanta termică de 58 mm. Transferurile fără nume clar ajung într-un loc separat, unde aplicația sugerează copilul.$t$,
  solution_body_en = $t$We did not start with screens. We started from the kindergarten's working day: attendance in the morning, parents paying or bank transfers arriving during the day, cash closed in the evening, the accountant's report prepared at month end. Together with the client we wrote a requirements document and a dated list of decisions, and open questions stayed on a separate list until they were answered.

Then we built in the order of the day, following who enters what: the teacher marks attendance, the front desk books visits from new parents, the accountant records payments, and the director sees income and what needs attention, with a morning summary. The app suggests the exact amount at the day's rate, splits it across months and prints the receipt on the spot, including on a 58 mm thermal printer. Transfers without a clear name land in a separate place, where the app suggests the child.$t$,

  star_biz_ro = $j$[
    "Am notat împreună cu clientul fiecare regulă de bani: o achitare acoperă un singur serviciu, diferențele de până la 5 lei se rotunjesc, iar un avans acoperă lunile următoare la cursul din ziua plății.",
    "Euro rămâne doar prețul; tot ce se încasează, se repartizează și se datorează e în lei, ca restanța să nu se schimbe când se mișcă cursul.",
    "Am stabilit fluxul datelor pe roluri: prezența o marchează educatoarele, vizitele le ține recepția, plățile le înregistrează contabila, iar directoarea primește rezumatul de dimineață.",
    "Prezența se marchează copil cu copil, fără „toți prezenți”: un copil neatins rămâne nemarcat, nu apare greșit ca prezent.",
    "SMS-urile către părinți pleacă doar la cererea unui om, cu previzualizare și limită lunară, niciodată automat.",
    "Datele se arhivează întâi, iar ștergerea definitivă se face doar din arhivă; accesul se dă pe calculator, cu profiluri pentru conducere, educator, recepție și bazin."
  ]$j$::jsonb,
  star_biz_en = $j$[
    "We wrote down every money rule with the client: one payment covers one service, differences up to 5 lei are rounded, and an advance covers the following months at the rate of the payment day.",
    "Euros stay only the price; everything collected, allocated and owed is in lei, so debt does not move with the exchange rate.",
    "We set the data flow by role: teachers mark attendance, the front desk handles visits, the accountant records payments, and the director gets the morning summary.",
    "Attendance is marked child by child, with no \"mark all present\": an untouched child stays unmarked instead of wrongly showing as present.",
    "SMS to parents goes out only when a person sends it, with a preview and a monthly cap, never automatically.",
    "Records are archived first and permanently deleted only from the archive; access is set per computer, with profiles for management, teacher, front desk and pool."
  ]$j$::jsonb,

  obstacles_body_ro = null,
  obstacles_body_en = null,
  changes_body_ro = null,
  changes_body_en = null,

  result_body_ro = $t$Grădinița lucrează acum într-o singură aplicație. Directoarea vede pe un ecran cine a plătit și cine e în urmă, restanțele se calculează singure, în lei, iar contabila scoate raportul pe lună, trimestru sau an direct în Excel. Chitanțele se tipăresc pe loc, aplicația merge și fără internet, iar fiecare modificare rămâne în istoric, cu copii de siguranță automate.

După lansare, Codepedia oferă 6 luni de mentenanță: reparăm erorile și ne ocupăm de situațiile neprevăzute.$t$,
  result_body_en = $t$The kindergarten now works in a single app. The director sees on one screen who has paid and who is behind, debt is calculated automatically in lei, and the accountant exports the monthly, quarterly or yearly report straight to Excel. Receipts are printed on the spot, the app works without internet, and every change stays in the history, with automatic backups.

After launch, Codepedia provides 6 months of maintenance: we fix bugs and handle unforeseen situations.$t$
where slug_ro = 'startica-app';

-- The live "Client" fact stays: the client is already named on the public page.
delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'startica-app')
   and label_en <> 'Client';

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order + 1
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Aplicație desktop pentru Windows', 'Windows desktop app', 0),
   ('Module', 'Modules', 'Copii, grupe, prezență, meniu, bazin, vizite, personal, achitări, cheltuieli, SMS, raport contabil', 'Children, groups, attendance, menu, pool, visits, staff, payments, expenses, SMS, accounting report', 1),
   ('Filiale', 'Branches', '2, pregătită pentru sincronizare', '2, ready for sync', 2),
   ('Limbi', 'Languages', 'Interfață în română; meniul copiilor în română și rusă', 'Romanian interface; children''s menu in Romanian and Russian', 3)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'startica-app';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'startica-app');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Desktop app', 'Se instalează pe Windows fără drepturi de administrator și se deschide în propria fereastră', 'Installs on Windows without admin rights and opens in its own window', 0),
   ('Local database', 'Toate datele stau pe calculator', 'All data lives on the computer', 1),
   ('Offline mode', 'Aplicația merge complet fără internet', 'The app works fully without internet', 2),
   ('Multi-branch sync', 'Pregătită pentru mai multe calculatoare și filiale, cu conflictele arătate, nu ascunse; încă neactivă la client', 'Ready for several computers and branches, with conflicts shown rather than hidden; not yet live at the client', 3),
   ('Payments & exchange rates', 'Prețul în euro, încasarea în lei; cursul oficial al zilei se preia și se îngheață pe fiecare plată', 'Price in euros, payment in lei; the official daily rate is fetched and frozen on each payment', 4),
   ('SMS integration', 'Mesaje către părinți din șabloane, trimise doar la cererea unui om, cu previzualizare și limită lunară', 'Messages to parents from templates, sent only when a person asks, with a preview and a monthly cap', 5),
   ('Accounting export', 'Raport pe lună, trimestru sau an, exportat în Excel pentru contabilă', 'Monthly, quarterly or yearly report exported to Excel for the accountant', 6),
   ('Access profiles', 'Fiecare calculator vede doar modulele permise; salariile stau sub PIN', 'Each computer sees only its allowed modules; salaries sit behind a PIN', 7),
   ('Automatic backup', 'Copii de siguranță automate, păstrate pe zile și luni, cu copie într-un folder extern', 'Automatic backups kept by day and month, with a copy to an external folder', 8)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'startica-app';
