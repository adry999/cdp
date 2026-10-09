import { describe, expect, it } from 'vitest'
import { xDefaultLocale } from './xDefaultLocale'

describe('xDefaultLocale', () => {
  it('is RO for the blog index, categories and articles', () => {
    expect(xDefaultLocale('/blog')).toBe('ro')
    expect(xDefaultLocale('/blog/')).toBe('ro')
    expect(xDefaultLocale('/blog/cat-costa-un-site')).toBe('ro')
    expect(xDefaultLocale('/blog/categorie/preturi')).toBe('ro')
  })

  it('stays EN everywhere else', () => {
    expect(xDefaultLocale('/')).toBe('en')
    expect(xDefaultLocale('/proiecte/truckerhq')).toBe('en')
    expect(xDefaultLocale('/blogger')).toBe('en')
  })
})
