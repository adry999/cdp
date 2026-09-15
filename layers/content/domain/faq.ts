import type { LocalizedText } from '#layers/core/shared/types/localizedText'

/** One question/answer pair rendered in the homepage FAQ section. */
export interface Faq {
  question: LocalizedText
  answer: LocalizedText
}
