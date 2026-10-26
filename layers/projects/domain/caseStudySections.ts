// Which case-study sections have something to show. A section with nothing in it is
// left out entirely, heading included; the numbers of the sections that remain stay sequential.
import type { MappedProject } from '#layers/projects/domain/mapProject'

type CaseStudy = MappedProject['caseStudy']

export interface CaseStudySectionFlags {
  situation: boolean
  task: boolean
  action: boolean
  midway: boolean
  result: boolean
  adapt: boolean
  feedback: boolean
  faq: boolean
  /** Shots shown in the Action grid: the first few real shots except the hero, which sits at the top. The gallery has them all, so a project whose gallery would be repeated whole shows none here. */
  actionShots: CaseStudy['shots']
}

const ACTION_SHOT_LIMIT = 3

export interface ShotCaption {
  title: string
  text: string
}

/**
 * Captions for the gallery, from each shot's alt text ("Screen: what it shows").
 * Only when every shot has its own alt: a project whose shots share one generic alt gets none.
 */
function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1)
}

export function shotCaptions(shots: CaseStudy['shots']): ShotCaption[] | null {
  const alts = shots.map((shot) => shot.alt.trim())
  if (alts.some((alt) => !alt) || new Set(alts).size !== alts.length) return null
  return alts.map((alt) => {
    const split = alt.indexOf(': ')
    return split === -1 ? { title: '', text: alt } : { title: alt.slice(0, split), text: capitalize(alt.slice(split + 2)) }
  })
}

export function hasQuote(caseStudy: Pick<CaseStudy, 'quote'>): boolean {
  return caseStudy.quote.trim().length > 0
}

export function caseStudySections(caseStudy: CaseStudy): CaseStudySectionFlags {
  const { star } = caseStudy
  const galleryShots = caseStudy.shots.filter((shot) => shot.path !== caseStudy.heroPath)
  const actionShots = galleryShots.length > ACTION_SHOT_LIMIT ? galleryShots.slice(0, ACTION_SHOT_LIMIT) : []
  return {
    situation: caseStudy.problemParagraphs.length > 0 || star.cost.length > 0,
    task: !!star.goal || star.constraints.length > 0,
    action:
      caseStudy.solutionParagraphs.length > 0 ||
      star.biz.length > 0 ||
      caseStudy.stack.length > 0 ||
      actionShots.length > 0,
    midway: star.incident !== null || caseStudy.obstacleParagraphs.length > 0,
    result: caseStudy.resultParagraphs.length > 0 || star.gains.length > 0 || star.savings.length > 0,
    adapt: caseStudy.adapt !== null,
    feedback: hasQuote(caseStudy),
    faq: caseStudy.faq !== null,
    actionShots,
  }
}

// Only the story sections carry a number; adapt, gallery, faq and blog stay unnumbered.
export type NumberedSection = 'situation' | 'task' | 'action' | 'midway' | 'result' | 'feedback'

const SECTION_ORDER: readonly NumberedSection[] = ['situation', 'task', 'action', 'midway', 'result', 'feedback']

/** Sequential labels ("01", "02", ...) for the sections that are shown, in page order. Hidden sections get an empty string. */
export function numberSections(visible: Record<NumberedSection, boolean>): Record<NumberedSection, string> {
  const numbers = Object.fromEntries(SECTION_ORDER.map((key) => [key, ''])) as Record<NumberedSection, string>
  let next = 1
  for (const key of SECTION_ORDER) {
    if (visible[key]) numbers[key] = String(next++).padStart(2, '0')
  }
  return numbers
}

/** The screenshot's own alt text; the generic one only when it is empty or the editor's "—" placeholder. */
export function shotAlt(alt: string, fallback: string): string {
  const own = alt.trim()
  return own && own !== '—' ? own : fallback
}

/** Up to three screenshots read as a short set: the first fills the row, the rest sit side by side. */
export function isCompactGallery(shotCount: number): boolean {
  return shotCount > 0 && shotCount <= 3
}
