import { describe, expect, it } from 'vitest'
import type { LocalizedText } from '#layers/core/shared/types/localizedText'
import { STAGE_IDS } from '#layers/core/shared/types/service-stage'
import { SERVICES } from './services'

function allLocalizedTexts(): LocalizedText[] {
  const texts: LocalizedText[] = []
  for (const service of SERVICES) {
    texts.push(service.name)
    texts.push(service.intro)
    texts.push(...service.features)
    for (const step of service.process) {
      texts.push(step.title)
      texts.push(step.body)
    }
  }
  return texts
}

describe('services data', () => {
  it('has exactly 5 services', () => {
    expect(SERVICES.length).toBe(5)
  })

  it('has unique slugs', () => {
    const slugs = SERVICES.map((s) => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('has unique route slugs per locale', () => {
    const ro = SERVICES.map((s) => s.routeSlug.ro)
    const en = SERVICES.map((s) => s.routeSlug.en)
    expect(new Set(ro).size).toBe(ro.length)
    expect(new Set(en).size).toBe(en.length)
  })

  it('requires both ro and en for every localized field', () => {
    for (const text of allLocalizedTexts()) {
      expect(text.ro.trim()).not.toBe('')
      expect(text.en.trim()).not.toBe('')
    }
  })

  it('has priceFrom null for all entries', () => {
    for (const service of SERVICES) {
      expect(service.priceFrom).toBeNull()
    }
  })

  it('has a valid qualifierStage for each service', () => {
    for (const service of SERVICES) {
      expect((STAGE_IDS as readonly string[]).includes(service.qualifierStage)).toBe(true)
    }
  })

  it('has at least 4 features per service', () => {
    for (const service of SERVICES) {
      expect(service.features.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('has at least 3 process steps per service', () => {
    for (const service of SERVICES) {
      expect(service.process.length).toBeGreaterThanOrEqual(3)
    }
  })
})
