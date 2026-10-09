-- SwissCars.md: STAR copy, from CASE_STUDY_BRIEF_swiss-cars.md. The task is the goal
-- reached together with the client, the action is the process (dealer's working day,
-- roles, flow of an enquiry, content in three languages) rather than the screens, and
-- the tech column lists capabilities instead of frameworks.
--
-- Only what the code proves. Left out on purpose: cost, gains, savings, stats and the
-- card result (win_*) stay empty until the client provides figures; the quote stays
-- empty until the client confirms one; no "Client" fact; no maintenance paragraph;
-- no "taxes included" or warranty claims (marketing copy, not confirmed promises).
-- Slug, year, dates, featured, sort order, images and links are untouched.

update public.projects set
  title_ro = $t$Un site în trei limbi, prin care clienții aleg o mașină din Elveția și cer o ofertă în câteva clickuri$t$,
  title_en = $t$A three-language website where buyers pick a Swiss car and request an offer in a few clicks$t$,
  card_title_ro = $t$SwissCars.md: mașini din Elveția online$t$,
  card_title_en = $t$SwissCars.md: Swiss cars, online$t$,
  summary_ro = $t$Site multilingv (RO/RU/EN) pentru un dealer de mașini importate din Elveția, cu catalog, cereri de la clienți și panou de administrare.$t$,
  summary_en = $t$A trilingual (RO/RU/EN) website for a dealer of cars imported from Switzerland, with a catalog, customer enquiries and an admin panel.$t$,
  lead_ro = $t$Dealerul își administrează singur mașinile, textele din pagina principală și cererile primite, fără programator. Fiecare cerere ajunge imediat pe Telegram și pe email.$t$,
  lead_en = $t$The dealer manages cars, homepage texts and incoming enquiries without a developer. Every enquiry reaches Telegram and email immediately.$t$,
  kind_ro = $t$Site de business cu panou de administrare$t$,
  kind_en = $t$Business website with admin panel$t$,
  tags_ro = array['Site de business', 'Catalog auto', 'Admin', 'RO / RU / EN', 'Cereri clienți'],
  tags_en = array['Business website', 'Car catalog', 'Admin', 'RO / RU / EN', 'Customer leads'],
  tech = array['Web app', 'Cloud database', 'Role-based access', 'Lead alerts', 'File storage', 'Abuse protection', 'Analytics & monitoring'],

  context_body_ro = $t$Un dealer care importă mașini din Elveția în Moldova lucrează cu cumpărători care caută în limbi diferite. Fiecare mașină are multe detalii care trebuie ținute la zi: an, kilometraj, combustibil, cutie, dotări, poze. Fără un catalog propriu, informația rămâne răspândită în anunțuri și mesaje private.

Cererile de ofertă se pierd ușor când vin pe canale diferite, iar clientul vorbește română sau rusă. Contează ca fiecare cerere să ajungă repede la persoana care răspunde și ca dealerul să poată schimba singur mașinile, prețurile și textele, fără să depindă de un programator.$t$,
  context_body_en = $t$A dealer importing cars from Switzerland to Moldova serves buyers who search in different languages. Every car carries many details that must stay current: year, mileage, fuel, gearbox, equipment, photos. Without its own catalog, the information stays scattered across listings and private messages.

Enquiries get lost easily when they arrive through several channels, and buyers speak Romanian or Russian. It matters that every request reaches the person who answers quickly, and that the dealer can change cars, prices and texts alone, without depending on a developer.$t$,

  star_goal_ro = $t$Să găsim împreună cu clientul o soluție prin care cumpărătorii văd mașinile în limba lor și cer o ofertă ușor, iar dealerul își ține singur catalogul și cererile sub control.$t$,
  star_goal_en = $t$Find, together with the client, a way for buyers to see cars in their own language and request an offer easily, while the dealer keeps the catalog and enquiries under control.$t$,

  star_constraints_ro = $j$[
    {"k": "Trei limbi", "v": "Fiecare mașină, recenzie și text de pagină există în română, rusă și engleză; româna rămâne limba implicită"},
    {"k": "Utilizatori fără pregătire tehnică", "v": "Mașinile, pozele, pagina principală, datele de contact și logo-ul se editează din panou, fără cod"},
    {"k": "Date de contact ale clienților", "v": "Numele și telefonul celor care cer o ofertă sunt vizibile doar administratorului, iar formularele au limită de trimiteri împotriva spamului"},
    {"k": "Răspuns rapid", "v": "Cererea trebuie să ajungă pe Telegram și pe email fără ca vizitatorul să aștepte la formular"},
    {"k": "Vizibilitate în căutări", "v": "O pagină pentru fiecare mașină, în fiecare limbă, ușor de găsit în motoarele de căutare"}
  ]$j$::jsonb,
  star_constraints_en = $j$[
    {"k": "Three languages", "v": "Every car, review and page text exists in Romanian, Russian and English; Romanian stays the default"},
    {"k": "Non-technical users", "v": "Cars, photos, the homepage, contact data and the logo are edited from the panel, with no code"},
    {"k": "Customer contact data", "v": "Names and phones of people requesting an offer are visible to the administrator only, and forms are rate-limited against spam"},
    {"k": "Fast response", "v": "The enquiry must reach Telegram and email without the visitor waiting on the form"},
    {"k": "Search visibility", "v": "A page for every car, in every language, easy to find in search engines"}
  ]$j$::jsonb,

  solution_body_ro = $t$Nu am desenat ecrane, am rezolvat probleme de business. Am pornit de la ziua de lucru a dealerului: cum adaugă o mașină, cum primește o cerere, cine răspunde și în cât timp. Din asta au ieșit rolurile (vizitator și administrator), fluxul unei cereri și structura conținutului în trei limbi.

Ne-am întrebat ce informație cere cumpărătorul înainte să sune și ce informație trebuie să ajungă la dealer. Cumpărătorul vede mașina în limba lui și cere o ofertă, un apel înapoi sau un test drive. Dealerul primește cererea în panou și imediat pe Telegram și pe email, cu numele, telefonul și mesajul.

Câteva decizii luate împreună: româna rămâne implicită, iar rusa și engleza completează piața locală. Site-ul nu vinde online, mașina se cere printr-un formular. Conținutul paginii principale se schimbă din panou, ca oferta să poată fi actualizată fără programator. Accesul în panou este limitat la administrator, iar securitatea a fost verificată și întărită în iterații separate.$t$,
  solution_body_en = $t$We did not draw screens, we solved business problems. We started from the dealer's working day: how a car is added, how an enquiry arrives, who answers and how fast. That gave us the roles (visitor and administrator), the flow of an enquiry and the structure of the content in three languages.

We asked what a buyer needs to know before calling and what the dealer must receive. The buyer sees the car in their own language and requests an offer, a callback or a test drive. The dealer gets the request in the panel and immediately on Telegram and email, with name, phone and message.

A few decisions we made together: Romanian stays the default, with Russian and English covering the local market. The site does not sell online; a car is requested through a form. Homepage content is changed from the panel, so the offer can be updated without a developer. Access to the panel is limited to the administrator, and security was reviewed and hardened in separate iterations.$t$,

  star_biz_ro = $j$[
    "Am pornit de la ziua de lucru a dealerului: cum adaugă o mașină, cum primește o cerere, cine răspunde.",
    "Am definit fluxul unei cereri, de la formular până la alerta pe Telegram și email, ca niciuna să nu rămână fără răspuns.",
    "Am stabilit roluri clare: vizitatorul vede catalogul, doar administratorul intră în panou.",
    "Am structurat conținutul în trei limbi, ca fiecare cumpărător să citească totul în limba lui.",
    "Am protejat datele de contact ale clienților și am limitat trimiterile abuzive."
  ]$j$::jsonb,
  star_biz_en = $j$[
    "We started from the dealer's working day: how a car is added, how an enquiry arrives, who answers.",
    "We defined the flow of an enquiry, from the form to the Telegram and email alert, so none goes unanswered.",
    "We set clear roles: visitors browse the catalog, only the administrator enters the panel.",
    "We structured the content in three languages, so every buyer reads everything in their own.",
    "We protected customers' contact data and limited abusive submissions."
  ]$j$::jsonb,

  result_body_ro = $t$Dealerul are un catalog propriu, în trei limbi, pe care îl actualizează singur. Cererile ajung într-un singur loc, în panou, și imediat pe Telegram și pe email, deci nu se mai împrăștie pe canale diferite.

Are control asupra a ceea ce se vede pe site (mașini, texte, contacte) și vizibilitate asupra cererilor primite și a abonaților la newsletter. Cumpărătorii pot răsfoi catalogul, salva mașini la favorite, estima o rată de leasing și cere o ofertă fără să înceapă cu un telefon.$t$,
  result_body_en = $t$The dealer owns a catalog in three languages and updates it alone. Enquiries land in one place, the panel, and immediately on Telegram and email, so they stop scattering across channels.

The dealer controls what the site shows (cars, texts, contacts) and sees incoming enquiries and newsletter subscribers. Buyers can browse the catalog, save cars to favourites, estimate a leasing payment and request an offer without having to start with a phone call.$t$
where slug_ro = 'swisscars';

delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'swisscars');

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Site de business cu panou de administrare', 'Business website with admin panel', 0),
   ('Module', 'Modules', 'Catalog auto, cereri, calculator de leasing, recenzii, parteneri, newsletter, pagina principală, setări', 'Car catalog, enquiries, leasing calculator, reviews, partners, newsletter, homepage content, settings', 1),
   ('Limbi', 'Languages', '3: română, rusă, engleză', '3: Romanian, Russian, English', 2)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'swisscars';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'swisscars');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Web app', 'Site rapid, în trei limbi, cu pagină pentru fiecare mașină', 'A fast three-language site with a page for every car', 0),
   ('Cloud database', 'Mașinile, cererile, recenziile și setările într-un singur loc, în cloud', 'Cars, enquiries, reviews and settings in one place, in the cloud', 1),
   ('Role-based access', 'Doar administratorul intră în panou și face modificări', 'Only the administrator enters the panel and makes changes', 2),
   ('Lead alerts', 'Fiecare cerere ajunge imediat pe Telegram și pe email', 'Every enquiry reaches Telegram and email immediately', 3),
   ('File storage', 'Pozele mașinilor și logo-ul se încarcă direct din panou', 'Car photos and the logo are uploaded straight from the panel', 4),
   ('Abuse protection', 'Limitează trimiterile repetate și curăță textele introduse', 'Limits repeated submissions and sanitizes entered text', 5),
   ('Analytics & monitoring', 'Statistici de vizite și urmărirea erorilor', 'Visit analytics and error tracking', 6)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'swisscars';
