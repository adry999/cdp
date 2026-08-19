export interface ServiceRow {
  label: string
  text: string
}

export interface ServiceCard {
  number: string
  title: string
  text: string
}

interface ServicesContent {
  level1Rows: ServiceRow[]
  level2Cards: ServiceCard[]
}

export const services: Record<'ro' | 'en', ServicesContent> = {
  ro: {
    level1Rows: [
      {
        label: 'Site de prezentare',
        text: 'Până la 8 pagini, CMS pentru texte și imagini, formular de contact.',
      },
      {
        label: 'Landing page',
        text: 'O pagină construită pentru conversie, cu analytics și testare A/B.',
      },
      {
        label: 'Magazin online',
        text: 'Catalog, coș, plată cu cardul, integrări de facturare și livrare.',
      },
    ],
    level2Cards: [
      {
        number: '01',
        title: 'Aplicații web pe măsură',
        text: 'Interfețe și logică de business scrise de la zero în Vue/Nuxt sau React/Next, cu TypeScript strict. Fără teme cumpărate, fără plugin-uri lipite unul de altul.',
      },
      {
        number: '02',
        title: 'Backend, bază de date, deployment',
        text: 'Schemă Postgres, autentificare, permisiuni la nivel de rând, storage și API pe Supabase. Configurăm CI, domenii și monitorizare, apoi predăm accesul complet.',
      },
      {
        number: '03',
        title: 'Funcționalități cu AI',
        text: 'Integrări LLM care rezolvă o sarcină concretă: extragerea datelor din documente, căutare semantică, asistenți interni. Cu limite de cost și evaluare, nu demo-uri.',
      },
      {
        number: '04',
        title: 'Preluarea proiectelor blocate',
        text: 'Audit al unui build no-code neterminat sau al unui cod moștenit, raport scris cu ce se poate păstra și ce trebuie rescris, apoi ducem proiectul în producție.',
      },
    ],
  },
  en: {
    level1Rows: [
      {
        label: 'Presentation site',
        text: 'Up to 8 pages, CMS for text and images, contact form.',
      },
      {
        label: 'Landing page',
        text: 'One page built for conversion, analytics and A/B testing included.',
      },
      {
        label: 'Online store',
        text: 'Catalogue, cart, card payments, invoicing and delivery integrations.',
      },
    ],
    level2Cards: [
      {
        number: '01',
        title: 'Custom web applications',
        text: 'Interfaces and business logic written from scratch in Vue/Nuxt or React/Next with strict TypeScript. No purchased themes, no plugins glued together.',
      },
      {
        number: '02',
        title: 'Backend, database, deployment',
        text: 'Postgres schema, authentication, row-level security, storage and APIs on Supabase. CI, domains and monitoring configured, then full access handed to you.',
      },
      {
        number: '03',
        title: 'AI-integrated features',
        text: 'LLM integrations that solve one concrete task: extracting data from documents, semantic search, internal assistants. With cost limits and evaluation, not demos.',
      },
      {
        number: '04',
        title: 'Taking over stalled projects',
        text: 'An audit of an unfinished no-code build or an inherited codebase, a written report on what can be kept and what has to be rewritten, then we take the project to production.',
      },
    ],
  },
}
