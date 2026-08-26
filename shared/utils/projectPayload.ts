/**
 * Validation shared by the admin editor and the server route that persists it.
 * The public project API only resolves slugs matching SLUG_RE, so anything the
 * editor accepts outside that pattern would publish a guaranteed 404.
 */

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Slugs that collide with admin routes rather than naming a project. */
export const RESERVED_SLUGS = ['nou', 'new']

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
}

export interface ProjectImageInput {
  path: string | null
  altRo: string
  altEn: string
}

export interface ProjectPayloadInput {
  id?: string | null
  slugRo: string
  slugEn: string
  published: boolean
  title: { ro: string; en: string }
  cardTitle: { ro: string; en: string }
  summary: { ro: string; en: string }
  lead: { ro: string; en: string }
  contextHeading: { ro: string; en: string }
  gallery: ProjectImageInput[]
}

export interface ValidationIssue {
  field: string
  message: string
}

const REQUIRED_RO: [keyof ProjectPayloadInput, string][] = [
  ['title', 'Titlu'],
  ['cardTitle', 'Titlu card'],
  ['summary', 'Descriere card'],
  ['lead', 'Lead'],
  ['contextHeading', 'Titlu context'],
]

/**
 * Returns every problem at once rather than the first, so the editor can mark
 * all offending fields in a single pass.
 */
export function validateProjectPayload(input: ProjectPayloadInput): ValidationIssue[] {
  const issues: ValidationIssue[] = []

  for (const [key, label] of REQUIRED_RO) {
    const value = input[key] as { ro: string } | undefined
    if (!value?.ro?.trim()) {
      issues.push({ field: key, message: `${label} (RO) este obligatoriu.` })
    }
  }

  for (const [field, value] of [
    ['slugRo', input.slugRo],
    ['slugEn', input.slugEn],
  ] as const) {
    const slug = value?.trim() ?? ''
    if (!slug) {
      issues.push({ field, message: 'Slug-ul este obligatoriu.' })
    } else if (!SLUG_RE.test(slug)) {
      issues.push({
        field,
        message: 'Slug-ul poate conține doar litere mici, cifre și cratime.',
      })
    } else if (RESERVED_SLUGS.includes(slug)) {
      issues.push({ field, message: `„${slug}" este rezervat și nu poate fi slug de proiect.` })
    }
  }

  // A published project with no gallery image renders an empty frame; a blank
  // path stored in the database renders a broken <img src="">.
  if (input.published) {
    const usable = input.gallery.filter((img) => img.path?.trim())
    if (usable.length < 2) {
      issues.push({ field: 'gallery', message: 'Un proiect publicat are nevoie de minim 2 imagini în galerie.' })
    }
  }

  return issues
}

/** Drops empty gallery slots so they never reach the not-null `path` column. */
export function usableGallery(gallery: ProjectImageInput[]): ProjectImageInput[] {
  return gallery.filter((img) => !!img.path?.trim())
}
