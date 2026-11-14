import { describe, expect, it } from 'vitest'
import { numberServiceSections, type ServiceSection } from './sections'

const ALL: Record<ServiceSection, boolean> = {
  hero: true,
  features: true,
  process: true,
  projects: true,
  blog: true,
  faq: true,
  cta: true,
}

describe('numberServiceSections', () => {
  it('numbers every section from 00 when all are shown', () => {
    expect(numberServiceSections(ALL)).toEqual({
      hero: '00',
      features: '01',
      process: '02',
      projects: '03',
      blog: '04',
      faq: '05',
      cta: '06',
    })
  })

  it('closes the gap left by a page without blog posts', () => {
    const numbers = numberServiceSections({ ...ALL, blog: false })
    expect(numbers).toMatchObject({ projects: '03', blog: '', faq: '04', cta: '05' })
  })

  it('closes the gap left by a page without projects or blog posts', () => {
    const numbers = numberServiceSections({ ...ALL, projects: false, blog: false })
    expect(numbers).toMatchObject({ process: '02', projects: '', blog: '', faq: '03', cta: '04' })
  })

  it('keeps the closing call to action last when the FAQ is missing too', () => {
    const numbers = numberServiceSections({ ...ALL, projects: false, blog: false, faq: false })
    expect(numbers.cta).toBe('03')
  })
})
