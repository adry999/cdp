import { caseStudyPaths } from '#layers/projects/domain/caseStudyPaths'
import { mapProject, projectHasEnglish, type ProjectRow } from '#layers/projects/domain/mapProject'
import type { StarFigure } from '#layers/projects/domain/star'

type Locale = 'ro' | 'en'

export interface LlmsProjectItem {
  title: string
  path: string
}

const LABELS = {
  ro: {
    kind: 'Tip',
    year: 'An',
    tech: 'Tehnologii',
    situation: 'Situația',
    goal: 'Obiectivul',
    constraints: 'Constrângeri',
    solution: 'Soluția',
    stack: 'Stack',
    obstacles: 'Obstacole și schimbări',
    result: 'Rezultatul',
    delivered: 'Livrat',
    faq: 'Întrebări frecvente',
    quote: 'Citat',
  },
  en: {
    kind: 'Type',
    year: 'Year',
    tech: 'Tech',
    situation: 'Situation',
    goal: 'Goal',
    constraints: 'Constraints',
    solution: 'Solution',
    stack: 'Stack',
    obstacles: 'Obstacles and changes',
    result: 'Result',
    delivered: 'Delivered',
    faq: 'Frequently asked questions',
    quote: 'Quote',
  },
} as const

/** Rows that have a public page in this locale: every one in RO, only the translated ones in EN. */
export function llmsProjectRows<T extends Pick<ProjectRow, 'title_en' | 'lead_en'>>(rows: readonly T[], locale: Locale): T[] {
  return locale === 'en' ? rows.filter(projectHasEnglish) : [...rows]
}

function pathFor(row: Pick<ProjectRow, 'slug_ro' | 'slug_en'>, locale: Locale): string {
  return caseStudyPaths(row.slug_ro, row.slug_en)[locale]
}

/** Titles and paths for `llms.txt`. */
export function llmsProjectItems(rows: readonly ProjectRow[], locale: Locale): LlmsProjectItem[] {
  return llmsProjectRows(rows, locale).map((row) => ({
    title: mapProject(row, locale).caseStudy.heroTitle || row.slug_ro,
    path: pathFor(row, locale),
  }))
}

const figures = (items: readonly StarFigure[]) => items.map((f) => [f.v, f.k].filter(Boolean).join(' ')).filter(Boolean)
const bullets = (items: readonly string[]) => items.map((item) => `- ${item}`).join('\n')

/** One case study as plain text for `llms-full.txt`: only fields the public page shows. */
export function projectLlmsSection(row: ProjectRow, locale: Locale, origin: string): string {
  const t = LABELS[locale]
  const { caseStudy: c, kind } = mapProject(row, locale)
  const blocks: string[] = [`### ${c.heroTitle}`, `URL: ${origin}${pathFor(row, locale)}`, c.heroLead]

  const meta = [
    kind && `${t.kind}: ${kind}`,
    c.year && `${t.year}: ${c.year}`,
    c.tech.length > 0 && `${t.tech}: ${c.tech.join(', ')}`,
  ].filter(Boolean)
  if (meta.length) blocks.push(meta.join('\n'))

  const section = (heading: string, body: string[]) => {
    const parts = body.filter((part) => part.trim())
    if (parts.length) blocks.push(`#### ${heading}\n\n${parts.join('\n\n')}`)
  }

  const { star } = c
  const incident = star.incident
    ? [[star.incident.found, star.incident.risk, star.incident.action].filter(Boolean).join(' '), bullets(figures(star.incident.outcome))]
    : []
  section(t.situation, [...c.problemParagraphs, bullets(figures(star.cost))])
  section(t.goal, [star.goal])
  section(t.constraints, [bullets(star.constraints.map((k) => `${k.k}: ${k.v}`))])
  section(t.solution, [...c.solutionParagraphs, bullets(star.biz)])
  section(t.stack, [bullets(c.stack.map((s) => (s.role ? `${s.name}: ${s.role}` : s.name)))])
  section(t.obstacles, [...c.obstacleParagraphs, ...incident])
  section(t.result, [...c.resultParagraphs, bullets(figures(star.gains)), bullets(figures(star.savings))])
  section(t.delivered, [bullets((c.delivered?.items ?? []).map((i) => `${i.k}: ${i.v}`))])
  section(
    t.faq,
    (c.faq?.items ?? []).map((i) => `**Q: ${i.q}**\nA: ${i.a}`),
  )
  if (c.quote) blocks.push(`${t.quote}: "${c.quote}"${c.attribution ? ` (${c.attribution})` : ''}`)

  return `${blocks.join('\n\n')}\n`
}

/** Every case study available in the locale, as `llms-full.txt` sections. */
export function projectsLlmsSections(rows: readonly ProjectRow[], locale: Locale, origin: string): string[] {
  return llmsProjectRows(rows, locale).map((row) => projectLlmsSection(row, locale, origin))
}
