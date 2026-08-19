export interface ProjectStat {
  value: string
  label: string
}

export interface ProjectStep {
  number: string
  title: string
  text: string
}

export interface CaseStudy {
  tech: string[]
  year: string
  heroTitle: string
  heroLead: string
  mainScreenshotLabel: string
  facts: { client: string; duration: string; team: string; users: string }
  contextTitle: string
  contextParagraphs: string[]
  solutionTitle: string
  steps: ProjectStep[]
  gallery: string[]
  resultStats: ProjectStat[]
  quote: string
  attribution: string
  nextTitle: string
}

export interface Project {
  slug: string
  tech: string[]
  title: string
  text: string
  thumbnailLabel: string
  caseStudy: CaseStudy
}

export const projects: Record<'ro' | 'en', Project[]> = {
  ro: [
    {
      slug: 'saas-logistica',
      tech: ['Nuxt', 'Supabase'],
      title: 'SaaS de logistică, România',
      text: 'Gestiune de comenzi și flotă pentru 40 de utilizatori interni. Reconstruit dintr-un setup Airtable și Zapier care nu mai făcea față.',
      thumbnailLabel: '[ captură dashboard ]',
      caseStudy: {
        tech: ['Nuxt', 'Supabase'],
        year: '2026',
        heroTitle: 'O firmă de logistică a renunțat la Airtable și Zapier',
        heroLead:
          'Gestiune de comenzi și flotă pentru 40 de utilizatori interni, reconstruită ca o singură aplicație, cu o bază de date reală dedesubt.',
        mainScreenshotLabel: '[ captură principală — 1600 × 900 ]',
        facts: {
          client: 'Casă de expediții, România',
          duration: '9 săptămâni până în producție',
          team: '2 oameni, fără subcontractori',
          users: '40 interni, 4 roluri',
        },
        contextTitle: 'Unsprezece tabele, șase automatizări și un singur om care le înțelegea',
        contextParagraphs: [
          'Dispeceratul funcționa pe Airtable, cu fluxuri Zapier deasupra. La zece utilizatori era în regulă. La patruzeci apăreau comenzi duplicate, înregistrări pe care nimeni nu le putea urmări și o factură lunară care creștea cu fiecare automatizare nouă. Nimic nu era verificat: un șofer putea fi alocat la două rute în aceeași oră.',
          'Firma plătise deja o agenție pentru o rescriere. Aceasta s-a oprit la ecranul de autentificare.',
        ],
        solutionTitle: 'Mai întâi baza de date, apoi interfața',
        steps: [
          {
            number: '01',
            title: 'Schemă Postgres',
            text: 'Comenzi, rute, vehicule și șoferi modelate cu constrângeri în baza de date, astfel încât o dublă alocare este respinsă înainte să ajungă pe ecran.',
          },
          {
            number: '02',
            title: 'Roluri și jurnal de audit',
            text: 'Patru roluri, cu permisiuni la nivel de rând. Orice modificare este înregistrată cu autor și oră, deci o comandă contestată poate fi reconstituită.',
          },
          {
            number: '03',
            title: 'Interfața dispecerului',
            text: 'Un singur ecran pentru ziua de lucru: comenzi deschise, vehicule disponibile, alocare de la tastatură. Construit în Nuxt, cu actualizări în timp real între dispeceri.',
          },
          {
            number: '04',
            title: 'Migrare fără oprire',
            text: 'Datele istorice au fost importate și reconciliate într-un weekend. Sistemul vechi a rămas accesibil pentru citire o lună, în caz că lipsea ceva.',
          },
        ],
        gallery: ['[ ecran dispecerat ]', '[ detaliu comandă ]'],
        resultStats: [
          { value: '[ X ]%', label: 'mai puțin timp pe comandă' },
          { value: '0', label: 'comenzi duplicate de la lansare' },
          { value: '[ X ] €', label: 'economisiți lunar pe unelte' },
        ],
        quote: '[ Citat client — una sau două propoziții despre ce s-a schimbat după lansare. ]',
        attribution: '[ Nume ], [ funcție ], [ companie ]',
        nextTitle: 'Ai un proiect blocat în același punct?',
      },
    },
    {
      slug: 'portal-clienti',
      tech: ['Next.js', 'Postgres'],
      title: 'Portal de clienți, Germania',
      text: 'Documente, facturi și aprobări pentru o firmă de contabilitate. Permisiuni pe fiecare client, jurnal de audit pentru orice acțiune.',
      thumbnailLabel: '[ captură portal ]',
      caseStudy: {
        tech: ['Next.js', 'Postgres'],
        year: '2026',
        heroTitle: 'O firmă de contabilitate a încetat să trimită documente pe email',
        heroLead:
          'Documente, facturi și aprobări pentru 120 de firme-client, într-un singur portal cu permisiuni pe fiecare client.',
        mainScreenshotLabel: '[ captură principală — 1600 × 900 ]',
        facts: {
          client: 'Firmă de contabilitate, Germania',
          duration: '11 săptămâni până în producție',
          team: '2 oameni, fără subcontractori',
          users: '120 firme-client, 3 roluri',
        },
        contextTitle: 'Fiecare document trecea prin aceeași cutie poștală',
        contextParagraphs: [
          'Clienții trimiteau bilanțuri și facturi ca atașamente pe email. Angajații redenumeau fișierele manual și le puneau în foldere partajate. Nimeni nu putea spune dacă un document a fost primit, aprobat sau încă așteaptă, iar un atașament greșit însemna că datele unui client ajungeau la altul.',
          'Fuseseră încercate două portaluri gata făcute. Niciunul nu putea reproduce lanțul de aprobări al firmei.',
        ],
        solutionTitle: 'Mai întâi izolarea datelor, apoi confortul',
        steps: [
          {
            number: '01',
            title: 'Permisiuni pe client',
            text: 'Permisiuni la nivel de rând în Postgres: un client vede doar documentele lui, garantat de baza de date, nu de interfață.',
          },
          {
            number: '02',
            title: 'Lanț de aprobări',
            text: 'Încărcare, verificare, aprobare și arhivare ca stări explicite. Fiecare trecere este înregistrată cu autor și oră.',
          },
          {
            number: '03',
            title: 'Interfața clientului',
            text: 'O pagină per client: ce se cere luna aceasta, ce a fost depus, ce lipsește. Construit în Next.js, funcțional și pe telefon.',
          },
          {
            number: '04',
            title: 'Migrarea arhivei',
            text: 'Patru ani de documente importate din folderele partajate, deduplicate și atașate clientului corect.',
          },
        ],
        gallery: ['[ tablou de bord client ]', '[ detaliu document ]'],
        resultStats: [
          { value: '[ X ]%', label: 'mai puțin timp pe urmărirea documentelor' },
          { value: '0', label: 'documente trimise clientului greșit' },
          { value: '[ X ] €', label: 'economisiți lunar pe muncă manuală' },
        ],
        quote: '[ Citat client — una sau două propoziții despre ce s-a schimbat după lansare. ]',
        attribution: '[ Nume ], [ funcție ], [ companie ]',
        nextTitle: 'Documentele tale încă trăiesc pe email?',
      },
    },
    {
      slug: 'asistent-documente',
      tech: ['Vue', 'pgvector'],
      title: 'Asistent pe documente, Moldova',
      text: 'Căutare semantică în 12.000 de contracte, cu răspunsuri bazate pe citate. Cost limitat pe fiecare interogare.',
      thumbnailLabel: '[ captură asistent ]',
      caseStudy: {
        tech: ['Vue', 'pgvector'],
        year: '2026',
        heroTitle: 'Douăsprezece mii de contracte, căutabile într-o propoziție',
        heroLead:
          'Căutare semantică într-o arhivă de contracte, cu răspunsuri care citează paragraful din care provin.',
        mainScreenshotLabel: '[ captură principală — 1600 × 900 ]',
        facts: {
          client: 'Departament juridic, Moldova',
          duration: '7 săptămâni până în producție',
          team: '2 oameni, fără subcontractori',
          users: '12.000 de contracte indexate',
        },
        contextTitle: 'Răspunsul exista, dar doar trei oameni știau unde',
        contextParagraphs: [
          'Contractele erau păstrate ca PDF-uri scanate, în foldere adunate peste zece ani. Un răspuns despre o clauză de penalitate însemna un jurist care deschide fișier după fișier, uneori o oră. Căutarea în text nu returna nimic, pentru că scanările nu aveau strat de text.',
          'Un experiment anterior cu un chatbot fusese abandonat: răspundea sigur pe el și nu putea fi verificat.',
        ],
        solutionTitle: 'Niciun răspuns fără sursă',
        steps: [
          {
            number: '01',
            title: 'Extragere de text și OCR',
            text: 'Fiecare scanare a trecut prin OCR, împărțită pe paragrafe și stocată cu pagină și poziție, ca orice pasaj să poată fi indicat exact.',
          },
          {
            number: '02',
            title: 'Căutare cu citate',
            text: 'Embeddings în pgvector, răspunsuri construite numai din paragrafele găsite. Fiecare frază duce la contractul și pagina din care provine.',
          },
          {
            number: '03',
            title: 'Control al costului',
            text: 'Limită fixă pe interogare și plafon lunar. Întrebările repetate sunt servite din cache, nu de model.',
          },
          {
            number: '04',
            title: 'Evaluare înainte de lansare',
            text: 'Un set de 200 de întrebări reale cu răspunsuri verificate de juriști, rulat la fiecare modificare a sistemului.',
          },
        ],
        gallery: ['[ ecran de căutare ]', '[ răspuns cu citate ]'],
        resultStats: [
          { value: '[ X ]%', label: 'mai puțin timp pe o căutare' },
          { value: '100%', label: 'din răspunsuri au un citat' },
          { value: '[ X ] €', label: 'cost de model pe lună, plafonat' },
        ],
        quote: '[ Citat client — una sau două propoziții despre ce s-a schimbat după lansare. ]',
        attribution: '[ Nume ], [ funcție ], [ companie ]',
        nextTitle: 'Arhiva ta este imposibil de căutat?',
      },
    },
  ],
  en: [
    {
      slug: 'saas-logistica',
      tech: ['Nuxt', 'Supabase'],
      title: 'Logistics SaaS, Romania',
      text: 'Order and fleet management for 40 internal users. Rebuilt from an Airtable and Zapier setup that had stopped scaling.',
      thumbnailLabel: '[ dashboard screenshot ]',
      caseStudy: {
        tech: ['Nuxt', 'Supabase'],
        year: '2026',
        heroTitle: 'A logistics company left Airtable and Zapier behind',
        heroLead:
          'Order and fleet management for 40 internal users, rebuilt as one application with a real database underneath.',
        mainScreenshotLabel: '[ main screenshot — 1600 × 900 ]',
        facts: {
          client: 'Freight forwarder, Romania',
          duration: '9 weeks to production',
          team: '2 people, no subcontractors',
          users: '40 internal, 4 roles',
        },
        contextTitle: 'Eleven tables, six automations, one person who understood it',
        contextParagraphs: [
          'Dispatch ran on Airtable with Zapier flows on top. It worked at ten users. At forty it produced duplicate orders, records nobody could trace, and a monthly bill that grew with every new automation. Nothing was verified: a driver could be assigned to two routes at the same hour.',
          'The company had already paid an agency for a rewrite. It stopped at the login screen.',
        ],
        solutionTitle: 'The database first, the interface second',
        steps: [
          {
            number: '01',
            title: 'Postgres schema',
            text: 'Orders, routes, vehicles and drivers modelled with constraints in the database, so a double assignment is rejected before it reaches the screen.',
          },
          {
            number: '02',
            title: 'Roles and audit log',
            text: 'Four roles with row-level security. Every change is recorded with author and timestamp, so a disputed order can be reconstructed.',
          },
          {
            number: '03',
            title: 'Dispatcher interface',
            text: 'One screen for the working day: open orders, available vehicles, keyboard-driven assignment. Built in Nuxt with real-time updates between dispatchers.',
          },
          {
            number: '04',
            title: 'Migration without downtime',
            text: 'Historical data imported and reconciled over one weekend. The old system stayed readable for a month, in case something was missing.',
          },
        ],
        gallery: ['[ dispatch board ]', '[ order detail ]'],
        resultStats: [
          { value: '[ X ]%', label: 'less time per order' },
          { value: '0', label: 'duplicate orders since launch' },
          { value: '[ X ] €', label: 'saved monthly on tools' },
        ],
        quote: '[ Client quote — one or two sentences on what changed after launch. ]',
        attribution: '[ Name ], [ role ], [ company ]',
        nextTitle: 'Have a project stuck in the same place?',
      },
    },
    {
      slug: 'portal-clienti',
      tech: ['Next.js', 'Postgres'],
      title: 'Client portal, Germany',
      text: 'Documents, invoices and approvals for an accounting firm. Row-level security per client, audit log on every action.',
      thumbnailLabel: '[ portal screenshot ]',
      caseStudy: {
        tech: ['Next.js', 'Postgres'],
        year: '2026',
        heroTitle: 'An accounting firm stopped sending documents by email',
        heroLead:
          'Documents, invoices and approvals for 120 client companies, in one portal with permissions per client.',
        mainScreenshotLabel: '[ main screenshot — 1600 × 900 ]',
        facts: {
          client: 'Accounting firm, Germany',
          duration: '11 weeks to production',
          team: '2 people, no subcontractors',
          users: '120 client companies, 3 roles',
        },
        contextTitle: 'Every document went through one inbox',
        contextParagraphs: [
          "Clients sent balance sheets and invoices as email attachments. Staff renamed files by hand and stored them in shared folders. Nobody could say whether a document had been received, approved or was still waiting, and a wrong attachment meant one client's data reached another.",
          "Two off-the-shelf portals had been tried. Neither could model the firm's approval chain.",
        ],
        solutionTitle: 'Isolation first, convenience second',
        steps: [
          {
            number: '01',
            title: 'Permissions per client',
            text: 'Row-level security in Postgres: a client sees only its own documents, enforced by the database rather than by the interface.',
          },
          {
            number: '02',
            title: 'Approval chain',
            text: 'Upload, review, approval and archiving as explicit states. Each transition is logged with author and timestamp.',
          },
          {
            number: '03',
            title: 'Client interface',
            text: 'One page per client: what is required this month, what has been submitted, what is missing. Built in Next.js, usable on a phone.',
          },
          {
            number: '04',
            title: 'Archive migration',
            text: 'Four years of documents imported from shared folders, deduplicated and attached to the right client.',
          },
        ],
        gallery: ['[ client dashboard ]', '[ document detail ]'],
        resultStats: [
          { value: '[ X ]%', label: 'less time spent chasing documents' },
          { value: '0', label: 'documents sent to the wrong client' },
          { value: '[ X ] €', label: 'saved monthly on manual work' },
        ],
        quote: '[ Client quote — one or two sentences on what changed after launch. ]',
        attribution: '[ Name ], [ role ], [ company ]',
        nextTitle: 'Are your documents still living in email?',
      },
    },
    {
      slug: 'asistent-documente',
      tech: ['Vue', 'pgvector'],
      title: 'Document assistant, Moldova',
      text: 'Semantic search across 12,000 contracts with answers grounded in citations. Response cost capped per query.',
      thumbnailLabel: '[ assistant screenshot ]',
      caseStudy: {
        tech: ['Vue', 'pgvector'],
        year: '2026',
        heroTitle: 'Twelve thousand contracts, searchable in one sentence',
        heroLead: 'Semantic search over an archive of contracts, with answers that cite the paragraph they came from.',
        mainScreenshotLabel: '[ main screenshot — 1600 × 900 ]',
        facts: {
          client: 'Legal department, Moldova',
          duration: '7 weeks to production',
          team: '2 people, no subcontractors',
          users: '12,000 contracts indexed',
        },
        contextTitle: 'The answer existed, but only three people knew where',
        contextParagraphs: [
          'Contracts were stored as scanned PDFs across a decade of folders. Answering a question about a penalty clause meant a lawyer opening files one by one, sometimes for an hour. Full-text search returned nothing, because the scans had no text layer.',
          'An earlier chatbot experiment had been dropped: it answered confidently and could not be checked.',
        ],
        solutionTitle: 'No answer without a source',
        steps: [
          {
            number: '01',
            title: 'Text extraction and OCR',
            text: 'Every scan passed through OCR, split into paragraphs and stored with page and position, so any passage can be pointed back to.',
          },
          {
            number: '02',
            title: 'Search with citations',
            text: 'Embeddings in pgvector, answers assembled only from retrieved paragraphs. Each sentence links to the contract and page it came from.',
          },
          {
            number: '03',
            title: 'Cost control',
            text: 'A hard cap per query and a monthly ceiling. Repeated questions are served from cache instead of the model.',
          },
          {
            number: '04',
            title: 'Evaluation before launch',
            text: 'A set of 200 real questions with lawyer-verified answers, run on every change to the system.',
          },
        ],
        gallery: ['[ search screen ]', '[ answer with citations ]'],
        resultStats: [
          { value: '[ X ]%', label: 'less time per search' },
          { value: '100%', label: 'of answers carry a citation' },
          { value: '[ X ] €', label: 'model cost per month, capped' },
        ],
        quote: '[ Client quote — one or two sentences on what changed after launch. ]',
        attribution: '[ Name ], [ role ], [ company ]',
        nextTitle: 'Is your archive impossible to search?',
      },
    },
  ],
}
