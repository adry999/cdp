import type { Service } from '#layers/services/domain/service'
import { SERVICE_LINKS } from '#layers/services/data/serviceLinks'

type ServicePageCopy = Omit<Service, 'routeSlug' | 'name' | 'qualifierStage'>

const SERVICE_COPY: readonly ServicePageCopy[] = [
  {
    slug: 'website',
    seoTitle: { ro: 'Creare site de prezentare, live în 2–3 zile', en: 'Business website development, live in 2–3 days' },
    seoDescription: {
      ro: 'Site de prezentare modern, rapid pe mobil, cu SEO și formular conectat la email sau Telegram. De la brief la lansare în 2–3 zile.',
      en: 'Modern business website, fast on mobile, with SEO and a form connected to email or Telegram. From brief to launch in 2–3 days.',
    },
    intro: {
      ro: 'O pagină de prezentare modernă care-ți validează ideea și atrage primii clienți. De la concept la lansare în zile, nu săptămâni.',
      en: 'A modern landing page that validates your idea and attracts early customers. From concept to launch in days, not weeks.',
    },
    features: [
      {
        ro: 'Design responsive optimizat pentru mobil și desktop, cu încărcare rapidă și SEO nativ.',
        en: 'Responsive design optimized for mobile and desktop, with fast loading and native SEO.',
      },
      {
        ro: 'Integrare directă cu formular sau Telegram ca să primești solicitări din prima zi.',
        en: 'Direct integration with forms or Telegram so you receive inquiries from day one.',
      },
      {
        ro: 'Arhitectură static-first pentru încărcare rapidă și costuri de hosting minime.',
        en: 'Static-first architecture for fast loading and minimal hosting costs.',
      },
      {
        ro: 'Opțional: un dashboard editorial simplu ca să modifici singur text și imagini fără cod — implică o dezvoltare separată și un redeploy al proiectului.',
        en: 'Optional: a simple editorial dashboard to update copy and images yourself without code — a separate build, with a project redeploy.',
      },
    ],
    process: [
      {
        title: { ro: 'Brief și aliniere', en: 'Brief & alignment' },
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
          ro: 'Mutăm pe domeniu final, setăm email și SSL, și stăm lângă tine 30 de zile pentru orice ajustare.',
          en: 'We move to your final domain, set up email and SSL, and stay with you for 30 days to fix anything.',
        },
      },
    ],
    faq: [
      {
        question: {
          ro: 'Cât durează realizarea unui site de prezentare?',
          en: 'How long does it take to build a business website?',
        },
        answer: {
          ro: 'Un site de prezentare este live pe un link de staging în 24–48 de ore, iar lansarea completă pe domeniul final durează de regulă 2–3 zile de la stabilirea brief-ului.',
          en: 'A presentation website goes live on a staging preview link within 24–48 hours, with full launch on your final domain typically taking 2–3 days from brief confirmation.',
        },
      },
      {
        question: {
          ro: 'Cum voi primi mesajele trimise de vizitatori prin formular?',
          en: 'How will I receive messages submitted through the contact form?',
        },
        answer: {
          ro: 'Integrăm formularul direct cu adresa ta de email profesional sau cu un canal privat de Telegram, astfel încât să primești notificări instant de la potențialii clienți.',
          en: 'We integrate contact forms directly with your corporate email or a private Telegram channel so you receive instant lead alerts.',
        },
      },
      {
        question: {
          ro: 'Voi putea edita textele și imaginile de pe site după lansare?',
          en: 'Will I be able to edit the website copy and images after launch?',
        },
        answer: {
          ro: 'Arhitectura de bază este static-first pentru viteză maximă și costuri minime de găzduire. La cerere, putem implementa un dashboard editorial simplu pentru gestionarea conținutului fără cod.',
          en: 'The default architecture is static-first for maximum speed and minimal hosting costs. Upon request, we can build a lightweight editorial dashboard to edit text and images without touching code.',
        },
      },
    ],
    priceFrom: null,
  },
  {
    slug: 'web-app',
    seoTitle: { ro: 'Dezvoltare aplicații web pe Nuxt și Next.js', en: 'Web application development on Nuxt and Next.js' },
    seoDescription: {
      ro: 'Aplicația ta, din design în cod de producție: PostgreSQL, API sigur, teste automate și deploy continuu. Versiune live la fiecare două săptămâni.',
      en: 'Your app, from design to production code: PostgreSQL, a secure API, automated tests and continuous deployment. A live version every two weeks.',
    },
    intro: {
      ro: 'Aplicația ta, din design în cod de producție, pe Postgres și Nuxt sau Next.',
      en: 'Your app, from design to production code, on Postgres and Nuxt or Next.',
    },
    features: [
      {
        ro: 'Cod pixel-perfect transpus din Figma, cu componente și stări interactive încă din prima iterație.',
        en: 'Pixel-perfect code translated from Figma, with components and interactive states from the first iteration.',
      },
      {
        ro: 'Bază de date relațională scalabilă (PostgreSQL), cu migrații versionate și backup automat.',
        en: 'Scalable relational database (PostgreSQL) with versioned migrations and automatic backups.',
      },
      {
        ro: 'API REST sau GraphQL sigur, cu autentificare, rate-limiting și paginație.',
        en: 'Secure REST or GraphQL API with authentication, rate-limiting and pagination.',
      },
      {
        ro: 'Teste automate și deploy continuu pe Vercel sau cloud-ul tău, cu rollback instant.',
        en: 'Automated tests and continuous deployment to Vercel or your cloud, with instant rollback.',
      },
    ],
    process: [
      {
        title: { ro: 'Arhitectură și sistem de design', en: 'Architecture & design system' },
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
    faq: [
      {
        question: {
          ro: 'Ce tehnologii folosiți pentru dezvoltarea aplicațiilor web?',
          en: 'What technologies do you use for web application development?',
        },
        answer: {
          ro: 'Dezvoltăm full-stack pe Nuxt (Vue) sau Next.js (React), baze de date relaționale PostgreSQL cu migrații versionate și API-uri REST sau GraphQL sigure și scalabile.',
          en: 'We build full-stack applications using Nuxt (Vue) or Next.js (React), relational PostgreSQL databases with versioned migrations, and secure, scalable REST or GraphQL APIs.',
        },
      },
      {
        question: {
          ro: 'Cum decurge procesul de dezvoltare și când văd rezultate?',
          en: 'How does the development process work and when will I see results?',
        },
        answer: {
          ro: 'Lucrăm în sprinturi de două săptămâni. La finalul fiecărui sprint livrăm o versiune funcțională pe un mediu de staging, permițându-ți să testezi pe cod real.',
          en: 'We work in two-week sprints. At the end of every sprint, we deploy a working version to a staging environment so you can test real code.',
        },
      },
      {
        question: {
          ro: 'Cine deține codul sursă după finalizarea proiectului?',
          en: 'Who owns the source code after project completion?',
        },
        answer: {
          ro: 'Deții 100% din codul sursă, baza de date și drepturile de proprietate intelectuală. Oferim transfer complet al repository-ului Git, documentație tehnică și 30 de zile de suport inclus.',
          en: 'You retain 100% ownership of the source code, database, and IP. We provide complete Git repository transfer, technical documentation, and 30 days of included bug-fix support.',
        },
      },
    ],
    priceFrom: null,
  },
  {
    slug: 'wordpress',
    seoTitle: { ro: 'Site WordPress custom, rapid și securizat', en: 'Custom WordPress website, fast and secure' },
    seoDescription: {
      ro: 'Temă WordPress custom din Figma, fără plugin-uri inutile, pe hosting cu cache și CDN. Backup zilnic, SSL și instruire pentru editarea conținutului.',
      en: 'Custom WordPress theme built from Figma, no needless plugins, on hosting with cache and CDN. Daily backups, SSL and training on editing content.',
    },
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
    faq: [
      {
        question: {
          ro: 'Folosiți teme prefabricate sau creați o temă custom?',
          en: 'Do you use pre-made templates or develop a custom theme?',
        },
        answer: {
          ro: 'Construim teme WordPress 100% custom, transpuse pixel-perfect din designul tău Figma, fără page builders greoi sau zeci de pluginuri inutile.',
          en: 'We build 100% bespoke WordPress themes coded pixel-perfect from your Figma designs, without heavy page builders or unnecessary plugin bloat.',
        },
      },
      {
        question: {
          ro: 'Unde va fi găzduit site-ul WordPress?',
          en: 'Where will the WordPress site be hosted?',
        },
        answer: {
          ro: 'Recomandăm și configurăm medii de hosting performante cu cache la nivel de server și CDN global (precum Kinsta sau WP Engine), dar putem instala soluția și pe serverul tău dedicat.',
          en: 'We recommend and configure high-performance managed hosting with server-level caching and global CDN (such as Kinsta or WP Engine), or deploy to your own dedicated server.',
        },
      },
      {
        question: {
          ro: 'Cum voi învăța să folosesc panoul de administrare?',
          en: 'How will I learn to manage content in the WordPress admin?',
        },
        answer: {
          ro: 'La lansare organizăm o sesiune de training dedicată de 2 ore în care parcurgem adăugarea și editarea de conținut, pagini și articole în deplină siguranță.',
          en: 'At launch, we provide a dedicated 2-hour training session walking you through safely managing pages, articles, and media.',
        },
      },
    ],
    priceFrom: null,
  },
  {
    slug: 'shopify',
    seoTitle: { ro: 'Magazin online Shopify cu temă custom', en: 'Online store on Shopify with a custom theme' },
    seoDescription: {
      ro: 'Magazin Shopify optimizat pentru conversie: temă custom, plăți, livrare, analytics și email marketing integrate. Lansare și instruire pe admin.',
      en: 'Shopify store optimized for conversion: custom theme, payments, shipping, analytics and email marketing integrated. Launch and admin training.',
    },
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
    faq: [
      {
        question: {
          ro: 'Ce integrări sunt posibile pentru plăți și logistică în magazinul Shopify?',
          en: 'What payment and shipping integrations are supported in Shopify?',
        },
        answer: {
          ro: 'Integrăm procesatori de plăți precum Stripe, Apple Pay și Google Pay, alături de curieri și servicii de livrare locale și internaționale (DPD, Wishe, Parcelly).',
          en: 'We integrate payment processors like Stripe, Apple Pay, and Google Pay, alongside local and international shipping providers (DPD, Wishbox, Parcelly).',
        },
      },
      {
        question: {
          ro: 'Cum mă ajutați cu migrarea catalogului de produse?',
          en: 'How do you assist with product catalog migration?',
        },
        answer: {
          ro: 'Structurăm catalogul, configurăm atributele și variantele de produs și importăm baza de date existentă din fișiere CSV sau din platforma anterioară.',
          en: 'We structure your product catalog, configure attributes and variants, and import existing data via CSV spreadsheets or your previous eCommerce platform.',
        },
      },
      {
        question: {
          ro: 'Includeți instrumente de marketing și analitică pentru ecommerce?',
          en: 'Do you configure ecommerce analytics and marketing tools?',
        },
        answer: {
          ro: 'Da, configurăm fluxurile de email marketing (Klaviyo), tracking pentru conversii prin Google Ads și Facebook Pixel, plus rapoarte detaliate în dashboard-ul Shopify.',
          en: 'Yes, we set up email marketing automations (Klaviyo), conversion tracking for Google Ads and Meta Pixel, and detailed analytics in the Shopify dashboard.',
        },
      },
    ],
    priceFrom: null,
  },
  {
    slug: 'ai-automation',
    seoTitle: { ro: 'Automatizare cu AI pentru procese de business', en: 'AI automation for business processes' },
    seoDescription: {
      ro: 'Agenți AI pe datele tale, integrați cu email, CRM și Google Sheets. Reducem orele de muncă manuală și monitorizăm rezultatul 30 de zile.',
      en: 'AI agents on your data, integrated with email, CRM and Google Sheets. We cut manual hours and monitor the result for 30 days.',
    },
    intro: {
      ro: 'Sisteme AI custom integrate în fluxul tău de lucru, care reduc zeci de ore manuale pe lună și reduc costurile operaționale.',
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
    faq: [
      {
        question: {
          ro: 'Cum funcționează un agent AI pe datele companiei noastre?',
          en: 'How does a custom AI agent work on our internal company data?',
        },
        answer: {
          ro: 'Utilizăm arhitecturi RAG (Retrieval-Augmented Generation) care interoghează baza ta de documente interne (PDF-uri, foi de calcul, baze de date) fără a expune datele confidențiale către antrenarea modelelor publice.',
          en: 'We use RAG (Retrieval-Augmented Generation) architectures that securely query your internal documents (PDFs, spreadsheets, databases) without exposing private data to public model training.',
        },
      },
      {
        question: {
          ro: 'Cu ce aplicații și sisteme se poate conecta fluxul de automatizare?',
          en: 'Which tools and platforms can the automation workflows integrate with?',
        },
        answer: {
          ro: 'Orchestrăm fluxurile prin platforme flexibile precum n8n sau Make, conectându-le la adrese de email, Slack, Google Sheets, sisteme CRM și API-uri proprietare.',
          en: 'We orchestrate workflows using robust platforms like n8n or Make, connecting them directly to email, Slack, Google Sheets, your CRM, and proprietary APIs.',
        },
      },
      {
        question: {
          ro: 'Cum menținem controlul asupra deciziilor luate de inteligența artificială?',
          en: 'How do we retain control and oversight over automated AI actions?',
        },
        answer: {
          ro: 'Dezvoltăm dashboard-uri cu log-uri detaliate de audit și fluxuri de aprobare umană (human-in-the-loop) pentru orice operațiune critică înainte de execuție.',
          en: 'We build management dashboards featuring comprehensive audit logs and human-in-the-loop approval gates for critical actions prior to execution.',
        },
      },
    ],
    priceFrom: null,
  },
  {
    slug: 'granturi',
    seoTitle: { ro: 'Dezvoltare IT pentru proiecte cu grant', en: 'IT development for grant-funded projects' },
    seoDescription: {
      ro: 'Construim aplicația din proiectul finanțat prin grant european sau ODA, pe etapele din contract, cu documentele cerute la raportare și audit.',
      en: 'We build the application of your European or ODA grant project, on the contract stages, with the documents required for reporting and audit.',
    },
    intro: {
      ro: 'Ai câștigat un grant european sau ODA și trebuie să livrezi o aplicație la termen? Construim partea tehnică a proiectului și pregătim documentele de care ai nevoie la raportare.',
      en: 'Won a European or ODA grant and need to deliver an application on time? We build the technical side of the project and prepare the documents you need for reporting.',
    },
    audience: [
      {
        ro: 'Startup-uri și IMM-uri',
        en: 'Startups and SMEs',
      },
      {
        ro: 'ONG-uri',
        en: 'NGOs',
      },
      {
        ro: 'Instituții publice și primării',
        en: 'Public institutions and city halls',
      },
      {
        ro: 'Asociații de afaceri',
        en: 'Business associations',
      },
    ],
    features: [
      {
        ro: 'Calendar de livrare aliniat la termenele din contractul de finanțare, cu etape și act de predare-primire pentru fiecare.',
        en: 'Delivery schedule aligned with the deadlines in the funding contract, with milestones and a handover certificate for each.',
      },
      {
        ro: 'Documente conforme cerințelor finanțatorului: facturi, specificație tehnică, acte de predare și documentație de utilizare.',
        en: 'Documents that meet the requirements of the funder: invoices, technical specification, handover certificates and user documentation.',
      },
      {
        ro: 'Ofertă detaliată pentru procedura de achiziție, structurată pe liniile din bugetul proiectului.',
        en: 'Detailed offer for the procurement procedure, structured by the lines of the project budget.',
      },
      {
        ro: 'Dovezi pentru raportare: capturi de ecran, statistici de utilizare și acces pentru evaluatori.',
        en: 'Evidence for reporting: screenshots, usage statistics and access for evaluators.',
      },
      {
        ro: 'Plan de sustenabilitate: găzduire, mentenanță și costuri estimate după încheierea finanțării.',
        en: 'Sustainability plan: hosting, maintenance and estimated costs after the funding ends.',
      },
      {
        ro: 'Echipă tehnică completă pe durata proiectului, fără angajări interne.',
        en: 'A full technical team for the duration of the project, with no in-house hiring.',
      },
    ],
    process: [
      {
        title: {
          ro: 'Înainte de aplicare',
          en: 'Before applying',
        },
        body: {
          ro: 'Scriem specificația tehnică și estimăm bugetul IT pentru cererea de finanțare.',
          en: 'We write the technical specification and estimate the IT budget for the funding application.',
        },
      },
      {
        title: {
          ro: 'Implementare',
          en: 'Implementation',
        },
        body: {
          ro: 'Livrăm pe etapele din contract, cu o versiune live și un act de predare la fiecare etapă.',
          en: 'We deliver by the contract milestones, with a live version and a handover certificate at each milestone.',
        },
      },
      {
        title: {
          ro: 'Raportare și audit',
          en: 'Reporting and audit',
        },
        body: {
          ro: 'Pregătim documentele tehnice, capturile și statisticile cerute în rapoartele intermediare și finale.',
          en: 'We prepare the technical documents, screenshots and statistics required in the interim and final reports.',
        },
      },
      {
        title: {
          ro: 'După grant',
          en: 'After the grant',
        },
        body: {
          ro: 'Preluăm găzduirea și mentenanța, ca aplicația să funcționeze pe toată perioada de sustenabilitate cerută de finanțator.',
          en: 'We take over hosting and maintenance so the application keeps running for the whole sustainability period the funder requires.',
        },
      },
    ],
    faq: [
      {
        question: {
          ro: 'Cum asigurați conformitatea soluției tehnice cu cerințele finanțatorului?',
          en: 'How do you ensure IT compliance with grant requirements?',
        },
        answer: {
          ro: 'Structurăm livrarea pe etapele prevăzute în contractul de finanțare și furnizăm toate actele necesare: specificație tehnică, facturi conforme bugetului aprobat și procese-verbale de predare-primire.',
          en: 'We structure delivery around the milestones defined in your funding contract and supply all compliance documents: technical specs, matching budget invoices, and handover certificates.',
        },
      },
      {
        question: {
          ro: 'Ne puteți ajuta înainte de aprobarea cererii de finanțare?',
          en: 'Can you assist us prior to grant approval?',
        },
        answer: {
          ro: 'Da, redactăm specificația tehnică preliminară și oferim o estimare bugetară realistă, structurată pe liniile de cheltuieli eligibile pentru dosarul de aplicare.',
          en: 'Yes, we draft preliminary technical specifications and provide realistic budget estimates aligned with eligible expenditure lines for your grant application.',
        },
      },
      {
        question: {
          ro: 'Ce se întâmplă cu găzduirea și mentenanța în perioada de sustenabilitate?',
          en: 'What happens with hosting and maintenance during the sustainability period?',
        },
        answer: {
          ro: 'Elaborăm un plan complet de sustenabilitate și asigurăm mentenanța și găzduirea pe toată perioada impusă de finanțator după finalizarea implementării.',
          en: 'We establish a long-term sustainability plan and provide ongoing maintenance and hosting throughout the required post-implementation compliance period.',
        },
      },
    ],
    priceFrom: null,
  },
]

export const SERVICES: readonly Service[] = SERVICE_COPY.map((copy) => {
  const link = SERVICE_LINKS.find((entry) => entry.slug === copy.slug)
  if (!link) throw new Error(`Missing service link for ${copy.slug}`)
  return { ...link, ...copy }
})
