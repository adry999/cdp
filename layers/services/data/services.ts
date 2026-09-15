import type { Service } from '#layers/services/domain/service'

export const SERVICES = [
  {
    slug: 'website',
    routeSlug: { ro: 'website', en: 'website' },
    name: { ro: 'Website', en: 'Website' },
    intro: {
      ro: 'O pagină de prezentare modernă care-ți validează ideea și atrage primii clienți. De la concept la lansare în zile, nu săptămâni.',
      en: 'A modern landing page that validates your idea and attracts early customers. From concept to launch in days, not weeks.',
    },
    features: [
      {
        ro: 'Design responsive optimizat pentru mobil și desktop, cu încărcare ultra-rapidă și SEO nativ.',
        en: 'Responsive design optimized for mobile and desktop, with ultra-fast loading and native SEO.',
      },
      {
        ro: 'Integrare directă cu formular sau Telegram ca să primești solicitări din prima zi.',
        en: 'Direct integration with forms or Telegram so you receive inquiries from day one.',
      },
      {
        ro: 'Arhitectură static-first pentru performanță maximă și costuri de hosting minime.',
        en: 'Static-first architecture for maximum performance and minimal hosting costs.',
      },
      {
        ro: 'Dashboard editorial simplu pentru a modifica text și imagini fără a ști cod.',
        en: 'Simple editorial dashboard to update copy and images without coding knowledge.',
      },
    ],
    process: [
      {
        title: { ro: 'Brief și alignment', en: 'Brief & alignment' },
        body: {
          ro: 'Confirmăm scopul exact, structura paginilor și integrările de care ai nevoie, direct în call.',
          en: 'We confirm the exact scope, page structure and integrations you need, directly on the call.',
        },
      },
      {
        title: { ro: 'Build și staging', en: 'Build & staging' },
        body: {
          ro: 'Site-ul apare live în 24–48 de ore pe un link de preview. Dai feedback pe versiunea reală, nu pe mockup.',
          en: 'The site goes live on a preview link within 24–48 hours. Give feedback on the real version, not a mockup.',
        },
      },
      {
        title: { ro: 'Lansare și suport', en: 'Launch & support' },
        body: {
          ro: 'Mutăm pe domeniu final, setăm email și SSL, și stăm lângă tine 7 zile pentru orice ajustare.',
          en: 'We move to your final domain, set up email and SSL, and stay with you for 7 days to fix anything.',
        },
      },
    ],
    priceFrom: null,
    qualifierStage: 'E',
  },
  {
    slug: 'web-app',
    routeSlug: { ro: 'aplicatie-web', en: 'web-app' },
    name: { ro: 'Aplicație web', en: 'Web app' },
    intro: {
      ro: 'Aplicație full-stack din designul tău în cod productiv, cu arhitectură scalabilă și zero compromisuri de calitate.',
      en: 'Full-stack application from your design into production code, with a scalable architecture and no quality shortcuts.',
    },
    features: [
      {
        ro: 'Cod pixel-perfect transpus din Figma, cu componentă și stări interactive încă din prima iterație.',
        en: 'Pixel-perfect code translated from Figma, with components and interactive states from the first iteration.',
      },
      {
        ro: 'Bază de date relațională scalabilă (PostgreSQL), cu migrații versionare și backup automat.',
        en: 'Scalable relational database (PostgreSQL) with versioned migrations and automatic backups.',
      },
      {
        ro: 'API REST sau GraphQL sigur, cu autentificare, rate-limiting și paginație.',
        en: 'Secure REST or GraphQL API with authentication, rate-limiting and pagination.',
      },
      {
        ro: 'Tests automate și deploy continuu pe Vercel sau cloud-ul tău, cu rollback instant.',
        en: 'Automated tests and continuous deployment to Vercel or your cloud, with instant rollback.',
      },
    ],
    process: [
      {
        title: { ro: 'Arhitectură și design sistem', en: 'Architecture & design system' },
        body: {
          ro: 'Planificăm schema DB, contractele API și componentele reutilizabile înainte de a tasta cod.',
          en: 'We plan the DB schema, API contracts and reusable components before writing code.',
        },
      },
      {
        title: { ro: 'Sprinturi de dezvoltare', en: 'Development sprints' },
        body: {
          ro: 'Fiecare două săptămâni apare o versiune live cu feature-uri noi. Tu dai feedback pe cod real.',
          en: 'Every two weeks a new version goes live with fresh features. You give feedback on real code.',
        },
      },
      {
        title: { ro: 'Handover și suport 30 de zile', en: 'Handover & 30-day support' },
        body: {
          ro: 'Transfer complet de repository, documentație și instruire. 30 de zile de suport tehnic inclus.',
          en: 'Full repository transfer, documentation and training. 30 days of technical support included.',
        },
      },
    ],
    priceFrom: null,
    qualifierStage: 'A',
  },
  {
    slug: 'wordpress',
    routeSlug: { ro: 'wordpress', en: 'wordpress' },
    name: { ro: 'WordPress', en: 'WordPress' },
    intro: {
      ro: 'Site WordPress rapid, securizat și ușor de menținut, pe infrastructura modernă cu cache și CDN global.',
      en: 'Fast, secure and easy-to-maintain WordPress site on modern infrastructure with caching and global CDN.',
    },
    features: [
      {
        ro: 'Instalare și configurare pe hosting performant (Kinsta, WP Engine sau serverul tău), cu SSL și backups zilnice.',
        en: 'Setup on high-performance hosting (Kinsta, WP Engine or your server) with SSL and daily backups.',
      },
      {
        ro: 'Temă WordPress custom din Figma, pixel-perfect, adaptat pentru mobile și fără plugin-uri inutile.',
        en: 'Custom WordPress theme from Figma, pixel-perfect, mobile-adapted and bloat-free.',
      },
      {
        ro: 'Integrări cu formulare (Formspree, Getform), Zapier pentru automat de muncă și CRM la fel.',
        en: 'Form integrations (Formspree, Getform), Zapier for workflow automation and CRM syncing.',
      },
      {
        ro: 'Optimizare SEO nativ (schema.org, speed insights) și suport editor content pe termen lung.',
        en: 'Native SEO optimization (schema.org, speed insights) and ongoing content editor support.',
      },
    ],
    process: [
      {
        title: { ro: 'Setup și temă custom', en: 'Setup & custom theme' },
        body: {
          ro: 'Alegem hosting, instalăm WordPress și construim tema din Figma fără a folosi template-uri preexistente.',
          en: 'We select hosting, install WordPress and build the theme from Figma without pre-made templates.',
        },
      },
      {
        title: { ro: 'Integrări și SEO', en: 'Integrations & SEO' },
        body: {
          ro: 'Conectăm formulare, email marketing, CRM și optimizez pentru Google Search Console și PageSpeed.',
          en: 'We wire up forms, email marketing, CRM and optimize for Google Search Console and PageSpeed.',
        },
      },
      {
        title: { ro: 'Lansare și training', en: 'Launch & training' },
        body: {
          ro: 'Site live, DNS configurat și o sesiune de 2 ore pentru a-ți arăta cum editezi conținut cu siguranță.',
          en: 'Site live, DNS configured and a 2-hour session showing you how to safely edit content.',
        },
      },
    ],
    priceFrom: null,
    qualifierStage: 'E',
  },
  {
    slug: 'shopify',
    routeSlug: { ro: 'shopify', en: 'shopify' },
    name: { ro: 'Shopify', en: 'Shopify' },
    intro: {
      ro: 'Magazin Shopify optimizat pentru conversie, cu design custom și integrări cu logistica și analitică reală.',
      en: 'Conversion-optimized Shopify store with custom design and real integrations for shipping and analytics.',
    },
    features: [
      {
        ro: 'Temă Shopify custom din Figma, mobile-first, cu checkout rapid și fără friction în cumpărare.',
        en: 'Custom Shopify theme from Figma, mobile-first, with fast checkout and frictionless purchasing.',
      },
      {
        ro: 'Integrare cu logistica (Wishe, Parcelly, DPD), plăți (Stripe, Apple Pay, Google Pay) și conturi bank.',
        en: 'Shipping integration (Wishbox, Parcelly, DPD), payments (Stripe, Apple Pay, Google Pay) and banking.',
      },
      {
        ro: 'Analytics și remarketing (Google Ads, Facebook Pixel), email marketing (Klaviyo) cu automații.',
        en: 'Analytics and remarketing (Google Ads, Facebook Pixel), email marketing (Klaviyo) with automation.',
      },
      {
        ro: 'Admin dashboard pentru produse, comenzi și inventar, cu sincronizare cu spreadsheet-uri live.',
        en: 'Admin dashboard for products, orders and inventory, with live spreadsheet sync.',
      },
    ],
    process: [
      {
        title: { ro: 'Plan și temă', en: 'Plan & theme' },
        body: {
          ro: 'Structurezi catalogul de produse, importezi din CSV, și aplicăm tema custom pixel-perfect din Figma.',
          en: 'We structure your product catalog, import from CSV, and apply your custom pixel-perfect theme from Figma.',
        },
      },
      {
        title: { ro: 'Integrări și test', en: 'Integrations & testing' },
        body: {
          ro: 'Conectăm shipping, plăți, email marketing și analytics. Testez fluxul de cumpărare de la start la thank you.',
          en: 'We wire up shipping, payments, email and analytics. We test the full purchase flow end-to-end.',
        },
      },
      {
        title: { ro: 'Lansare și training', en: 'Launch & training' },
        body: {
          ro: 'Magazin live, domeniu configurat și o sesiune de training pe admin, inventar și comenzi.',
          en: 'Store live, domain configured and a training session on the admin, inventory and order management.',
        },
      },
    ],
    priceFrom: null,
    qualifierStage: 'E',
  },
  {
    slug: 'ai-automation',
    routeSlug: { ro: 'automatizare-ai', en: 'ai-automation' },
    name: { ro: 'Automatizare cu AI', en: 'AI automation' },
    intro: {
      ro: 'Sisteme AI custom integrate în fluxul tău de lucru, care reduc zeci de ore manuale pe lună și scor costurile operaționale.',
      en: 'Custom AI systems built into your workflow that cut dozens of manual hours per month and slash operational costs.',
    },
    features: [
      {
        ro: 'Agenți LLM custom antrenați pe datele tale (retrieval-augmented generation), cu memorie și context pe termen lung.',
        en: 'Custom LLM agents trained on your data (retrieval-augmented generation) with long-term memory and context.',
      },
      {
        ro: 'Orchestrare flux (n8n, Make) pentru integrare cu email, Slack, Google Sheets, CRM și tool-uri existente.',
        en: 'Workflow orchestration (n8n, Make) to integrate with email, Slack, Google Sheets, CRM and existing tools.',
      },
      {
        ro: 'Dashboard custom cu audit log, approval workflow pentru operații critice și statistici în timp real.',
        en: 'Custom dashboard with audit logging, approval workflows for critical ops and real-time stats.',
      },
      {
        ro: 'Procesare de documente în batch (PDF, imagini), extracție de date și mapare în baza ta de date.',
        en: 'Batch document processing (PDFs, images), data extraction and mapping into your database.',
      },
    ],
    process: [
      {
        title: { ro: 'Diagnostic și blueprint', en: 'Diagnostic & blueprint' },
        body: {
          ro: 'Analizăm procesele manuale, identificăm unde AI aduce cel mai mult beneficiu și planificăm automatizările în ordinea priorității.',
          en: 'We analyze manual processes, identify where AI brings the most value and plan automations by priority.',
        },
      },
      {
        title: { ro: 'Dezvoltare și test', en: 'Development & testing' },
        body: {
          ro: 'Construim agentul LLM, orchestrăm fluxul și testăm pe date reale din arhiva ta pentru acuratețe.',
          en: 'We build the LLM agent, orchestrate the workflow and test on real data from your archive for accuracy.',
        },
      },
      {
        title: { ro: 'Deploy și monitoring', en: 'Deploy & monitoring' },
        body: {
          ro: 'Lansăm în producție, setăm alertele și monitorizăm 30 de zile pentru a confirma că economia de timp e reală.',
          en: 'We deploy to production, set up alerts and monitor for 30 days to ensure time savings are real.',
        },
      },
    ],
    priceFrom: null,
    qualifierStage: 'D',
  },
] as const satisfies readonly Service[]
