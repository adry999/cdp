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

// Kept as a token, resolved with the real address by resolvePrivacyPolicy() below — this file
// stays a plain data module that doesn't import content's data directly across the layer boundary.
const CONTACT_EMAIL_TOKEN = '{{contactEmail}}'

export const privacyPolicy: { ro: PolicyContent; en: PolicyContent } = {
  ro: {
    title: 'Politica de confidențialitate',
    updated: 'Actualizat: 6 octombrie 2026',
    intro:
      'Această pagină descrie ce date colectăm prin acest site, de ce, cât timp le păstrăm și cum le poți controla. Se aplică pe toate domeniile CODEPEDIA (codepedia.studio, codepedia.md).',
    sections: [
      {
        heading: 'Cine este operatorul',
        body: [
          'S.R.L. „CODEPEDIA", IDNO 1023600068387, Chișinău, Republica Moldova.',
          `Pentru orice întrebare despre datele tale: ${CONTACT_EMAIL_TOKEN}.`,
        ],
      },
      {
        heading: 'Ce colectăm prin formularul de contact',
        body: [
          'Când trimiți formularul de contact, colectăm: numele, adresa de email, compania (opțional), mesajul, intervalul de buget (opțional) și cum ai aflat de noi (opțional). Reținem și pagina de pe care ai trimis formularul și pagina de la care ai venit (referrer).',
          'Dacă folosești chestionarul de calificare de pe site, colectăm suplimentar: etapa proiectului, bugetul estimat, un link/handle de contact și notele tale. Aceste date sunt salvate în aceeași bază de solicitări ca formularul de contact.',
          'Adresa IP este folosită exclusiv pentru a limita trimiterile automate/abuzive și nu este salvată alături de solicitarea ta. Înregistrările de limitare mai vechi de 10 minute sunt șterse automat la următoarea trimitere de formular din partea oricărui vizitator (nu pe un program fix).',
        ],
      },
      {
        heading: 'Ce se înregistrează automat',
        body: [
          'La fiecare vizită, furnizorul de găzduire (Vercel) înregistrează tehnic adresa IP, pagina cerută, data și tipul de browser, pentru ca site-ul să funcționeze și să rămână sigur. Nu folosim aceste jurnale pentru a te identifica sau a-ți crea un profil.',
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
          'Datele din formularul de contact și din chestionarul de calificare: pentru a răspunde solicitării tale și a face, la cererea ta, demersurile de dinaintea unei eventuale colaborări (art. 6 alin. (1) lit. b GDPR).',
          'Adresa IP (temporar) și jurnalele de găzduire: interesul legitim de a preveni abuzul și de a păstra site-ul sigur (art. 6 alin. (1) lit. f GDPR).',
          'Analiză și marketing: doar cu acordul tău explicit (art. 6 alin. (1) lit. a GDPR). Îl poți retrage oricând din „Setări cookie-uri", fără să afecteze ce s-a prelucrat înainte.',
          'Nu luăm decizii automate și nu facem profilare care să producă efecte juridice asupra ta.',
        ],
      },
      {
        heading: 'Cât timp păstrăm datele',
        body: [
          'Solicitările de contact sunt păstrate cât timp este necesar pentru a răspunde și evalua colaborarea. Perioada exactă de retenție: [ de completat ]. Poți cere oricând ștergerea lor.',
        ],
      },
      {
        heading: 'Cu cine împărtășim datele',
        body: [
          'Supabase — baza de date, cu servere în Uniunea Europeană (Irlanda). Vercel — găzduirea site-ului (SUA). Resend — livrarea notificării interne trimise echipei la o solicitare nouă (SUA).',
          'Google Analytics și Meta Pixel primesc date doar dacă ai consimțit explicit.',
          'Nu vindem datele tale și nu le împărtășim în alte scopuri.',
        ],
      },
      {
        heading: 'Transferuri în afara Uniunii Europene',
        body: [
          'Vercel și Resend pot prelucra date în SUA. Transferul se face pe baza garanțiilor din acordurile lor de prelucrare a datelor, care includ clauzele contractuale standard ale Comisiei Europene.',
        ],
      },
      {
        heading: 'Drepturile tale',
        body: [
          `Poți cere oricând acces la datele tale, corectarea, ștergerea sau restricționarea lor, o copie într-un format structurat (portabilitate) și te poți opune prelucrării bazate pe interes legitim. Scrie-ne la ${CONTACT_EMAIL_TOKEN}; răspundem în cel mult o lună.`,
          'Ai dreptul să depui o plângere la o autoritate de supraveghere: în Moldova, Centrul Național pentru Protecția Datelor cu Caracter Personal; dacă ești rezident al Uniunii Europene, autoritatea de protecție a datelor din țara ta de reședință.',
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Updated: October 6, 2026',
    intro:
      'This page describes what data we collect through this site, why, how long we keep it, and how you can control it. It applies to every CODEPEDIA domain (codepedia.studio, codepedia.md).',
    sections: [
      {
        heading: 'Who the controller is',
        body: [
          'S.R.L. "CODEPEDIA", IDNO 1023600068387, Chișinău, Republic of Moldova.',
          `For any question about your data: ${CONTACT_EMAIL_TOKEN}.`,
        ],
      },
      {
        heading: 'What we collect through the contact form',
        body: [
          'When you submit the contact form, we collect: your name, email address, company (optional), message, budget range (optional), and how you heard about us (optional). We also keep the page you submitted from and the page you arrived from (referrer).',
          "If you use the site's qualification questionnaire, we additionally collect: your project stage, estimated budget, a contact link/handle, and your notes. This data is saved in the same request store as the contact form.",
          'Your IP address is used solely to limit automated/abusive submissions and is not stored alongside your request. Rate-limit entries older than 10 minutes are automatically deleted the next time any visitor submits a form (not on a fixed schedule).',
        ],
      },
      {
        heading: 'What is logged automatically',
        body: [
          'On every visit, our hosting provider (Vercel) technically logs your IP address, the page requested, the date and your browser type, so the site keeps working and stays secure. We do not use these logs to identify or profile you.',
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
          'Contact form and qualification questionnaire data: to respond to your request and, at your request, take the steps before a possible collaboration (Art. 6(1)(b) GDPR).',
          'IP address (temporary) and hosting logs: our legitimate interest in preventing abuse and keeping the site secure (Art. 6(1)(f) GDPR).',
          'Analytics and marketing: only with your explicit consent (Art. 6(1)(a) GDPR). You can withdraw it anytime via "Cookie settings", without affecting processing that happened before.',
          'We make no automated decisions and do no profiling that produces legal effects for you.',
        ],
      },
      {
        heading: 'How long we keep data',
        body: [
          'Contact requests are kept as long as necessary to respond and evaluate working together. Exact retention period: [ to be completed ]. You can ask for deletion at any time.',
        ],
      },
      {
        heading: 'Who we share data with',
        body: [
          'Supabase — the database, with servers in the European Union (Ireland). Vercel — site hosting (US). Resend — delivery of the internal notification sent to our team about a new request (US).',
          'Google Analytics and Meta Pixel only receive data if you explicitly consented.',
          'We do not sell your data or share it for any other purpose.',
        ],
      },
      {
        heading: 'Transfers outside the European Union',
        body: [
          "Vercel and Resend may process data in the US. These transfers rely on the safeguards in their data processing agreements, which include the European Commission's standard contractual clauses.",
        ],
      },
      {
        heading: 'Your rights',
        body: [
          `You can ask at any time for access to your data, its correction, deletion or restriction, a copy in a structured format (portability), and you can object to processing based on legitimate interest. Write to us at ${CONTACT_EMAIL_TOKEN}; we reply within one month.`,
          'You have the right to lodge a complaint with a supervisory authority: in Moldova, the National Center for Personal Data Protection (Centrul Național pentru Protecția Datelor cu Caracter Personal); if you are an EU resident, your local data protection authority.',
        ],
      },
    ],
  },
}

/** Fills in the real contact address (content's SITE_SETTINGS.contactEmail) — call from the
 * page component, which is the one place in this layer allowed to reach into content. */
export function resolvePrivacyPolicy(locale: 'ro' | 'en', contactEmail: string): PolicyContent {
  const content = privacyPolicy[locale]
  return {
    ...content,
    sections: content.sections.map((section) => ({
      ...section,
      body: section.body.map((paragraph) => paragraph.replaceAll(CONTACT_EMAIL_TOKEN, contactEmail)),
    })),
  }
}
