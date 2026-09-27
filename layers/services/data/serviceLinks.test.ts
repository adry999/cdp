import { describe, expect, it } from 'vitest'
import { SERVICES } from './services'
import { SERVICE_LINKS } from './serviceLinks'

describe('SERVICE_LINKS', () => {
  it('mirrors the nav fields of SERVICES', () => {
    expect(SERVICE_LINKS).toEqual(
      SERVICES.map(({ slug, routeSlug, name, qualifierStage }) => ({ slug, routeSlug, name, qualifierStage })),
    )
  })
})
