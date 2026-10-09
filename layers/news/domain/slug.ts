// Kept inside this layer: `projects` owns its own `slugify` and a layer may not import another's internals.
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const DIACRITICS: Record<string, string> = {
  ă: 'a', â: 'a', î: 'i', ș: 's', ş: 's', ț: 't', ţ: 't',
  á: 'a', à: 'a', ä: 'a', é: 'e', è: 'e', ë: 'e', í: 'i',
  ï: 'i', ó: 'o', ò: 'o', ö: 'o', ú: 'u', ù: 'u', ü: 'u', ñ: 'n', ç: 'c',
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ăâîșşțţáàäéèëíïóòöúùüñç]/g, (c) => DIACRITICS[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}
