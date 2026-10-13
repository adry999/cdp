import { describe, expect, it } from 'vitest'
import { visibleServices } from './visibleServices'

describe('visibleServices', () => {
  const slugs = ['website', 'granturi', 'shopify']

  it('drops the grants service while grants are disabled', () => {
    expect(visibleServices(slugs, false)).toEqual(['website', 'shopify'])
  })

  it('keeps every service when grants are enabled', () => {
    expect(visibleServices(slugs, true)).toEqual(slugs)
  })

  it('filters objects by their slug', () => {
    const items = slugs.map((slug) => ({ slug }))
    expect(visibleServices(items, false).map((item) => item.slug)).toEqual(['website', 'shopify'])
  })
})
