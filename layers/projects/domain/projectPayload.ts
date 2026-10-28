// Validation shared by the admin editor and the server route that persists it — the public
// API only resolves slugs matching SLUG_RE, so anything else the editor accepts 404s live.
import { isServiceTagId } from '#layers/core/shared/types/service-tag'
import { isLinkKind, isLinkUrl } from '#layers/projects/domain/star'

export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Slugs that collide with admin routes rather than naming a project. */
const RESERVED_SLUGS = ['nou', 'new']

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
  aspect: string
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
  contextBody: { ro: string; en: string }
  serviceTag: string | null
  /** Free text from the form; empty is allowed, otherwise a 4-digit year. */
  year?: string
  navServices?: string[]
  links?: { kind?: string; url: string; note?: { ro: string; en: string } }[]
  gallery: ProjectImageInput[]
  coverPath?: string | null
  coverAlt?: { ro: string; en: string }
  heroPath?: string | null
  heroAlt?: { ro: string; en: string }
}

export interface ValidationIssue {
  field: string
  message: string
}

const MIN_YEAR = 1990

const REQUIRED_RO: [keyof ProjectPayloadInput, string][] = [
  ['title', 'Titlu'],
  ['cardTitle', 'Titlu card'],
  ['summary', 'Descriere card'],
  ['lead', 'Lead'],
  ['contextBody', 'Problema'],
]

// Returns every problem at once rather than the first, so the editor can mark all offending fields in one pass.
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
      issues.push({ field, message: `„${slug}” este rezervat și nu poate fi slug de proiect.` })
    }
  }

  const year = input.year?.trim() ?? ''
  if (year) {
    const max = new Date().getFullYear() + 1
    if (!/^\d{4}$/.test(year) || Number(year) < MIN_YEAR || Number(year) > max) {
      issues.push({ field: 'year', message: `Anul trebuie să fie între ${MIN_YEAR} și ${max}.` })
    }
  }

  if (input.serviceTag && !isServiceTagId(input.serviceTag)) {
    issues.push({ field: 'serviceTag', message: 'Serviciu invalid.' })
  }

  if (input.navServices?.some((tag) => !isServiceTagId(tag))) {
    issues.push({ field: 'navServices', message: 'Serviciu invalid în „Apare în meniu la”.' })
  }

  input.links?.forEach((link, i) => {
    const url = link.url.trim()
    // A blank row is dropped on save; one with notes but no URL would vanish silently.
    if (!url && (link.note?.ro.trim() || link.note?.en.trim())) {
      issues.push({ field: `links.${i}`, message: `Linkul ${i + 1} are note, dar nu are URL.` })
    } else if (url && !(isLinkKind(link.kind) ? isLinkUrl(link.kind, url) : /^https?:\/\//.test(url))) {
      const hint = link.kind === 'walkthrough' ? 'https:// sau cu /' : 'https://'
      issues.push({ field: `links.${i}`, message: `Linkul ${i + 1} trebuie să înceapă cu ${hint}.` })
    }
  })

  // Alt text is only enforced on published projects, so drafts stay saveable mid-work.
  if (input.published) {
    if (input.coverPath?.trim() && !input.coverAlt?.ro.trim()) {
      issues.push({ field: 'coverAlt', message: 'Textul alternativ al copertei (RO) este obligatoriu.' })
    }
    if (input.heroPath?.trim() && !input.heroAlt?.ro.trim()) {
      issues.push({ field: 'heroAlt', message: 'Textul alternativ al capturii principale (RO) este obligatoriu.' })
    }
    input.gallery.forEach((img, i) => {
      if (img.path?.trim() && !img.altRo.trim()) {
        issues.push({ field: `gallery.${i}`, message: `Imaginea ${i + 1} din galerie nu are text alternativ (RO).` })
      }
    })
  }

  return issues
}

/** Drops empty gallery slots so they never reach the not-null `path` column. */
export function usableGallery(gallery: ProjectImageInput[]): ProjectImageInput[] {
  return gallery.filter((img) => !!img.path?.trim())
}
