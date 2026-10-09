-- English Minds Academy: STAR copy, from CASE_STUDY_BRIEF_EnglishMinds_web.md. The
-- task is the goal reached together with the client, the action is the process
-- (parent journey, decisions, children's data) rather than the screens, and the tech
-- column lists capabilities instead of frameworks.
--
-- Only what the brief proves from the prototypes. Left out on purpose: cost, gains,
-- savings, stats and the card result (win_*) stay empty until the client provides
-- figures; the quote stays empty until the client confirms one; no "Client" fact;
-- no maintenance paragraph (the spec excludes it); nothing from the unbuilt spec is
-- claimed as delivered (backend storage, automatic deletion, ad measurement).
-- Slug, year, dates, featured, sort order, images and links are untouched.

update public.projects set
  title_ro = $t$Un site care duce părintele de la o reclamă la lecția demo, cu nivelul copilului deja stabilit$t$,
  title_en = $t$A website that takes a parent from an ad to a demo lesson, with the child's level already known$t$,
  card_title_ro = $t$Site care transformă vizitele în înscrieri$t$,
  card_title_en = $t$A website that turns visits into enrolments$t$,
  summary_ro = $t$Site, test de nivel cu diplomă și materiale de brand pentru o școală de engleză pentru copii din Cluj-Napoca.$t$,
  summary_en = $t$Website, level test with a printable diploma and brand materials for a children's English school in Cluj-Napoca.$t$,
  lead_ro = $t$Copilul face un test de nivel cu Ema, mascota școlii, și primește o diplomă cu numele lui. Părintele rezervă lecția demo pe WhatsApp, cu nivelul recomandat deja în mesaj.$t$,
  lead_en = $t$The child takes a level test with Ema, the school's mascot, and gets a diploma with their name on it. The parent books a demo lesson on WhatsApp, with the recommended level already in the message.$t$,
  kind_ro = $t$Site de business, brand și marketing$t$,
  kind_en = $t$Business website, brand and marketing$t$,
  tags_ro = array['Site de business', 'Test de nivel', 'Generare de lead-uri', 'Brand', 'Marketing'],
  tags_en = array['Business website', 'Level test', 'Lead generation', 'Brand', 'Marketing'],
  tech = array['Web app', 'Level test', 'Diploma generator', 'WhatsApp booking', 'Brand identity', 'Social media kit'],

  context_body_ro = $t$English Minds Academy predă engleză copiilor de 5–14 ani, după metoda Cambridge. Școala comunica cu părinții mai ales pe Instagram, unde culorile, mascota Ema și tonul direct funcționau bine. Lipsea însă un loc în care părintele să afle ce nivel are copilul, ce grupă i se potrivește și cum se înscrie.

Pentru o școală care umple grupe la începutul anului școlar, fiecare părinte care pleacă fără să lase un contact este un loc gol. Părinții nu știau la ce grupă să se înscrie, iar echipa afla vârsta și nivelul copilului abia la prima discuție.$t$,
  context_body_en = $t$English Minds Academy teaches English to children aged 5–14 using the Cambridge method. The school talked to parents mostly on Instagram, where the colours, Ema the mascot and the direct tone worked well. What was missing was a place where a parent could learn their child's level, see which group fits and sign up.

For a school that fills its groups at the start of the school year, every parent who leaves without leaving a contact is an empty seat. Parents did not know which group to join, and the team only learned the child's age and level on the first call.$t$,

  star_goal_ro = $t$Să găsim împreună cu academia o soluție care să ducă părintele de la o postare sau o reclamă la lecția demo gratuită, cu vârsta și nivelul copilului deja cunoscute, astfel încât echipa să sune doar părinți pregătiți să se înscrie.$t$,
  star_goal_en = $t$Find, together with the academy, a way to take a parent from a post or an ad to a free demo lesson, with the child's age and level already known, so the team only calls parents who are ready to enrol.$t$,

  star_constraints_ro = $j$[
    {"k": "Date despre copii", "v": "Părinții furnizează date despre minori; am decis să nu păstrăm numele copilului și răspunsurile la test, iar diploma se generează doar pe dispozitivul părintelui"},
    {"k": "Utilizatori pe telefon", "v": "Părintele vine din Instagram, pe mobil, cu răbdare puțină; ținta este rezervarea în cel mult două ecrane"},
    {"k": "Copii care încă nu citesc bine", "v": "Testul pentru 5–8 ani folosește culori, numărat și întrebări audio, nu doar text"},
    {"k": "Reclame și consimțământ", "v": "Campaniile au nevoie de măsurare, dar numai cu acordul vizitatorului"},
    {"k": "Identitate unitară", "v": "Site-ul, flyerul și rețelele sociale trebuie să arate ca aceeași școală"}
  ]$j$::jsonb,
  star_constraints_en = $j$[
    {"k": "Children's data", "v": "Parents provide data about minors; we decided not to keep the child's name or the test answers, and the diploma is generated only on the parent's device"},
    {"k": "Mobile users", "v": "The parent arrives from Instagram, on a phone, with little patience; the target is booking in at most two screens"},
    {"k": "Children who can't read well yet", "v": "The test for ages 5–8 uses colours, counting and audio questions, not just text"},
    {"k": "Ads and consent", "v": "Campaigns need measurement, but only with the visitor's consent"},
    {"k": "One identity", "v": "The website, the flyer and social media must look like the same school"}
  ]$j$::jsonb,

  solution_body_ro = $t$Nu am început cu ecrane. Am început de la ce funcționa deja pe Instagram și am adunat într-un ghid de brand culorile, mascota Ema și tonul direct către părinți, cu reguli separate pentru vocea către părinți și cea către copii.

Apoi am desenat împreună cu academia drumul unui părinte, în patru pași: vede o postare sau o reclamă, copilul face testul de nivel, părintele rezervă pe WhatsApp cu mesajul deja completat, iar academia sună știind vârsta și nivelul. Fiecare pagină are un singur scop: rezervarea lecției demo gratuite.

Am luat decizii de business pe parcurs. WhatsApp în locul unui formular clasic, pentru că părinții din Cluj scriu deja acolo. Testul de nivel ca motiv să rămână pe site, cu o diplomă pe care copilul o păstrează. Ema vorbește doar cu copiii, iar prețurile și termenele vin de la academie. Am lucrat în runde de design, iar academia a urmărit fiecare pagină și starea ei.

Același mesaj l-am dus și în materiale: flyer cu cod QR spre test și șabloane pentru Instagram, în același stil.$t$,
  solution_body_en = $t$We did not start with screens. We started from what already worked on Instagram and collected the colours, Ema the mascot and the direct tone towards parents into a brand guide, with separate rules for the voice used with parents and the one used with children.

Then, together with the academy, we mapped a parent's path in four steps: they see a post or an ad, the child takes the level test, the parent books on WhatsApp with the message already filled in, and the academy calls back knowing the age and level. Every page has a single goal: booking the free demo lesson.

We made business decisions along the way. WhatsApp instead of a classic form, because local parents already message there. The level test as a reason to stay on the site, with a diploma the child keeps. Ema only talks to children, while prices and deadlines come from the academy. We worked in design rounds, and the academy followed each page and its status.

We carried the same message into print and social media: a flyer with a QR code to the test, and Instagram templates in the same style.$t$,

  star_biz_ro = $j$[
    "Am pornit de la ce funcționa deja pe Instagram și l-am transformat într-un ghid de brand pentru toate materialele.",
    "Am desenat împreună cu academia drumul părintelui, de la reclamă la lecția demo, în patru pași.",
    "Am ales WhatsApp în locul formularului clasic, pentru că părinții din oraș scriu deja acolo.",
    "Am tratat cu grijă datele despre copii: nu păstrăm numele copilului și răspunsurile la test.",
    "Am adaptat testul pe vârste, cu întrebări vizuale și audio pentru cei care încă nu citesc bine."
  ]$j$::jsonb,
  star_biz_en = $j$[
    "We started from what already worked on Instagram and turned it into a brand guide for all materials.",
    "Together with the academy we mapped the parent's path from ad to demo lesson in four steps.",
    "We chose WhatsApp over a classic form, because local parents already message there.",
    "We handled children's data with care: we do not keep the child's name or the test answers.",
    "We tailored the test by age, with visual and audio questions for children who can't read well yet."
  ]$j$::jsonb,

  result_body_ro = $t$Academia are un drum clar de la reclamă la înscriere. Părintele află singur nivelul copilului, iar mesajul pe care îl trimite pe WhatsApp conține deja vârsta și grupa potrivită, deci prima discuție pornește de la informații, nu de la întrebări de clarificare.

Copilul primește o diplomă cu numele lui, pe care familia o poate păstra și arăta. Site-ul, flyerul și rețelele sociale arată la fel, așa că părintele recunoaște școala oriunde o vede.$t$,
  result_body_en = $t$The academy has a clear path from ad to enrolment. Parents find out their child's level on their own, and the WhatsApp message they send already includes the age and the right group, so the first conversation starts from information rather than clarifying questions.

The child gets a diploma with their name, which the family can keep and share. The website, the flyer and social media look the same, so parents recognise the school wherever they see it.$t$
where slug_ro = 'englishminds';

-- The live "Client" fact stays: the client is already named on the public page.
delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'englishminds')
   and label_en <> 'Client';

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order + 1
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Site de business, brand și marketing', 'Business website, brand and marketing', 0),
   ('Locație', 'Location', 'Cluj-Napoca, România', 'Cluj-Napoca, Romania', 1),
   ('Module', 'Modules', 'Test de nivel, rezervare demo, grupe, metodă, tabere, blog', 'Level test, demo booking, groups, method, camps, blog', 2),
   ('Public', 'Audience', 'Părinți de copii de 5–14 ani, 5 grupe de vârstă, în limba română', 'Parents of children aged 5–14, 5 age groups, in Romanian', 3)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'englishminds';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'englishminds');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Web app', 'Pagini rapide, care merg bine pe telefon', 'Fast pages that work well on phones', 0),
   ('Level test', 'Test pe vârstă sau pentru examen, cu audio, rezultat pe competențe și recomandare de grupă', 'Age- or exam-based test with audio, a per-skill result and a group recommendation', 1),
   ('Diploma generator', 'Diplomă personalizată, descărcabilă ca imagine sau PDF, generată pe dispozitivul părintelui', 'Personalised diploma, downloadable as image or PDF, generated on the parent''s device', 2),
   ('WhatsApp booking', 'Rezervarea lecției demo, cu mesajul completat cu vârsta și nivelul copilului', 'Demo lesson booking, with the message pre-filled with the child''s age and level', 3),
   ('Brand identity', 'Logo, culori, fonturi și reguli pentru mascota Ema și pentru tonul către părinți și copii', 'Logo, colours, typefaces and rules for Ema the mascot and the voice for parents and children', 4),
   ('Social media kit', 'Flyer A5 cu cod QR spre test și șabloane Instagram în același stil', 'A5 flyer with a QR code to the test, and Instagram templates in the same style', 5)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'englishminds';
