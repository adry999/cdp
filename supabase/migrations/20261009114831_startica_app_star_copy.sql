-- Startica admin app: STAR copy. The task is the goal reached together with the
-- client, the action is the process (requirements, data flow, roles) rather than
-- the screens, and the tech column lists capabilities instead of frameworks.
-- No figures: gains, savings and cost stay empty until the client provides them,
-- and the quote stays empty until the client confirms one.

update public.projects set
  context_body_ro = 'Administrația lucra în mai multe locuri deodată: prezența se nota pe grupe, plățile se țineau separat, iar cheltuielile și raportul pentru contabilitate se adunau manual la sfârșit de lună. Fiecare filială avea propria evidență, așa că o imagine de ansamblu cerea timp și verificări repetate. Și pentru că era vorba de bani, fiecare plată scăpată sau înregistrată greșit costa direct.

Grădinița avea nevoie de un singur loc în care să vadă, în fiecare zi, cine e prezent, cine a achitat și cât s-a cheltuit, la nivel de filială și pe total.',
  context_body_en = 'The administration worked in several places at once: attendance was recorded per group, payments were tracked separately, and expenses and the accounting report were compiled by hand at the end of the month. Each branch kept its own records, so getting the full picture took time and repeated checks. And because this was money, every missed or mistyped payment had a direct cost.

The kindergarten needed one place to see, every day, who is present, who has paid and how much was spent, per branch and in total.',

  star_goal_ro = 'Să găsim împreună o soluție care accelerează colectarea, evidența și procesarea plăților, cu vizibilitate clară asupra proceselor interne, astfel încât munca manuală să scadă, iar restanțele să fie depistate la timp.',
  star_goal_en = 'Find, together with the client, a way to speed up how payments are collected, recorded and processed, with clear visibility into internal processes, so that manual work drops and arrears are caught in time.',

  star_constraints_ro = '[
    {"k": "Date sensibile", "v": "Informații financiare și date despre copii, accesibile doar pe roluri"},
    {"k": "Filiale", "v": "Fiecare cu evidența ei, reunite într-un singur raport"},
    {"k": "Utilizatori", "v": "Administratori fără pregătire tehnică, care lucrează în ritmul zilei"},
    {"k": "Contabilitate", "v": "Raportul lunar trebuie să respecte structura cerută de contabil"},
    {"k": "Corectitudine", "v": "Sumele sunt bani reali: orice eroare costă direct"}
  ]'::jsonb,
  star_constraints_en = '[
    {"k": "Sensitive data", "v": "Financial records and children''s data, accessible by role only"},
    {"k": "Branches", "v": "Each with its own records, brought together in one report"},
    {"k": "Users", "v": "Non-technical administrators working at the pace of the day"},
    {"k": "Accounting", "v": "The monthly report must follow the structure the accountant needs"},
    {"k": "Accuracy", "v": "The amounts are real money: every error has a direct cost"}
  ]'::jsonb,

  solution_body_ro = 'Nu am început cu ecrane. Am început cu ziua de lucru a administrației: am urmărit cum circulă informația între filiale, educatori și contabil și am notat unde se pierde timp și unde apar erori. Din aceste discuții a ieșit un document de cerințe (Product Requirements), validat împreună cu clientul înainte de prima linie de cod.

Pe baza lui am construit o aplicație care urmează ritmul zilei: dimineața prezența, pe parcursul zilei achitările cu bon tipărit pe loc și cheltuielile, la final de lună raportul pentru contabilitate. Restanțele se văd imediat, iar părinții pot fi anunțați prin SMS direct din aplicație.',
  solution_body_en = 'We did not start with screens. We started with the administration''s working day: we followed how information moves between branches, teachers and the accountant, and noted where time is lost and where errors creep in. Those conversations became a Product Requirements document, agreed with the client before the first line of code.

From it we built an app that follows the rhythm of the day: attendance in the morning, payments with a receipt printed on the spot and expenses during the day, the accounting report at the end of the month. Arrears show up right away, and parents can be notified by SMS straight from the app.',

  star_biz_ro = '[
    "Am scris împreună cu administrația un document de cerințe, pornind de la ziua lor reală de lucru.",
    "Am analizat cum circulă datele între persoanele cheie: cine le introduce, cine le verifică și cine are nevoie de ele.",
    "Am stabilit roluri și limite de acces, ca datele financiare și cele despre copii să rămână confidențiale.",
    "Am definit reguli clare pentru sume, restanțe și rapoarte, pentru că într-un sistem financiar greșelile costă bani."
  ]'::jsonb,
  star_biz_en = '[
    "We wrote a requirements document together with the administration, starting from their real working day.",
    "We mapped how data moves between key people: who enters it, who checks it and who needs it.",
    "We set roles and access limits, so financial records and children''s data stay confidential.",
    "We defined clear rules for amounts, arrears and reports, because in a financial system mistakes cost money."
  ]'::jsonb,

  result_body_ro = 'Administrația lucrează acum într-o singură aplicație pentru toate filialele. Prezența, plățile și cheltuielile se văd în timp real, restanțele sunt vizibile din prima zi, iar raportul pentru contabilitate se generează fără calcule manuale.

Proiectul nu s-a încheiat la lansare: aplicația beneficiază de 6 luni de mentenanță, în care reparăm orice eroare sau situație neprevăzută apărută în lucrul de zi cu zi.',
  result_body_en = 'The administration now works in a single app for all branches. Attendance, payments and expenses are visible in real time, arrears show up from day one, and the accounting report is generated without manual calculations.

The project did not end at launch: the app comes with 6 months of maintenance, during which we fix any bug or unexpected issue that turns up in day-to-day use.'
where slug_ro = 'startica-app';

delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'startica-app');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Aplicație web', 'Interfața de zi cu zi pentru prezență, achitări și cheltuieli', 'The day-to-day interface for attendance, payments and expenses', 0),
   ('Bază de date în cloud', 'Datele tuturor filialelor într-un singur loc, sincronizate', 'Every branch''s data in one place, kept in sync', 1),
   ('Integrare SMS', 'Notificări către părinții cu restanțe, trimise din aplicație', 'Notifications to parents with arrears, sent from the app', 2),
   ('Plăți', 'Încasări pe metode de plată, cu bon tipărit pe loc', 'Payments by method, with a receipt printed on the spot', 3),
   ('Raport contabil', 'Datele lunii în structura cerută de contabil, fără recalculări', 'The month''s data in the structure the accountant needs, with no recalculation', 4)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'startica-app';
