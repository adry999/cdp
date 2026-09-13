export function pick(ro: string, en: string | null | undefined, locale: string): string {
  return locale === 'en' && en ? en : ro
}
