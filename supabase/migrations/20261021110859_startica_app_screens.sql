-- Startica app: the full set of screens from the portfolio package
-- (Proiecte pentru portfolio/Startica app/portofoliu/studiu-de-caz/imagini/). The PNGs
-- were 1600x1000 and are cropped to their top 1600x900 for the 16:9 frames; they live
-- in project-media/startica-app/. Screens show demo data (screens_demo stays true).
-- Text is unchanged: the package has no copy. Alt texts describe each module without
-- names or figures.
--
-- No delete (the Supabase MCP cancels migrations with delete): the two existing gallery
-- rows are repointed to the first two screens and the rest are inserted after them.

update public.projects
   set cover_path = 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/startica-app/cover/startica-dashboard-cover-1600x900.png',
       hero_path  = 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/startica-app/hero/startica-dashboard-cover-1600x900.png',
       cover_alt_ro = 'Dashboard Startica: rezumatul lunii cu încasări, cheltuieli, evoluția încasărilor, lucruri de rezolvat și zilele de naștere apropiate',
       cover_alt_en = 'Startica dashboard: monthly summary with income, expenses, income trend chart, items needing attention and upcoming birthdays',
       hero_alt_ro  = 'Dashboard Startica: rezumatul lunii cu încasări, cheltuieli, evoluția încasărilor, lucruri de rezolvat și zilele de naștere apropiate',
       hero_alt_en  = 'Startica dashboard: monthly summary with income, expenses, income trend chart, items needing attention and upcoming birthdays'
 where slug_ro = 'startica-app';

with screens(file, alt_ro, alt_en, sort_order) as (values
  ('startica-prima-pornire-1600x900.png', 'Prima pornire: asistentul de configurare, pasul de import al copiilor și plăților existente dintr-un fișier Excel', 'First-run setup: the configuration wizard on the step that imports existing children and payments from an Excel file', 0),
  ('startica-copii-1600x900.png', 'Copii: lista copiilor cu căutare, filtre după grupă și plată, selecție multiplă și acțiuni în masă', 'Children: list of children with search, group and payment filters, multi-select and bulk actions', 1),
  ('startica-fisa-copilului-1600x900.png', 'Fișa copilului: date personale, părinți, grupă, sold, plan și contract, istoric plăți și prezență lunară', 'Child profile: personal details, parents, group, balance, plan and contract, payment history and monthly attendance', 2),
  ('startica-acorduri-1600x900.png', 'Copii, Acorduri: panou lateral pentru alegerea acordului, a copiilor sau grupelor și a opțiunilor de tipărire', 'Children, Consent forms: side panel for choosing the form, the children or groups, and the print options', 3),
  ('startica-zile-de-nastere-1600x900.png', 'Zile de naștere: calendar lunar cu filtru pe grupe și lista zilelor de naștere din întreaga lună', 'Birthdays: monthly calendar with a group filter and the list of all birthdays in the month', 4),
  ('startica-grupe-1600x900.png', 'Grupe: carduri cu grupele și ocuparea lor, copiii fără grupă și mutarea prin tragere', 'Groups: group cards showing occupancy, the list of unassigned children and drag-and-drop assignment', 5),
  ('startica-prezenta-1600x900.png', 'Prezența: marcarea zilnică prezent, absent sau motivat pe grupe, cu rezumat și bară de progres', 'Attendance: daily present, absent or excused marking by group, with a summary and progress bar', 6),
  ('startica-meniu-1600x900.png', 'Meniu: meniul săptămânii pe zile și mese, cu felurile și gramajele, în română și rusă', 'Menu: the weekly menu by day and meal, with dishes and portion weights, shown in Romanian and Russian', 7),
  ('startica-bazin-1600x900.png', 'Bazin: orarul săptămânal al ședințelor cu programări pe ore și statusul prezenței fiecărui copil', $a$Pool: weekly session schedule with bookings by time slot and each child's attendance status$a$, 8),
  ('startica-vizite-1600x900.png', 'Vizite: calendar lunar al vizitelor de înscriere, detaliile vizitei selectate, statusuri și lista tuturor vizitelor', 'Visits: monthly calendar of enrolment visits, selected visit details, status buttons and the list of all visits', 9),
  ('startica-personal-1600x900.png', 'Personal: echipa pe departamente, cu funcția, grupa, telefonul și statusul de azi al fiecărui angajat', $a$Staff: the team by department, with role, group, phone and each employee's status for today$a$, 10),
  ('startica-pontaj-1600x900.png', 'Pontaj personal: foaie lunară pe zile cu lucrat, concediu, concediu medical și absențe, plus totaluri', 'Staff timesheet: monthly day grid showing worked days, leave, sick leave and absences, with totals', 11),
  ('startica-salarii-1600x900.png', 'Personal, Salarii: calculul lunar pe angajat cu avansuri, sumă de plătit, stare și plata în grup', 'Staff, Salaries: monthly per-employee calculation with advances, amount due, status and bulk payment', 12),
  ('startica-achitari-1600x900.png', 'Achitări: lista plăților grupată pe luni, cu filtre, plăți neasociate și detaliile plății selectate', 'Payments: payment list grouped by month, with filters, unassociated payments and selected payment details', 13),
  ('startica-achitare-noua-1600x900.png', 'Achitări, Achitare nouă: panou lateral cu plan, curs BNM, luni acoperite, sumă încasată și metodă de plată', 'Payments, New payment: side panel with plan, BNM rate, months covered, amount received and payment method', 14),
  ('startica-situatia-platilor-1600x900.png', 'Situația plăților: tabel pe luni cu starea plății fiecărui copil, soldul rămas și indicatori de încasare', $a$Payment status: month-by-month table of each child's payment state, outstanding balance and collection indicators$a$, 15),
  ('startica-de-notificat-1600x900.png', 'De notificat: părinții care trebuie anunțați despre plăți, cu șabloane de mesaj și trimitere SMS', 'To notify: parents to be alerted about payments, with message templates and SMS sending', 16),
  ('startica-de-rezolvat-1600x900.png', 'De rezolvat, Taxe și grupe: completarea grupei, taxei și scadenței pentru mai mulți copii deodată', 'To resolve, Fees and groups: filling in group, monthly fee and due day for several children at once', 17),
  ('startica-asociere-achitari-1600x900.png', 'Asociere achitări: plăți fără copil asociat și sugestii de potrivire cu copiii, cu buton de asociere', 'Payment matching: payments without an assigned child and suggested child matches with an associate button', 18),
  ('startica-cheltuieli-1600x900.png', 'Cheltuieli: adăugare rapidă, lista cheltuielilor pe zile și bugetul lunii pe categorii cu depășiri', 'Expenses: quick add form, expenses listed by day and the monthly budget by category with overruns', 19),
  ('startica-raport-contabil-1600x900.png', 'Raport contabil: încasări pe metode, cheltuieli pe categorii, plăți în EUR cu curs BNM și export pentru contabil', 'Accounting report: income by method, expenses by category, EUR payments at BNM rate and export for the accountant', 20),
  ('startica-sms-1600x900.png', 'Notificări, Mesaje SMS: istoricul mesajelor cu statistici, stare de livrare și detalii despre un mesaj nelivrat', 'Notifications, SMS messages: message history with statistics, delivery status and details of an undelivered message', 21),
  ('startica-sms-sabloane-1600x900.png', 'Notificări, Șabloane: editorul șabloanelor SMS cu câmpuri inserabile, previzualizare și setările furnizorului SMS', 'Notifications, Templates: SMS template editor with insertable fields, preview and SMS provider settings', 22),
  ('startica-istoric-1600x900.png', 'Istoric: jurnalul modificărilor pe zile, cu tipul acțiunii, filtre și posibilitatea de anulare', 'History: day-by-day log of changes with action type, filters and the option to undo', 23),
  ('startica-setari-module-1600x900.png', 'Backup și setări, Module: activarea sau oprirea modulelor pe filială, cu previzualizarea meniului', 'Backup and settings, Modules: switching modules on or off per branch, with a menu preview', 24),
  ('startica-sincronizare-1600x900.png', 'Backup și setări, Sincronizare: starea serverului și calculatoarele conectate ale filialelor, cu ultima sincronizare', 'Backup and settings, Sync: server status and the branch computers connected, with their last sync time', 25)
),
project as (select id from public.projects where slug_ro = 'startica-app'),
existing as (
  select i.id, row_number() over (order by i.sort_order, i.id) - 1 as rn
    from public.project_images i, project
   where i.project_id = project.id
     and i.path not like '%/project-media/startica-app/gallery/%'
),
repointed as (
  update public.project_images i
     set path = 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/startica-app/gallery/' || s.file,
         alt_ro = s.alt_ro, alt_en = s.alt_en, aspect = '16/9', sort_order = s.sort_order
    from existing e
    join screens s on s.sort_order = e.rn
   where i.id = e.id
  returning s.sort_order
)
insert into public.project_images (project_id, path, alt_ro, alt_en, aspect, sort_order)
select project.id, 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/startica-app/gallery/' || s.file,
       s.alt_ro, s.alt_en, '16/9', s.sort_order
  from screens s, project
 where s.sort_order not in (select sort_order from repointed)
   and not exists (
     select 1 from public.project_images x
      where x.project_id = project.id
        and x.path like '%/' || s.file
   );
