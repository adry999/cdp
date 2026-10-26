-- Startica app: shorter, demonstrative case study. Replaces the copy set by
-- 20261009170000_startica_app_desktop_rewrite.sql.
--
-- Why: the page now sells the idea, not one client. No city, no fixed branch
-- count, no full screen gallery. The full screens, business rules, design system
-- and tech details are kept for client presentations.
--
-- Kept from the previous migration: sync is "ready", not live; SMS only on
-- request; no unconfirmed figures, savings or quotes.
-- Slug, year, dates, featured, service tag, sort order and links are not touched.
-- hero_path and project_images.path: files live in public/projects/startica-app/
-- (served by @nuxt/image from the site, not from Supabase Storage).
-- Idempotent.

update public.projects set
  title_ro = $t$Startica: aplicația de evidență pentru grădinițe private$t$,
  title_en = $t$Startica: a records app for private kindergartens$t$,
  card_title_ro = $t$Startica: program de evidență pentru grădiniță$t$,
  card_title_en = $t$Startica: kindergarten management software$t$,
  summary_ro = $t$Aplicație desktop pentru grădinițe private: copii, prezență, plăți în euro încasate în lei, SMS către părinți și rapoarte pentru contabilitate.$t$,
  summary_en = $t$A desktop app for private kindergartens: children, attendance, euro-priced fees paid in lei, SMS to parents and accounting reports.$t$,
  lead_ro = $t$Aplicație desktop pentru grădinițe private: copii, prezență, plăți în euro și lei la cursul oficial, salarii, SMS și raport contabil. Merge offline.$t$,
  lead_en = $t$A desktop app for private kindergartens: children, attendance, EUR/MDL payments at the official rate, payroll, SMS and accountant reports. Works offline.$t$,
  tags_ro = array['Aplicație desktop', 'Windows', 'Plăți EUR/MDL', 'Lucrează offline'],
  tags_en = array['Desktop app', 'Windows', 'EUR/MDL payments', 'Works offline'],
  cover_alt_ro = $t$Startica, aplicație de evidență pentru grădinițe private$t$,
  cover_alt_en = $t$Startica, a records app for private kindergartens$t$,
  hero_alt_ro = $t$Startica, aplicație de evidență pentru grădinițe private: coperta prezentării cu dashboard-ul aplicației$t$,
  hero_alt_en = $t$Startica, a records app for private kindergartens: presentation cover with the app dashboard$t$,
  hero_path = '/projects/startica-app/startica-prezentare-coperta-1600x900.png',
  screens_demo = true,

  context_body_ro = $t$O grădiniță privată cu mai multe filiale are de ținut împreună copiii, plățile, prezența și echipa. Taxa e stabilită în euro, părinții plătesc în lei, iar fiecare plată trebuie convertită la cursul zilei și regăsită apoi în raportul pentru contabilitate.$t$,
  context_body_en = $t$A private kindergarten with several branches has to keep its children, payments, attendance and staff together. The fee is set in euros, parents pay in lei, and every payment has to be converted at the day's rate and then found again in the accountant's report.$t$,

  star_cost_ro = null,
  star_cost_en = null,

  star_goal_ro = $t$Totul într-un singur loc, ca directoarea să vadă oricând cine a plătit, și fără internet.$t$,
  star_goal_en = $t$Everything in one place, so the director can always see who has paid, even without internet.$t$,

  star_constraints_ro = $j$[
    {"k": "Două monede", "v": "Prețul în euro, încasarea în lei la cursul oficial al zilei."},
    {"k": "Fără internet", "v": "Aplicația merge complet pe calculator."},
    {"k": "Date sensibile", "v": "Datele copiilor și salariile, vizibile doar cui trebuie."}
  ]$j$::jsonb,
  star_constraints_en = $j$[
    {"k": "Two currencies", "v": "Price in euros, payment in lei at the official rate of the day."},
    {"k": "No internet", "v": "The app runs fully on the computer."},
    {"k": "Sensitive data", "v": "Children's data and salaries, visible only to those who need them."}
  ]$j$::jsonb,

  solution_body_ro = $t$Nu am început cu ecrane. Am pornit de la ziua de lucru a grădiniței: dimineața prezența, peste zi plățile, seara închiderea casei, la final de lună raportul pentru contabilă. Am scris regulile împreună cu clientul, apoi am construit aplicația în ordinea zilei.$t$,
  solution_body_en = $t$We did not start with screens. We started from the kindergarten's working day: attendance in the morning, payments during the day, closing the till in the evening, the accountant's report at month end. We wrote the rules together with the client, then built the app in the order of the day.$t$,

  star_biz_ro = $j$[
    "Euro rămâne doar prețul; tot ce se încasează și se datorează e în lei.",
    "Suma se împarte automat pe luni; restul devine avans.",
    "Prezența se marchează copil cu copil, fără „toți prezenți”.",
    "SMS-urile către părinți pleacă doar la cererea unui om."
  ]$j$::jsonb,
  star_biz_en = $j$[
    "Euros stay only the price; everything collected and owed is in lei.",
    "The amount is split across months automatically; the rest becomes an advance.",
    "Attendance is marked child by child, with no \"mark all present\".",
    "SMS to parents goes out only when a person sends it."
  ]$j$::jsonb,

  star_incident_ro = null,
  star_incident_en = null,
  obstacles_body_ro = null,
  obstacles_body_en = null,
  changes_body_ro = null,
  changes_body_en = null,

  result_body_ro = $t$Grădinița lucrează acum într-o singură aplicație. Directoarea vede pe un ecran cine a plătit și cine e în urmă, restanțele se calculează singure, iar raportul pentru contabilă iese direct în Excel.$t$,
  result_body_en = $t$The kindergarten now works in a single app. The director sees on one screen who has paid and who is behind, debt is calculated automatically, and the accountant's report goes straight to Excel.$t$,

  star_gains_ro = $j$[
    {"v": "2+", "k": "filiale, o aplicație"},
    {"v": "11", "k": "module"},
    {"v": "0", "k": "internet necesar"},
    {"v": "6 luni", "k": "mentenanță inclusă"}
  ]$j$::jsonb,
  star_gains_en = $j$[
    {"v": "2+", "k": "branches, one app"},
    {"v": "11", "k": "modules"},
    {"v": "0", "k": "internet needed"},
    {"v": "6 months", "k": "maintenance included"}
  ]$j$::jsonb,
  star_savings_ro = null,
  star_savings_en = null,

  quote_ro = null,
  quote_en = null
where slug_ro = 'startica-app';

delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'startica-app');

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order
  from public.projects p
 cross join (values
   ('Client', 'Client', 'Grădiniță privată', 'Private kindergarten', 0),
   ('Pentru cine', 'For', 'Grădinițe private, centre after-school, rețele cu filiale', 'Private kindergartens, after-school centres, multi-branch networks', 1),
   ('Tip', 'Type', 'Aplicație desktop pentru Windows', 'Windows desktop app', 2),
   ('Domenii', 'Areas', 'Copii, bani, echipă', 'Children, money, staff', 3),
   ('Filiale', 'Branches', '2+', '2+', 4)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'startica-app';

-- A2 (tech) stays hidden on purpose: details are for client presentations.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'startica-app');

-- 3 presentation slides instead of 26 raw screens. Upload first, then fill path
-- in the same format as the current rows. Check the aspect value format too.
delete from public.project_images
 where project_id = (select id from public.projects where slug_ro = 'startica-app');

insert into public.project_images (project_id, path, alt_ro, alt_en, aspect, sort_order)
select p.id, i.path, i.alt_ro, i.alt_en, '16/9', i.sort_order
  from public.projects p
 cross join (values
   ('/projects/startica-app/startica-prezentare-dashboard-1600x900.png',
    'Dashboard-ul Startica: încasări, cheltuieli și ce cere atenție în luna curentă',
    'Startica dashboard: income, expenses and what needs attention this month', 0),
   ('/projects/startica-app/startica-prezentare-achitare-noua-1600x900.png',
    'Achitare nouă: taxa în euro, plata în lei la cursul oficial, repartizată pe luni',
    'New payment: fee in euros, paid in lei at the official rate, split across months', 1),
   ('/projects/startica-app/startica-prezentare-tiparituri-1600x900.png',
    'Confirmarea de plată și nota de plată pe A4',
    'Payment receipt and payment notice on A4', 2)
 ) as i(path, alt_ro, alt_en, sort_order)
 where p.slug_ro = 'startica-app';
