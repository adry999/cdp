// One-time seed: migrates hardcoded content from app/data/*.ts and components
// into Supabase. Run: node --env-file=.env scripts/seed-supabase.mjs
import { createClient } from '@supabase/supabase-js'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) throw new Error('Missing NUXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(url, key, { auth: { persistSession: false } })

function check(label, { error }) {
  if (error) throw new Error(`${label}: ${error.message}`)
  console.log(`✔ ${label}`)
}

// ── Projects ──────────────────────────────────────────────────────────────

const projects = [
  {
    slug: 'saas-logistica',
    tech: ['Nuxt', 'Supabase'],
    year: 2026,
    card_title_ro: 'SaaS de logistică, România',
    card_title_en: 'Logistics SaaS, Romania',
    summary_ro:
      'Gestiune de comenzi și flotă pentru 40 de utilizatori interni. Reconstruit dintr-un setup Airtable și Zapier care nu mai făcea față.',
    summary_en:
      'Order and fleet management for 40 internal users. Rebuilt from an Airtable and Zapier setup that had stopped scaling.',
    title_ro: 'O firmă de logistică a renunțat la Airtable și Zapier',
    title_en: 'A logistics company left Airtable and Zapier behind',
    lead_ro:
      'Gestiune de comenzi și flotă pentru 40 de utilizatori interni, reconstruită ca o singură aplicație, cu o bază de date reală dedesubt.',
    lead_en:
      'Order and fleet management for 40 internal users, rebuilt as one application with a real database underneath.',
    cover_alt_ro: 'SaaS de logistică, România',
    cover_alt_en: 'Logistics SaaS, Romania',
    hero_alt_ro: 'O firmă de logistică a renunțat la Airtable și Zapier',
    hero_alt_en: 'A logistics company left Airtable and Zapier behind',
    context_heading_ro: 'Unsprezece tabele, șase automatizări și un singur om care le înțelegea',
    context_heading_en: 'Eleven tables, six automations, one person who understood it',
    context_body_ro:
      'Dispeceratul funcționa pe Airtable, cu fluxuri Zapier deasupra. La zece utilizatori era în regulă. La patruzeci apăreau comenzi duplicate, înregistrări pe care nimeni nu le putea urmări și o factură lunară care creștea cu fiecare automatizare nouă. Nimic nu era verificat: un șofer putea fi alocat la două rute în aceeași oră.\n\nFirma plătise deja o agenție pentru o rescriere. Aceasta s-a oprit la ecranul de autentificare.',
    context_body_en:
      'Dispatch ran on Airtable with Zapier flows on top. It worked at ten users. At forty it produced duplicate orders, records nobody could trace, and a monthly bill that grew with every new automation. Nothing was verified: a driver could be assigned to two routes at the same hour.\n\nThe company had already paid an agency for a rewrite. It stopped at the login screen.',
    solution_heading_ro: 'Mai întâi baza de date, apoi interfața',
    solution_heading_en: 'The database first, the interface second',
    quote_ro: '[ Citat client — una sau două propoziții despre ce s-a schimbat după lansare. ]',
    quote_en: '[ Client quote — one or two sentences on what changed after launch. ]',
    next_title_ro: 'Ai un proiect blocat în același punct?',
    next_title_en: 'Have a project stuck in the same place?',
    sort_order: 0,
    facts: [
      { label_ro: 'Client', label_en: 'Client', value_ro: 'Casă de expediții, România', value_en: 'Freight forwarder, Romania' },
      { label_ro: 'Durată', label_en: 'Duration', value_ro: '9 săptămâni până în producție', value_en: '9 weeks to production' },
      { label_ro: 'Echipă', label_en: 'Team', value_ro: '2 oameni, fără subcontractori', value_en: '2 people, no subcontractors' },
      { label_ro: 'Utilizatori', label_en: 'Users', value_ro: '40 interni, 4 roluri', value_en: '40 internal, 4 roles' },
    ],
    steps: [
      { title_ro: 'Schemă Postgres', title_en: 'Postgres schema', body_ro: 'Comenzi, rute, vehicule și șoferi modelate cu constrângeri în baza de date, astfel încât o dublă alocare este respinsă înainte să ajungă pe ecran.', body_en: 'Orders, routes, vehicles and drivers modelled with constraints in the database, so a double assignment is rejected before it reaches the screen.' },
      { title_ro: 'Roluri și jurnal de audit', title_en: 'Roles and audit log', body_ro: 'Patru roluri, cu permisiuni la nivel de rând. Orice modificare este înregistrată cu autor și oră, deci o comandă contestată poate fi reconstituită.', body_en: 'Four roles with row-level security. Every change is recorded with author and timestamp, so a disputed order can be reconstructed.' },
      { title_ro: 'Interfața dispecerului', title_en: 'Dispatcher interface', body_ro: 'Un singur ecran pentru ziua de lucru: comenzi deschise, vehicule disponibile, alocare de la tastatură. Construit în Nuxt, cu actualizări în timp real între dispeceri.', body_en: 'One screen for the working day: open orders, available vehicles, keyboard-driven assignment. Built in Nuxt with real-time updates between dispatchers.' },
      { title_ro: 'Migrare fără oprire', title_en: 'Migration without downtime', body_ro: 'Datele istorice au fost importate și reconciliate într-un weekend. Sistemul vechi a rămas accesibil pentru citire o lună, în caz că lipsea ceva.', body_en: 'Historical data imported and reconciled over one weekend. The old system stayed readable for a month, in case something was missing.' },
    ],
    stats: [
      { value: '[ X ]%', label_ro: 'mai puțin timp pe comandă', label_en: 'less time per order' },
      { value: '0', label_ro: 'comenzi duplicate de la lansare', label_en: 'duplicate orders since launch' },
      { value: '[ X ] €', label_ro: 'economisiți lunar pe unelte', label_en: 'saved monthly on tools' },
    ],
    images: [
      { alt_ro: 'ecran dispecerat', alt_en: 'dispatch board', aspect: '4/3', sort_order: 0 },
      { alt_ro: 'detaliu comandă', alt_en: 'order detail', aspect: '4/3', sort_order: 1 },
    ],
  },
  {
    slug: 'portal-clienti',
    tech: ['Next.js', 'Postgres'],
    year: 2026,
    card_title_ro: 'Portal de clienți, Germania',
    card_title_en: 'Client portal, Germany',
    summary_ro:
      'Documente, facturi și aprobări pentru o firmă de contabilitate. Permisiuni pe fiecare client, jurnal de audit pentru orice acțiune.',
    summary_en:
      'Documents, invoices and approvals for an accounting firm. Row-level security per client, audit log on every action.',
    title_ro: 'O firmă de contabilitate a încetat să trimită documente pe email',
    title_en: 'An accounting firm stopped sending documents by email',
    lead_ro:
      'Documente, facturi și aprobări pentru 120 de firme-client, într-un singur portal cu permisiuni pe fiecare client.',
    lead_en:
      'Documents, invoices and approvals for 120 client companies, in one portal with permissions per client.',
    cover_alt_ro: 'Portal de clienți, Germania',
    cover_alt_en: 'Client portal, Germany',
    hero_alt_ro: 'O firmă de contabilitate a încetat să trimită documente pe email',
    hero_alt_en: 'An accounting firm stopped sending documents by email',
    context_heading_ro: 'Fiecare document trecea prin aceeași cutie poștală',
    context_heading_en: 'Every document went through one inbox',
    context_body_ro:
      'Clienții trimiteau bilanțuri și facturi ca atașamente pe email. Angajații redenumeau fișierele manual și le puneau în foldere partajate. Nimeni nu putea spune dacă un document a fost primit, aprobat sau încă așteaptă, iar un atașament greșit însemna că datele unui client ajungeau la altul.\n\nFuseseră încercate două portaluri gata făcute. Niciunul nu putea reproduce lanțul de aprobări al firmei.',
    context_body_en:
      "Clients sent balance sheets and invoices as email attachments. Staff renamed files by hand and stored them in shared folders. Nobody could say whether a document had been received, approved or was still waiting, and a wrong attachment meant one client's data reached another.\n\nTwo off-the-shelf portals had been tried. Neither could model the firm's approval chain.",
    solution_heading_ro: 'Mai întâi izolarea datelor, apoi confortul',
    solution_heading_en: 'Isolation first, convenience second',
    quote_ro: '[ Citat client — una sau două propoziții despre ce s-a schimbat după lansare. ]',
    quote_en: '[ Client quote — one or two sentences on what changed after launch. ]',
    next_title_ro: 'Documentele tale încă trăiesc pe email?',
    next_title_en: 'Are your documents still living in email?',
    sort_order: 1,
    facts: [
      { label_ro: 'Client', label_en: 'Client', value_ro: 'Firmă de contabilitate, Germania', value_en: 'Accounting firm, Germany' },
      { label_ro: 'Durată', label_en: 'Duration', value_ro: '11 săptămâni până în producție', value_en: '11 weeks to production' },
      { label_ro: 'Echipă', label_en: 'Team', value_ro: '2 oameni, fără subcontractori', value_en: '2 people, no subcontractors' },
      { label_ro: 'Utilizatori', label_en: 'Users', value_ro: '120 firme-client, 3 roluri', value_en: '120 client companies, 3 roles' },
    ],
    steps: [
      { title_ro: 'Permisiuni pe client', title_en: 'Permissions per client', body_ro: 'Permisiuni la nivel de rând în Postgres: un client vede doar documentele lui, garantat de baza de date, nu de interfață.', body_en: 'Row-level security in Postgres: a client sees only its own documents, enforced by the database rather than by the interface.' },
      { title_ro: 'Lanț de aprobări', title_en: 'Approval chain', body_ro: 'Încărcare, verificare, aprobare și arhivare ca stări explicite. Fiecare trecere este înregistrată cu autor și oră.', body_en: 'Upload, review, approval and archiving as explicit states. Each transition is logged with author and timestamp.' },
      { title_ro: 'Interfața clientului', title_en: 'Client interface', body_ro: 'O pagină per client: ce se cere luna aceasta, ce a fost depus, ce lipsește. Construit în Next.js, funcțional și pe telefon.', body_en: 'One page per client: what is required this month, what has been submitted, what is missing. Built in Next.js, usable on a phone.' },
      { title_ro: 'Migrarea arhivei', title_en: 'Archive migration', body_ro: 'Patru ani de documente importate din folderele partajate, deduplicate și atașate clientului corect.', body_en: 'Four years of documents imported from shared folders, deduplicated and attached to the right client.' },
    ],
    stats: [
      { value: '[ X ]%', label_ro: 'mai puțin timp pe urmărirea documentelor', label_en: 'less time spent chasing documents' },
      { value: '0', label_ro: 'documente trimise clientului greșit', label_en: 'documents sent to the wrong client' },
      { value: '[ X ] €', label_ro: 'economisiți lunar pe muncă manuală', label_en: 'saved monthly on manual work' },
    ],
    images: [
      { alt_ro: 'tablou de bord client', alt_en: 'client dashboard', aspect: '4/3', sort_order: 0 },
      { alt_ro: 'detaliu document', alt_en: 'document detail', aspect: '4/3', sort_order: 1 },
    ],
  },
  {
    slug: 'asistent-documente',
    tech: ['Vue', 'pgvector'],
    year: 2026,
    card_title_ro: 'Asistent pe documente, Moldova',
    card_title_en: 'Document assistant, Moldova',
    summary_ro:
      'Căutare semantică în 12.000 de contracte, cu răspunsuri bazate pe citate. Cost limitat pe fiecare interogare.',
    summary_en:
      'Semantic search across 12,000 contracts with answers grounded in citations. Response cost capped per query.',
    title_ro: 'Douăsprezece mii de contracte, căutabile într-o propoziție',
    title_en: 'Twelve thousand contracts, searchable in one sentence',
    lead_ro:
      'Căutare semantică într-o arhivă de contracte, cu răspunsuri care citează paragraful din care provin.',
    lead_en: 'Semantic search over an archive of contracts, with answers that cite the paragraph they came from.',
    cover_alt_ro: 'Asistent pe documente, Moldova',
    cover_alt_en: 'Document assistant, Moldova',
    hero_alt_ro: 'Douăsprezece mii de contracte, căutabile într-o propoziție',
    hero_alt_en: 'Twelve thousand contracts, searchable in one sentence',
    context_heading_ro: 'Răspunsul exista, dar doar trei oameni știau unde',
    context_heading_en: 'The answer existed, but only three people knew where',
    context_body_ro:
      'Contractele erau păstrate ca PDF-uri scanate, în foldere adunate peste zece ani. Un răspuns despre o clauză de penalitate însemna un jurist care deschide fișier după fișier, uneori o oră. Căutarea în text nu returna nimic, pentru că scanările nu aveau strat de text.\n\nUn experiment anterior cu un chatbot fusese abandonat: răspundea sigur pe el și nu putea fi verificat.',
    context_body_en:
      'Contracts were stored as scanned PDFs across a decade of folders. Answering a question about a penalty clause meant a lawyer opening files one by one, sometimes for an hour. Full-text search returned nothing, because the scans had no text layer.\n\nAn earlier chatbot experiment had been dropped: it answered confidently and could not be checked.',
    solution_heading_ro: 'Niciun răspuns fără sursă',
    solution_heading_en: 'No answer without a source',
    quote_ro: '[ Citat client — una sau două propoziții despre ce s-a schimbat după lansare. ]',
    quote_en: '[ Client quote — one or two sentences on what changed after launch. ]',
    next_title_ro: 'Arhiva ta este imposibil de căutat?',
    next_title_en: 'Is your archive impossible to search?',
    sort_order: 2,
    facts: [
      { label_ro: 'Client', label_en: 'Client', value_ro: 'Departament juridic, Moldova', value_en: 'Legal department, Moldova' },
      { label_ro: 'Durată', label_en: 'Duration', value_ro: '7 săptămâni până în producție', value_en: '7 weeks to production' },
      { label_ro: 'Echipă', label_en: 'Team', value_ro: '2 oameni, fără subcontractori', value_en: '2 people, no subcontractors' },
      { label_ro: 'Utilizatori', label_en: 'Users', value_ro: '12.000 de contracte indexate', value_en: '12,000 contracts indexed' },
    ],
    steps: [
      { title_ro: 'Extragere de text și OCR', title_en: 'Text extraction and OCR', body_ro: 'Fiecare scanare a trecut prin OCR, împărțită pe paragrafe și stocată cu pagină și poziție, ca orice pasaj să poată fi indicat exact.', body_en: 'Every scan passed through OCR, split into paragraphs and stored with page and position, so any passage can be pointed back to.' },
      { title_ro: 'Căutare cu citate', title_en: 'Search with citations', body_ro: 'Embeddings în pgvector, răspunsuri construite numai din paragrafele găsite. Fiecare frază duce la contractul și pagina din care provine.', body_en: 'Embeddings in pgvector, answers assembled only from retrieved paragraphs. Each sentence links to the contract and page it came from.' },
      { title_ro: 'Control al costului', title_en: 'Cost control', body_ro: 'Limită fixă pe interogare și plafon lunar. Întrebările repetate sunt servite din cache, nu de model.', body_en: 'A hard cap per query and a monthly ceiling. Repeated questions are served from cache instead of the model.' },
      { title_ro: 'Evaluare înainte de lansare', title_en: 'Evaluation before launch', body_ro: 'Un set de 200 de întrebări reale cu răspunsuri verificate de juriști, rulat la fiecare modificare a sistemului.', body_en: 'A set of 200 real questions with lawyer-verified answers, run on every change to the system.' },
    ],
    stats: [
      { value: '[ X ]%', label_ro: 'mai puțin timp pe o căutare', label_en: 'less time per search' },
      { value: '100%', label_ro: 'din răspunsuri au un citat', label_en: 'of answers carry a citation' },
      { value: '[ X ] €', label_ro: 'cost de model pe lună, plafonat', label_en: 'model cost per month, capped' },
    ],
    images: [
      { alt_ro: 'ecran de căutare', alt_en: 'search screen', aspect: '4/3', sort_order: 0 },
      { alt_ro: 'răspuns cu citate', alt_en: 'answer with citations', aspect: '4/3', sort_order: 1 },
    ],
  },
]

for (const p of projects) {
  const { facts, steps, stats, images, ...row } = p
  const { data: inserted, error } = await supabase
    .from('projects')
    .upsert(
      { slug_ro: p.slug, slug_en: p.slug, tech: p.tech, published_at: new Date().toISOString(), ...row },
      { onConflict: 'slug_ro' },
    )
    .select('id')
    .single()
  if (error) throw new Error(`project ${p.slug}: ${error.message}`)
  const projectId = inserted.id

  await supabase.from('project_facts').delete().eq('project_id', projectId)
  check(`facts ${p.slug}`, await supabase.from('project_facts').insert(facts.map((f, i) => ({ ...f, project_id: projectId, sort_order: i }))))

  await supabase.from('project_steps').delete().eq('project_id', projectId)
  check(`steps ${p.slug}`, await supabase.from('project_steps').insert(steps.map((s, i) => ({ ...s, project_id: projectId, sort_order: i }))))

  await supabase.from('project_stats').delete().eq('project_id', projectId)
  check(`stats ${p.slug}`, await supabase.from('project_stats').insert(stats.map((s, i) => ({ ...s, project_id: projectId, sort_order: i }))))

  await supabase.from('project_images').delete().eq('project_id', projectId)
  check(
    `images ${p.slug}`,
    await supabase.from('project_images').insert(images.map((img, i) => ({ ...img, path: '', project_id: projectId, sort_order: i }))),
  )

  console.log(`✔ project ${p.slug}`)
}

// ── Services ──────────────────────────────────────────────────────────────

const services = [
  {
    key: 'websites',
    level_label_ro: 'Nivel 01',
    level_label_en: 'Level 01',
    name_ro: 'Site-uri',
    name_en: 'Websites',
    heading_ro: 'Site-uri făcute pur și simplu bine',
    heading_en: 'Websites that are simply built well',
    body_ro: 'Site de prezentare, landing page, magazin online. Scrise de mână, rapide, indexabile, editabile de tine. Fără page builder care încetinește site-ul.',
    body_en: 'Presentation sites, landing pages and online stores. Written by hand, fast, indexable, editable by you. No page builder to slow the site down.',
    duration_ro: '1 – 3 săptămâni',
    duration_en: '1 – 3 weeks',
    layout: 'rows',
    sort_order: 0,
    items: [
      { label_ro: 'Site de prezentare', label_en: 'Presentation site', body_ro: 'Până la 8 pagini, CMS pentru texte și imagini, formular de contact.', body_en: 'Up to 8 pages, CMS for text and images, contact form.' },
      { label_ro: 'Landing page', label_en: 'Landing page', body_ro: 'O pagină construită pentru conversie, cu analytics și testare A/B.', body_en: 'One page built for conversion, analytics and A/B testing included.' },
      { label_ro: 'Magazin online', label_en: 'Online store', body_ro: 'Catalog, coș, plată cu cardul, integrări de facturare și livrare.', body_en: 'Catalogue, cart, card payments, invoicing and delivery integrations.' },
    ],
  },
  {
    key: 'web_apps',
    level_label_ro: 'Nivel 02',
    level_label_en: 'Level 02',
    name_ro: 'Aplicații web',
    name_en: 'Web applications',
    heading_ro: 'Aplicații web',
    heading_en: 'Web applications',
    body_ro: 'Când munca este logică de business, nu pagini: roluri și permisiuni, modelare de date, integrări, automatizări.',
    body_en: 'When the work is business logic rather than pages: roles and permissions, data modelling, integrations, automation.',
    duration_ro: '6 – 12 săptămâni',
    duration_en: '6 – 12 weeks',
    layout: 'cards',
    sort_order: 1,
    items: [
      { label_ro: 'Aplicații web pe măsură', label_en: 'Custom web applications', body_ro: 'Interfețe și logică de business scrise de la zero în Vue/Nuxt sau React/Next, cu TypeScript strict. Fără teme cumpărate, fără plugin-uri lipite unul de altul.', body_en: 'Interfaces and business logic written from scratch in Vue/Nuxt or React/Next with strict TypeScript. No purchased themes, no plugins glued together.' },
      { label_ro: 'Backend, bază de date, deployment', label_en: 'Backend, database, deployment', body_ro: 'Schemă Postgres, autentificare, permisiuni la nivel de rând, storage și API pe Supabase. Configurăm CI, domenii și monitorizare, apoi predăm accesul complet.', body_en: 'Postgres schema, authentication, row-level security, storage and APIs on Supabase. CI, domains and monitoring configured, then full access handed to you.' },
      { label_ro: 'Funcționalități cu AI', label_en: 'AI-integrated features', body_ro: 'Integrări LLM care rezolvă o sarcină concretă: extragerea datelor din documente, căutare semantică, asistenți interni. Cu limite de cost și evaluare, nu demo-uri.', body_en: 'LLM integrations that solve one concrete task: extracting data from documents, semantic search, internal assistants. With cost limits and evaluation, not demos.' },
      { label_ro: 'Preluarea proiectelor blocate', label_en: 'Taking over stalled projects', body_ro: 'Audit al unui build no-code neterminat sau al unui cod moștenit, raport scris cu ce se poate păstra și ce trebuie rescris, apoi ducem proiectul în producție.', body_en: 'An audit of an unfinished no-code build or an inherited codebase, a written report on what can be kept and what has to be rewritten, then we take the project to production.' },
    ],
  },
]

for (const s of services) {
  const { items, ...row } = s
  const { data: inserted, error } = await supabase.from('services').upsert(row, { onConflict: 'key' }).select('id').single()
  if (error) throw new Error(`service ${s.key}: ${error.message}`)
  await supabase.from('service_items').delete().eq('service_id', inserted.id)
  check(
    `service items ${s.key}`,
    await supabase.from('service_items').insert(items.map((it, i) => ({ ...it, service_id: inserted.id, sort_order: i }))),
  )
}

// ── Stack ─────────────────────────────────────────────────────────────────

await supabase.from('stack_groups').delete().neq('id', '00000000-0000-0000-0000-000000000000')
check(
  'stack_groups',
  await supabase.from('stack_groups').insert([
    { name: 'Frontend', items: ['Vue 3', 'Nuxt', 'React', 'Next.js', 'TypeScript', 'Tailwind'], sort_order: 0 },
    { name: 'Backend', items: ['PostgreSQL', 'Node', 'Supabase', 'Drizzle', 'Edge Functions'], sort_order: 1 },
    { name: 'Infra', items: ['Vercel', 'Cloudflare', 'Docker', 'GitHub Actions'], sort_order: 2 },
    { name: 'AI', items: ['OpenAI', 'Anthropic', 'pgvector', 'Streaming'], sort_order: 3 },
    { name: 'Site-uri', items: ['WordPress', 'Shopify'], sort_order: 4 },
  ]),
)

// ── Process ───────────────────────────────────────────────────────────────

await supabase.from('process_steps').delete().neq('id', '00000000-0000-0000-0000-000000000000')
check(
  'process_steps',
  await supabase.from('process_steps').insert([
    { title_ro: 'Diagnostic', title_en: 'Diagnostic call', body_ro: 'Șaizeci de minute despre problemă, constrângeri și buget. Primești o evaluare scrisă cu scope, durată și riscuri în 48 de ore.', body_en: 'Sixty minutes on the problem, the constraints and the budget. You get a written assessment with scope, duration and risks within 48 hours.', sort_order: 0 },
    { title_ro: 'Specificație', title_en: 'Specification', body_ro: 'Scope împărțit pe module, machete pentru ecranele principale, preț fix pe etapă. Nimic nu începe înainte de a fi semnat.', body_en: 'Scope broken into modules, wireframes for the main screens, a fixed price per stage. Nothing starts before it is signed.', sort_order: 1 },
    { title_ro: 'Iterații de două săptămâni', title_en: 'Two-week iterations', body_ro: 'Environment de staging din prima săptămână. Vezi produsul care rulează, nu rapoarte de status.', body_en: 'A staging environment from the first week. You see the running product, not status reports.', sort_order: 2 },
    { title_ro: 'Predare completă', title_en: 'Full handover', body_ro: 'Cod în repo-ul tău, documentație de deployment, o sesiune de handover și 30 de zile de suport pentru bug-uri.', body_en: 'Code in your repository, deployment documentation, one handover session and 30 days of bug support.', sort_order: 3 },
  ]),
)

// ── FAQ ───────────────────────────────────────────────────────────────────

await supabase.from('faqs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
check(
  'faqs',
  await supabase.from('faqs').insert([
    { question_ro: 'Cât costă un proiect?', question_en: 'What does a project cost?', answer_ro: 'Majoritatea proiectelor pornesc de la 6.000 EUR pentru o primă versiune funcțională și continuă pe etape. Evaluarea scrisă de după diagnostic conține întotdeauna o cifră.', answer_en: 'Most projects start at 6,000 EUR for a working first version and move in stages from there. The written assessment after the diagnostic call always contains a number.', sort_order: 0, published_at: new Date().toISOString() },
    { question_ro: 'Preluați proiecte începute de altcineva?', question_en: "Do you take over someone else's project?", answer_ro: 'Da, după un audit plătit. Auditul este un document scris: ce funcționează, ce trebuie rescris și cât costă până în producție.', answer_en: 'Yes, after a paid audit. The audit is a written document: what works, what has to be rewritten, and what it costs to reach production.', sort_order: 1, published_at: new Date().toISOString() },
    { question_ro: 'Cât durează livrarea?', question_en: 'How long does delivery take?', answer_ro: 'O primă versiune în producție durează de obicei șase până la douăsprezece săptămâni, în funcție de cât din domeniu trebuie modelat în bază de date.', answer_en: 'A first production version is usually six to twelve weeks, depending on how much of the domain has to be modelled in the database.', sort_order: 2, published_at: new Date().toISOString() },
    { question_ro: 'Ce se întâmplă după predare?', question_en: 'What happens after handover?', answer_ro: 'Treizeci de zile de suport pentru bug-uri sunt incluse. După aceea poți continua cu un abonament lunar sau cu echipa ta. Ambele variante funcționează.', answer_en: 'Thirty days of bug support are included. After that you can keep us on a monthly retainer or run the project with your own team. Both work.', sort_order: 3, published_at: new Date().toISOString() },
  ]),
)

// ── Site settings ─────────────────────────────────────────────────────────

check(
  'site_settings',
  await supabase.from('site_settings').upsert({
    id: 1,
    contact_email: 'contact@codepedia.md',
    contact_phone: '+373 69 117 329',
    hours: '09:00 – 18:00 EET',
    response_time_ro: '1 zi lucrătoare',
    response_time_en: '1 working day',
    nda_note_ro: 'Unele proiecte sunt sub NDA. Referințe detaliate la discuția de diagnostic.',
    nda_note_en: 'Some projects are under NDA. Detailed references available on the diagnostic call.',
    footer_line_ro: 'Codepedia SRL · Chișinău, Moldova',
    footer_line_en: 'Codepedia SRL · Chișinău, Moldova',
    copyright_year: 2026,
  }),
)

console.log('\nSeed complete.')
