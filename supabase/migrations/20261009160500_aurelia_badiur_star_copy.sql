-- Aurelia Badiur website: STAR copy, from CASE_STUDY_BRIEF_aureliabadiur.md in the
-- project repo. The situation is the client's problem before, the task is the goal
-- reached together with the client, the action is the process (analysis, requirements,
-- visitor flow, SEO approach) rather than screens, and the tech column lists
-- capabilities instead of frameworks.
-- Only what the code proves. No figures: gains, savings and the card result (win_*)
-- stay empty until the client provides them, and the quote stays empty until the client
-- confirms one. No "Client" fact. Items marked [DE CONFIRMAT] or (dedus) are left out,
-- as are third-party names and the maintenance paragraph.

update public.projects set
  title_ro = 'Un site bilingv care prezintă parcursul și metoda de lucru a unei consultante oenolog și o face ușor de contactat',
  title_en = 'A bilingual website that presents an oenology consultant''s career and working method, and makes her easy to reach',
  card_title_ro = 'Site bilingv pentru un consultant oenolog',
  card_title_en = 'Bilingual site for a wine consultant',
  summary_ro = 'Site de prezentare în română și engleză, cu formular de contact și WhatsApp, pentru o consultantă oenolog care lucrează cu crame din Bordeaux și Bourgogne.',
  summary_en = 'A Romanian and English presentation site with a contact form and WhatsApp, for an oenology consultant working with wineries in Bordeaux and Burgundy.',
  lead_ro = 'Împreună cu Aurelia Badiur am transformat un parcurs profesional de nivel înalt într-o poveste clară: cine este, cum lucrează, cum o contactezi. Un vizitator ajunge de la prima impresie la o cerere de întâlnire în câțiva pași.',
  lead_en = 'Together with Aurelia Badiur we turned a high-level professional path into a clear story: who she is, how she works, how to reach her. A visitor goes from first impression to a meeting request in a few steps.',
  kind_ro = 'Site de business bilingv',
  kind_en = 'Bilingual business website',
  tags_ro = array['Site de business', 'Consultanță', 'Formular de contact', 'RO / EN', 'SEO'],
  tags_en = array['Business website', 'Consulting', 'Contact form', 'RO / EN', 'SEO'],
  tech = array['Business website', 'Bilingual content', 'SEO & structured data', 'Contact form', 'Mobile-first & accessible'],

  context_body_ro = $t$O consultantă oenolog vinde încredere, iar încrederea se construiește din parcurs, referințe și un mod de lucru explicat clar. Clienții ei sunt crame: proprietari și directori tehnici care compară consultanți și vor să înțeleagă repede ce primesc.

Site-ul exista deja într-o primă versiune: o singură pagină care schimba textul din JavaScript. Din analiza noastră a ieșit că avea probleme de traducere, de accesibilitate și de căutare, iar parcursul și metoda de lucru trebuiau să se înțeleagă mai ușor, mai ales de pe telefon.$t$,
  context_body_en = $t$An oenology consultant sells trust, and trust is built from career, references and a clearly explained way of working. Her clients are wineries: owners and technical directors who compare consultants and want to quickly understand what they get.

A first version of the site already existed: a single page that swapped its text with JavaScript. Our analysis showed it had problems with translation, accessibility and search, and that her career and working method needed to be easier to understand, especially on a phone.$t$,

  star_goal_ro = 'Să găsim împreună cu clientul o formă clară de prezentare a parcursului și a metodei de lucru, astfel încât un proprietar de cramă să înțeleagă repede ce oferă consultanta și să o poată contacta imediat.',
  star_goal_en = 'To find, together with the client, a clear way to present her career and working method, so that a winery owner quickly understands what she offers and can contact her right away.',

  star_constraints_ro = $j$[
    {"k": "Două limbi, fiecare cu SEO propriu", "v": "Fiecare limbă are pagina ei, cu titlu, descriere și legături de limbă corecte, ca motoarele de căutare să le trateze separat"},
    {"k": "Fără server propriu", "v": "Site-ul rămâne pe hosting static, deci formularul trebuie să trimită mesaje fără backend"},
    {"k": "Imagine premium", "v": "Păstrăm paleta bordo și crem și tipografia editorială, fără un redesign radical"},
    {"k": "Mobil primul", "v": "Public care citește de pe telefon: ținte de atingere mari, meniu pentru mobil, buton WhatsApp fix"},
    {"k": "Accesibilitate", "v": "Navigare cu tastatura, contrast verificat, etichete pentru cititoare de ecran"},
    {"k": "Conținut de specialitate", "v": "Termenii de oenologie trebuie transmiși fără greșeli, în ambele limbi"}
  ]$j$::jsonb,
  star_constraints_en = $j$[
    {"k": "Two languages, each with its own SEO", "v": "Each language has its own page with correct title, description and language links, so search engines treat them separately"},
    {"k": "No server of our own", "v": "The site stays on static hosting, so the form has to send messages without a backend"},
    {"k": "Premium look", "v": "Keep the burgundy and cream palette and editorial typography, with no radical redesign"},
    {"k": "Mobile first", "v": "An audience reading on phones: large touch targets, a mobile menu, a floating WhatsApp button"},
    {"k": "Accessibility", "v": "Keyboard navigation, checked contrast, labels for screen readers"},
    {"k": "Specialist content", "v": "Oenology terms must be conveyed accurately in both languages"}
  ]$j$::jsonb,

  solution_body_ro = $t$Nu am început cu ecrane. Am început cu o analiză a site-ului existent: ce nu funcționa la traduceri, la căutări și la accesibilitate. Apoi am stabilit cerințele împreună cu clientul: SEO cât mai bun, formular de contact funcțional, buton WhatsApp, logo-uri mai mari ale caselor de vinuri cu care a colaborat, fără schimbarea identității vizuale.

Am gândit apoi drumul vizitatorului, ca să rămână simplu: citește parcursul, vede metoda în cinci pași, de la vie la îmbuteliere, apoi contactează consultanta pe canalul care i se potrivește, prin formular, WhatsApp sau email. Am decis explicit să rămânem pe un site static, fără framework: o pagină de prezentare care se schimbă rar nu justifică un sistem de build și riscul unei mutări. Pentru căutări, am ales două pagini separate, câte una pe limbă, în locul comutării de text din JavaScript, ca fiecare limbă să apară corect în rezultate.$t$,
  solution_body_en = $t$We did not start with screens. We started by analysing the existing site: what failed in translation, search and accessibility. Then we set the requirements together with the client: strong SEO, a working contact form, a WhatsApp button, larger logos of the wine houses she has worked with, and no change to the visual identity.

We then thought through the visitor's path so it stays simple: read her career, see the method in five steps, from vineyard to bottling, then reach her on the channel that suits them, through the form, WhatsApp or email. We explicitly decided to stay on a static site with no framework: a presentation page that rarely changes does not justify a build system or the risk of a migration. For search, we chose two separate pages, one per language, instead of switching text with JavaScript, so each language appears correctly in results.$t$,

  star_biz_ro = $j$[
    "Parcursul și metoda de lucru sunt explicate o dată, clar, în loc să fie reluate în fiecare conversație.",
    "Contact pe trei căi (formular, WhatsApp, email), pentru că proprietarii de crame aleg canalul care li se potrivește.",
    "Fiecare limbă are pagina ei, cu SEO propriu, ca să fie găsită corect de cei care caută în română sau în engleză.",
    "Identitatea vizuală rămâne a clientului: am rafinat-o, nu am refăcut-o.",
    "Hosting static și conținut care se schimbă rar: fără întreținere zilnică."
  ]$j$::jsonb,
  star_biz_en = $j$[
    "Her career and working method are explained once, clearly, instead of being repeated in every conversation.",
    "Contact on three paths (form, WhatsApp, email), because winery owners pick the channel that suits them.",
    "Each language has its own page with its own SEO, so she is found correctly by people searching in Romanian or English.",
    "The visual identity stays the client's own: we polished it rather than redoing it.",
    "Static hosting and content that rarely changes: no daily upkeep."
  ]$j$::jsonb,

  result_body_ro = $t$Clientul are acum un singur loc, în două limbi, către care își poate trimite potențialii clienți. Parcursul și metoda de lucru sunt prezentate o dată, bine, iar contactul se face în câțiva pași, pe canalul preferat de vizitator.

Site-ul arată bine pe telefon, se poate parcurge cu tastatura, apare corect în căutări în ambele limbi și nu cere întreținere zilnică.$t$,
  result_body_en = $t$The client now has a single place, in two languages, to send prospective clients to. Her career and method are presented once, well, and contact takes a few steps, on the channel the visitor prefers.

The site works well on phones, can be used by keyboard, appears correctly in search in both languages, and needs no daily upkeep.$t$
where slug_ro = 'aurelia-badiur';

delete from public.project_facts
 where project_id = (select id from public.projects where slug_ro = 'aurelia-badiur');

insert into public.project_facts (project_id, label_ro, label_en, value_ro, value_en, sort_order)
select p.id, f.label_ro, f.label_en, f.value_ro, f.value_en, f.sort_order
  from public.projects p
 cross join (values
   ('Tip', 'Type', 'Site de prezentare, o pagină, 2 limbi', 'One-page presentation site, 2 languages', 0),
   ('Module', 'Modules', 'Parcurs, proces de vinificație, consultanță, contact', 'Career, winemaking process, consulting, contact', 1),
   ('Limbi', 'Languages', 'Română, engleză', 'Romanian, English', 2),
   ('Utilizatori', 'Users', 'Vizitatori publici, fără conturi', 'Public visitors, no accounts', 3)
 ) as f(label_ro, label_en, value_ro, value_en, sort_order)
 where p.slug_ro = 'aurelia-badiur';

-- project_stack.name has no per-locale column: capability names in English, roles localized.
delete from public.project_stack
 where project_id = (select id from public.projects where slug_ro = 'aurelia-badiur');

insert into public.project_stack (project_id, name, role_ro, role_en, sort_order)
select p.id, s.name, s.role_ro, s.role_en, s.sort_order
  from public.projects p
 cross join (values
   ('Static bilingual site', 'Două pagini, câte una pe limbă, rapide și ușor de găsit', 'Two pages, one per language, fast and easy to find', 0),
   ('Search optimisation', 'Pagina apare corect în căutări, în ambele limbi, cu date structurate și previzualizări pentru rețelele sociale', 'Pages appear correctly in search in both languages, with structured data and social previews', 1),
   ('Contact form', 'Trimite cererile de întâlnire direct pe email, fără server propriu', 'Sends meeting requests to email with no server of our own', 2),
   ('WhatsApp & email links', 'Contact cu un singur gest, inclusiv un buton fix pe pagină', 'One-tap contact, including a floating button', 3),
   ('Scroll animations', 'Apariții și desenarea liniei de viță la derulare, fără încetinire', 'Reveals and the vine-line drawing on scroll, with no slowdown', 4),
   ('Accessible & responsive', 'Utilizabil de pe telefon și cu tastatura, cu etichete pentru cititoare de ecran', 'Usable on phones and by keyboard, with labels for screen readers', 5)
 ) as s(name, role_ro, role_en, sort_order)
 where p.slug_ro = 'aurelia-badiur';
