export function formatPostDate(date: string, locale: 'ro' | 'en'): string {
  return new Date(date).toLocaleDateString(locale === 'en' ? 'en-US' : 'ro-RO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
