-- Bloom: the full set of screens from the portfolio package
-- (Proiecte pentru portfolio/Bloom design system.zip, portofoliu/studiu-de-caz/imagini/),
-- already 1600x900; they live in project-media/bloom/. Screens show demo data
-- (screens_demo stays true). Text is unchanged. Alt texts are the package's titles and
-- descriptions as "Title: description", which the gallery shows as captions.
--
-- No delete (the Supabase MCP cancels migrations with delete): the two existing gallery
-- rows are repointed to the first two screens and the rest are inserted after them.

update public.projects
   set cover_path = 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/bloom/cover/bloom-azi-1600x900.png',
       hero_path  = 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/bloom/hero/bloom-azi-1600x900.png',
       cover_alt_ro = 'Azi: ecranul de start al administratorului, cu încasările zilei, comenzile de azi, alertele și graficul pe 7 zile',
       cover_alt_en = 'Today: the administrator''s start screen with today''s income, today''s orders, alerts and a 7-day chart',
       hero_alt_ro  = 'Azi: ecranul de start al administratorului, cu încasările zilei, comenzile de azi, alertele și graficul pe 7 zile',
       hero_alt_en  = 'Today: the administrator''s start screen with today''s income, today''s orders, alerts and a 7-day chart'
 where slug_ro = 'bloom';

with screens(file, alt_ro, alt_en, sort_order) as (values
  ('bloom-comenzi-1600x900.png', 'Comenzi: comenzile florăriei pe patru coloane după status, cu filtre deasupra', 'Orders: the shop''s orders in four columns by status, with filters above', 0),
  ('bloom-comanda-noua-1600x900.png', 'Comandă nouă: formularul de comandă cu clientul, livrarea, buchetul din stoc și avansul', 'New order: the order form with customer, delivery, bouquet from stock and deposit', 1),
  ('bloom-link-plata-1600x900.png', 'Link de plată: detaliul unei comenzi, cu panoul din care se trimite linkul de plată pentru restul de 950 de lei', 'Payment link: an order detail with the panel for sending a payment link for the remaining 950 lei', 2),
  ('bloom-client-plata-1600x900.png', 'Pagina clientului: trei ecrane de telefon văzute de client: de plată, achitat și link expirat', 'Customer page: three phone screens seen by the customer: to pay, paid and expired link', 3),
  ('bloom-buchet-nou-1600x900.png', 'Buchet nou: florile alese din stoc în stânga, iar în dreapta calculul costului, prețului și marjei', 'New bouquet: flowers picked from stock on the left, with cost, price and margin calculated on the right', 4),
  ('bloom-tejghea-1600x900.png', 'Tejghea: produsele din stoc ca grilă și bonul vânzării, cu plata numerar sau card', 'Counter: stock products as a grid and the sale receipt, with cash or card payment', 5),
  ('bloom-bon-1600x900.png', 'Bon și bilet curier: previzualizarea bonului de 80 mm și a biletului de curier A6 pentru o comandă', 'Receipt and courier slip: preview of the 80 mm receipt and the A6 courier slip for an order', 6),
  ('bloom-stoc-1600x900.png', 'Stoc: tabelul florilor cu cantitatea, costul mediu, prețul de vânzare și marja', 'Stock: the flower table with quantity, average cost, selling price and margin', 7),
  ('bloom-adauga-stoc-1600x900.png', 'Adaugă stoc: formularul unei cumpărări, cu prețul pe floare și noul cost mediu calculat', 'Add stock: a purchase form with price per flower and the new average cost calculated', 8),
  ('bloom-pierderi-1600x900.png', 'Pierderi: pierderile săptămânii grupate pe motive și pe flori, cu formularul de înregistrare', 'Losses: the week''s losses grouped by reason and by flower, with the entry form', 9),
  ('bloom-bani-1600x900.png', 'Bani pe săptămână: veniturile, cheltuielile și profitul săptămânii, cu graficul pe 8 săptămâni', 'Money by week: the week''s income, expenses and profit, with an 8-week chart', 10),
  ('bloom-plati-online-1600x900.png', 'Plăți online: lista tranzacțiilor cu cardul, cu unele bifate ca verificate în bancă', 'Online payments: the list of card transactions, some ticked as verified at the bank', 11),
  ('bloom-reconciliere-1600x900.png', 'Reconciliere: comparația pe zile între plățile din aplicație și cele confirmate de bancă', 'Reconciliation: a day-by-day comparison of payments in the app and those confirmed by the bank', 12),
  ('bloom-rapoarte-1600x900.png', 'Rapoarte: vânzările lunii pe vânzător și pe categorii de produse', 'Reports: the month''s sales by seller and by product category', 13),
  ('bloom-clienti-1600x900.png', 'Clienți: lista clienților în stânga și fișa unei cliente cu comenzile, datele importante și notițele', 'Customers: the customer list on the left and a customer record with orders, important dates and notes', 14),
  ('bloom-evenimente-1600x900.png', 'Evenimente: un eveniment cu florile rezervate din stoc și plata în tranșe', 'Events: an event with flowers reserved from stock and payment in instalments', 15),
  ('bloom-frigidere-1600x900.png', 'Frigidere: cardurile frigiderelor cu temperatura pe 24 de ore și jurnalul alertelor', 'Fridges: fridge cards with 24-hour temperature and the alert log', 16),
  ('bloom-notificari-1600x900.png', 'Notificări: panoul de notificări deschis peste ecranul Azi, cu filtre pe bani, stoc și frigidere', 'Notifications: the notification panel open over the Today screen, with money, stock and fridge filters', 17),
  ('bloom-vanzator-comenzi-1600x900.png', 'Vânzătorul pe tabletă: comenzile văzute de vânzător pe tabletă, cu meniul redus la rolul lui', 'The seller on a tablet: orders as the seller sees them on a tablet, with the menu limited to their role', 18),
  ('bloom-vanzator-buchet-1600x900.png', 'Buchet fără cost: ecranul Buchet nou văzut de vânzător, cu prețul afișat fără cost și fără marjă', 'Bouquet without cost: the New bouquet screen as the seller sees it, with price shown without cost or margin', 19),
  ('bloom-mobil-1600x900.png', 'Pe telefon: ecranele Azi și Comenzi pe telefon, cu meniul în bara de jos', 'On a phone: the Today and Orders screens on a phone, with the menu in the bottom bar', 20),
  ('bloom-prima-pornire-1600x900.png', 'Prima pornire: primul din cei 4 pași de configurare a unei florării noi', 'First run: the first of 4 setup steps for a new shop', 21),
  ('bloom-echipa-1600x900.png', 'Echipa: conturile administratorilor și vânzătorilor, cu formularul de adăugare', 'Team: administrator and seller accounts, with the add form', 22),
  ('bloom-setari-plati-1600x900.png', 'Setări plăți: conectarea florăriei la maib sau paynet, cu cheile, webhook-ul și valabilitatea linkului', 'Payment settings: connecting the shop to maib or paynet, with keys, webhook and link validity', 23),
  ('bloom-ds-culori-1600x900.png', 'Culori: paleta de suprafețe și text și cele patru roluri de culoare ale design system-ului', 'Colour: the surface and text palette and the design system''s four colour roles', 24),
  ('bloom-ds-componente-1600x900.png', 'Componente: componentele de bază ale design system-ului pe o singură planșă', 'Components: the design system''s core components on a single sheet', 25)
),
project as (select id from public.projects where slug_ro = 'bloom'),
existing as (
  select i.id, row_number() over (order by i.sort_order, i.id) - 1 as rn
    from public.project_images i, project
   where i.project_id = project.id
     and i.path not like '%/project-media/bloom/gallery/%'
),
repointed as (
  update public.project_images i
     set path = 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/bloom/gallery/' || s.file,
         alt_ro = s.alt_ro, alt_en = s.alt_en, aspect = '16/9', sort_order = s.sort_order
    from existing e
    join screens s on s.sort_order = e.rn
   where i.id = e.id
  returning s.sort_order
)
insert into public.project_images (project_id, path, alt_ro, alt_en, aspect, sort_order)
select project.id, 'https://xlrkuaxnkidslrhdelpm.supabase.co/storage/v1/object/public/project-media/bloom/gallery/' || s.file,
       s.alt_ro, s.alt_en, '16/9', s.sort_order
  from screens s, project
 where s.sort_order not in (select sort_order from repointed)
   and not exists (
     select 1 from public.project_images x
      where x.project_id = project.id
        and x.path like '%/' || s.file
   );
