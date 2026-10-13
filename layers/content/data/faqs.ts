import type { Faq } from '#layers/content/domain/faq'

// Edit FAQ here. Both ro and en are required. Order is display order.
export const FAQS: readonly Faq[] = [
  {
    question: { ro: 'Cât costă un proiect?', en: 'What does a project cost?' },
    answer: {
      ro: 'Lucrăm pe abonament lunar sau pe sprinturi, iar proiectele începute de altcineva pornesc de la un audit plătit. Evaluarea scrisă de după diagnostic conține întotdeauna o cifră, înainte să semnezi ceva.',
      en: 'We work on a monthly subscription or in sprints, and projects started by someone else begin with a paid audit. The written assessment after the diagnostic call always contains a number, before you sign anything.',
    },
  },
  {
    question: { ro: 'Preluați proiecte începute de altcineva?', en: "Do you take over someone else's project?" },
    answer: {
      ro: 'Da, după un audit plătit. Auditul este un document scris: ce funcționează, ce trebuie rescris și cât costă până în producție.',
      en: 'Yes, after a paid audit. The audit is a written document: what works, what has to be rewritten, and what it costs to reach production.',
    },
  },
  {
    question: { ro: 'Cât durează livrarea?', en: 'How long does delivery take?' },
    answer: {
      ro: 'O primă versiune în producție durează de obicei șase până la douăsprezece săptămâni, în funcție de cât din domeniu trebuie modelat în bază de date.',
      en: 'A first production version is usually six to twelve weeks, depending on how much of the domain has to be modelled in the database.',
    },
  },
  {
    question: { ro: 'Ce se întâmplă după predare?', en: 'What happens after handover?' },
    answer: {
      ro: 'Treizeci de zile de suport pentru bug-uri sunt incluse. După aceea poți continua cu un abonament lunar sau cu echipa ta. Ambele variante funcționează.',
      en: 'Thirty days of bug support are included. After that you can keep us on a monthly retainer or run the project with your own team. Both work.',
    },
  },
]
