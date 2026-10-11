import { describe, expect, it } from 'vitest'
import { TECH_ICONS, techIcon } from './techIcons'

describe('techIcon', () => {
  it('returns the logo for a known technology', () => {
    expect(techIcon('Nuxt')).toBe('logos:nuxt-icon')
  })

  it('returns nothing for an unknown label or no label', () => {
    expect(techIcon('Cobol')).toBeUndefined()
    expect(techIcon(undefined)).toBeUndefined()
  })

  it('uses only the locally installed collections', () => {
    for (const name of Object.values(TECH_ICONS)) {
      expect(name).toMatch(/^(logos|lucide|simple-icons):[a-z0-9-]+$/)
    }
  })
})
