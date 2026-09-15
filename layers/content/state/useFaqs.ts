import { pick } from '#layers/core/shared/utils/pick'
import { FAQS } from '#layers/content/data/faqs'

/**
 * Localises `data/faqs.ts` to the active locale, producing the view-models
 * HomeFaq.vue renders. Edit the questions and answers in `data/faqs.ts`.
 */
export function useFaqs() {
  const { locale } = useI18n()

  return computed(() =>
    FAQS.map((faq) => ({
      question: pick(faq.question.ro, faq.question.en, locale.value),
      answer: pick(faq.answer.ro, faq.answer.en, locale.value),
    })),
  )
}
