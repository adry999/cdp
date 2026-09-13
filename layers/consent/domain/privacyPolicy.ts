export interface PolicySection {
  heading: string
  body: string[]
}

export interface PolicyContent {
  title: string
  updated: string
  intro: string
  sections: PolicySection[]
}

export const privacyPolicy: { ro: PolicyContent; en: PolicyContent } = {
  ro: {
    title: 'Politica de confidențialitate',
    updated: 'Actualizat: 21 august 2026',
    intro:
      'Această pagină descrie ce date colectăm prin acest site, de ce, și cum le poți controla. Codepedia SRL, Chișinău, Moldova, este operatorul datelor descrise aici.',
    sections: [
      {
        heading: 'Ce colectăm prin formularul de contact',
        body: [
          'Când trimiți formularul de contact, colectăm: numele, adresa de email, compania (opțional), mesajul, intervalul de buget (opțional) și cum ai aflat de noi (opțional). Reținem și pagina de pe care ai trimis formularul și pagina de la care ai venit (referrer).',
          'Adresa IP este folosită temporar (10 minute) exclusiv pentru a preveni trimiterile automate/abuzive și nu este salvată alături de solicitarea ta.',
        ],
      },
      {
        heading: 'Cookie-uri',
        body: [
          'codepedia_locale — reține limba aleasă (română/engleză). Necesar pentru funcționarea site-ului, valabil 1 an.',
          'codepedia_consent — reține alegerile tale privind cookie-urile de mai jos. Necesar pentru funcționarea site-ului, valabil 6 luni.',
          'Google Analytics și Meta Pixel — folosite doar dacă alegi explicit „Acceptă tot" sau activezi categoriile corespunzătoare din bannerul de cookie-uri. Poți schimba alegerea oricând din linkul „Setări cookie-uri" din footer.',
        ],
      },
      {
        heading: 'De ce procesăm aceste date',
        body: [
          'Datele din formularul de contact: pentru a răspunde solicitării tale.',
          'Adresa IP (temporar): interes legitim de a preveni abuzul.',
          'Analiză și marketing: doar cu acordul tău explicit.',
        ],
      },
      {
        heading: 'Cât timp păstrăm datele',
        body: [
          'Solicitările de contact sunt păstrate cât timp este necesar pentru a răspunde și evalua colaborarea. Poți cere oricând ștergerea lor.',
        ],
      },
      {
        heading: 'Cu cine împărtășim datele',
        body: [
          'Datele sunt găzduite prin Supabase (bază de date) și Vercel (găzduire site). Google Analytics și Meta Pixel primesc date doar dacă ai consimțit explicit.',
        ],
      },
      {
        heading: 'Drepturile tale',
        body: [
          'Poți cere oricând acces, corectarea sau ștergerea datelor tale, scriindu-ne la adresa de contact afișată pe site.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Updated: August 21, 2026',
    intro:
      'This page describes what data we collect through this site, why, and how you can control it. Codepedia SRL, Chișinău, Moldova, is the controller of the data described here.',
    sections: [
      {
        heading: 'What we collect through the contact form',
        body: [
          'When you submit the contact form, we collect: your name, email address, company (optional), message, budget range (optional), and how you heard about us (optional). We also keep the page you submitted from and the page you arrived from (referrer).',
          'Your IP address is used temporarily (10 minutes) solely to prevent automated/abusive submissions and is not stored alongside your request.',
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'codepedia_locale — remembers your chosen language (Romanian/English). Necessary for the site to work, valid 1 year.',
          'codepedia_consent — remembers your choices about the cookies below. Necessary for the site to work, valid 6 months.',
          'Google Analytics and Meta Pixel — used only if you explicitly choose "Accept all" or enable the relevant categories in the cookie banner. You can change your choice anytime via the "Cookie settings" link in the footer.',
        ],
      },
      {
        heading: 'Why we process this data',
        body: [
          'Contact form data: to respond to your request.',
          'IP address (temporary): legitimate interest in preventing abuse.',
          'Analytics and marketing: only with your explicit consent.',
        ],
      },
      {
        heading: 'How long we keep data',
        body: [
          'Contact requests are kept as long as necessary to respond and evaluate working together. You can ask for deletion at any time.',
        ],
      },
      {
        heading: 'Who we share data with',
        body: [
          'Data is hosted via Supabase (database) and Vercel (site hosting). Google Analytics and Meta Pixel only receive data if you explicitly consented.',
        ],
      },
      {
        heading: 'Your rights',
        body: [
          'You can request access to, correction of, or deletion of your data at any time by writing to the contact address shown on the site.',
        ],
      },
    ],
  },
}
