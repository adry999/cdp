// The sections of a service page in page order. Related projects, blog posts and FAQ show only when
// there is something in them; the numbers of the sections that remain stay sequential, from the hero's "00".
export type ServiceSection = 'hero' | 'features' | 'process' | 'projects' | 'blog' | 'faq' | 'cta'

const SECTION_ORDER: readonly ServiceSection[] = ['hero', 'features', 'process', 'projects', 'blog', 'faq', 'cta']

/** Sequential labels ("00", "01", ...) for the sections that are shown. Hidden sections get an empty string. */
export function numberServiceSections(visible: Record<ServiceSection, boolean>): Record<ServiceSection, string> {
  const numbers = Object.fromEntries(SECTION_ORDER.map((key) => [key, ''])) as Record<ServiceSection, string>
  let next = 0
  for (const key of SECTION_ORDER) {
    if (visible[key]) numbers[key] = String(next++).padStart(2, '0')
  }
  return numbers
}
