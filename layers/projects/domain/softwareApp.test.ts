import { describe, expect, it } from 'vitest'
import { isAppKind, softwareApplicationAbout } from './softwareApp'

describe('isAppKind', () => {
  it('recognises the Romanian and English app kinds', () => {
    expect(isAppKind('Aplicație desktop pentru Windows')).toBe(true)
    expect(isAppKind('Desktop app for Windows')).toBe(true)
    expect(isAppKind('Windows desktop app')).toBe(true)
    expect(isAppKind('  aplicație web')).toBe(true)
  })

  it('rejects other kinds and an empty one', () => {
    expect(isAppKind('Site de business')).toBe(false)
    expect(isAppKind('Web app')).toBe(false)
    expect(isAppKind('')).toBe(false)
  })
})

describe('softwareApplicationAbout', () => {
  it('names the product from the card title before the first colon', () => {
    expect(softwareApplicationAbout('Aplicație desktop', 'Startica: program de evidență pentru grădiniță')).toEqual({
      '@type': 'SoftwareApplication',
      name: 'Startica',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Windows',
    })
  })

  it('is undefined without a colon, a name before it, or an app kind', () => {
    expect(softwareApplicationAbout('Aplicație desktop', 'Program de evidență')).toBeUndefined()
    expect(softwareApplicationAbout('Aplicație desktop', ': fără nume')).toBeUndefined()
    expect(softwareApplicationAbout('Site de business', 'Marca: site')).toBeUndefined()
  })
})
