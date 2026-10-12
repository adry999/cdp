// Which case-study sections have something to show. A section with nothing in it is
// left out entirely, heading included; section numbers stay fixed (01–07).
import type { MappedProject } from '#layers/projects/domain/mapProject'

type CaseStudy = MappedProject['caseStudy']

export interface CaseStudySectionFlags {
  situation: boolean
  task: boolean
  action: boolean
  midway: boolean
  result: boolean
  feedback: boolean
  /** Shots shown in the Action grid: every real shot except the hero, which sits at the top. */
  actionShots: CaseStudy['shots']
}

export function hasQuote(caseStudy: Pick<CaseStudy, 'quote'>): boolean {
  return caseStudy.quote.trim().length > 0
}

export function caseStudySections(caseStudy: CaseStudy): CaseStudySectionFlags {
  const { star } = caseStudy
  const actionShots = caseStudy.shots.filter((shot) => shot.path !== caseStudy.heroPath)
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
    feedback: hasQuote(caseStudy),
    actionShots,
  }
}

export type NumberedSection = 'situation' | 'task' | 'action' | 'midway' | 'result' | 'feedback' | 'gallery' | 'blog'

const SECTION_ORDER: readonly NumberedSection[] = [
  'situation', 'task', 'action', 'midway', 'result', 'feedback', 'gallery', 'blog',
]

/** Sequential labels ("01", "02", ...) for the sections that are shown, in page order. Hidden sections get an empty string. */
export function numberSections(visible: Record<NumberedSection, boolean>): Record<NumberedSection, string> {
  const numbers = Object.fromEntries(SECTION_ORDER.map((key) => [key, ''])) as Record<NumberedSection, string>
  let next = 1
  for (const key of SECTION_ORDER) {
    if (visible[key]) numbers[key] = String(next++).padStart(2, '0')
  }
  return numbers
}
