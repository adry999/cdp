/**
 * The contact form now stores a stable budget key rather than the translated
 * label (see app/components/site/ContactForm.vue), so the same interval reads
 * the same way in the admin regardless of which locale the visitor submitted
 * in. The admin UI itself is RO-only, so these labels are not run through i18n.
 */
export const BUDGET_LABELS: Record<string, string> = {
  // `under1k` is the plain contact form's low tier; `under500` / `500to1k` are
  // the qualification modal's finer split of the same band.
  under1k: 'sub 1.000 EUR',
  under500: 'sub 500 EUR',
  '500to1k': '500 – 1.000 EUR',
  '1to2k': '1.000 – 2.000 EUR',
  '2to5k': '2.000 – 5.000 EUR',
  over5k: 'peste 5.000 EUR',
  unsure: 'Nu știu încă',
}

export function budgetLabel(value: string | null): string {
  if (!value) return '—'
  return BUDGET_LABELS[value] ?? value
}
