export interface FaqItem {
  question: string
  answer: string
}

export const faq: Record<'ro' | 'en', FaqItem[]> = {
  ro: [
    {
      question: 'Cât costă un proiect?',
      answer:
        'Majoritatea proiectelor pornesc de la 6.000 EUR pentru o primă versiune funcțională și continuă pe etape. Evaluarea scrisă de după diagnostic conține întotdeauna o cifră.',
    },
    {
      question: 'Preluați proiecte începute de altcineva?',
      answer:
        'Da, după un audit plătit. Auditul este un document scris: ce funcționează, ce trebuie rescris și cât costă până în producție.',
    },
    {
      question: 'Cât durează livrarea?',
      answer:
        'O primă versiune în producție durează de obicei șase până la douăsprezece săptămâni, în funcție de cât din domeniu trebuie modelat în bază de date.',
    },
    {
      question: 'Ce se întâmplă după predare?',
      answer:
        'Treizeci de zile de suport pentru bug-uri sunt incluse. După aceea poți continua cu un abonament lunar sau cu echipa ta. Ambele variante funcționează.',
    },
  ],
  en: [
    {
      question: 'What does a project cost?',
      answer:
        'Most projects start at 6,000 EUR for a working first version and move in stages from there. The written assessment after the diagnostic call always contains a number.',
    },
    {
      question: "Do you take over someone else's project?",
      answer:
        'Yes, after a paid audit. The audit is a written document: what works, what has to be rewritten, and what it costs to reach production.',
    },
    {
      question: 'How long does delivery take?',
      answer:
        'A first production version is usually six to twelve weeks, depending on how much of the domain has to be modelled in the database.',
    },
    {
      question: 'What happens after handover?',
      answer:
        'Thirty days of bug support are included. After that you can keep us on a monthly retainer or run the project with your own team. Both work.',
    },
  ],
}
